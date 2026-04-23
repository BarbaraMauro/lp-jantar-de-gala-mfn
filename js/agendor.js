/* ══════════════════════════════════════════════════════
   AGENDOR CRM — Integração de Leads
   Jantar de Gala MFN | IBREI — 5ª Edição

   Documentação: https://api.agendor.com.br/v3/
   Autenticação: Bearer Token (API Key)
   Funil: SDR | Etapa: Lead Novo
══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   CONFIGURAÇÃO — preencha com suas credenciais Agendor
───────────────────────────────────────────────────────
   TOKEN   : Configurações → Integrações → API Token
   FUNNEL  : ID do Funil SDR  (GET /v3/funnels)
   STAGE   : ID da etapa "Lead Novo" (GET /v3/funnels/{id}/stages)
   PRODUCTS: IDs dos produtos cadastrados no Agendor
             (GET /v3/products)
───────────────────────────────────────────────────────*/
const AGENDOR_CONFIG = {
  token:          '55eda00a-2b23-445c-8673-ec6333f5bfc1',   // ← substitua pelo seu API Token
  funnelId:       0,   // ← ID do Funil SDR
  stageId:        0,   // ← ID da etapa "Lead Novo"
  products: {
    ingresso:     { name: 'Jantar de Gala',               value: 1000 },
    patrocinio:   { name: 'Patrocínio Prata',              value: 15000 },
    apoiador:     { name: 'Apoiador 3k Jantar de Gala',   value: 3000 },
  },
};

const AGENDOR_BASE = 'https://api.agendor.com.br/v3';

/* ─────────────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────────────*/
function agendorHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${AGENDOR_CONFIG.token}`,
  };
}

/**
 * Verifica se a configuração mínima está preenchida.
 * Retorna false (silencioso) se o token não foi configurado,
 * evitando erros desnecessários em ambiente de desenvolvimento.
 */
function agendorConfigured() {
  return (
    AGENDOR_CONFIG.token   !== 'SEU_TOKEN_AGENDOR_AQUI' &&
    AGENDOR_CONFIG.token   !== '' &&
    AGENDOR_CONFIG.funnelId > 0 &&
    AGENDOR_CONFIG.stageId  > 0
  );
}

/**
 * Busca ou cria uma Pessoa no Agendor pelo e-mail.
 * Retorna o ID da pessoa criada/encontrada.
 */
async function upsertPerson({ name, email, phone, company, role }) {
  // Tenta localizar pelo e-mail
  const searchRes = await fetch(
    `${AGENDOR_BASE}/people?q=${encodeURIComponent(email)}&per_page=1`,
    { headers: agendorHeaders() }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id; // pessoa já existe
    }
  }

  // Cria nova Pessoa
  const personBody = {
    name,
    email,
    contact: { whatsapp: phone },
    role,
  };

  // Se empresa foi informada, busca/cria organização primeiro
  let organizationId = null;
  if (company) {
    organizationId = await upsertOrganization(company);
    if (organizationId) personBody.organization = { id: organizationId };
  }

  const createRes = await fetch(`${AGENDOR_BASE}/people`, {
    method:  'POST',
    headers: agendorHeaders(),
    body:    JSON.stringify(personBody),
  });

  if (!createRes.ok) {
    console.warn('[Agendor] Falha ao criar pessoa:', await createRes.text());
    return null;
  }

  const createData = await createRes.json();
  return createData.data?.id || null;
}

/**
 * Busca ou cria uma Organização (empresa) no Agendor.
 * Retorna o ID da organização.
 */
async function upsertOrganization(companyName) {
  const searchRes = await fetch(
    `${AGENDOR_BASE}/organizations?q=${encodeURIComponent(companyName)}&per_page=1`,
    { headers: agendorHeaders() }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }
  }

  const createRes = await fetch(`${AGENDOR_BASE}/organizations`, {
    method:  'POST',
    headers: agendorHeaders(),
    body:    JSON.stringify({ name: companyName }),
  });

  if (!createRes.ok) return null;
  const createData = await createRes.json();
  return createData.data?.id || null;
}

/**
 * Cria um Negócio (Deal) no Funil SDR, etapa "Lead Novo".
 */
async function createDeal({ personId, title, value, productName, description }) {
  const dealBody = {
    title,
    value,
    funnel: { id: AGENDOR_CONFIG.funnelId },
    stage:  { id: AGENDOR_CONFIG.stageId  },
    person: { id: personId },
    description,
    products: productName
      ? [{ name: productName, price: value, quantity: 1 }]
      : [],
  };

  const res = await fetch(`${AGENDOR_BASE}/deals`, {
    method:  'POST',
    headers: agendorHeaders(),
    body:    JSON.stringify(dealBody),
  });

  if (!res.ok) {
    console.warn('[Agendor] Falha ao criar negócio:', await res.text());
    return null;
  }

  const data = await res.json();
  return data.data?.id || null;
}

/* ─────────────────────────────────────────────────────
   FUNÇÃO PRINCIPAL — enviar lead ao Agendor
   Parâmetros:
     leadData  : { name, email, phone, company, role }
     dealData  : { productKey, description }
─────────────────────────────────────────────────────*/
async function sendLeadToAgendor(leadData, dealKey) {
  if (!agendorConfigured()) {
    console.info('[Agendor] Integração não configurada — lead não enviado.');
    return;
  }

  const product = AGENDOR_CONFIG.products[dealKey];
  if (!product) {
    console.warn('[Agendor] Produto não encontrado:', dealKey);
    return;
  }

  try {
    // 1. Criar/localizar a Pessoa
    const personId = await upsertPerson(leadData);
    if (!personId) return;

    // 2. Criar o Negócio no Funil SDR
    const dealTitle = `${product.name} — ${leadData.name}`;
    const description = [
      `Produto: ${product.name}`,
      `Empresa: ${leadData.company || '—'}`,
      `Cargo: ${leadData.role || '—'}`,
      `WhatsApp: ${leadData.phone || '—'}`,
      `Origem: Landing Page Jantar de Gala MFN | IBREI`,
    ].join('\n');

    await createDeal({
      personId,
      title:       dealTitle,
      value:       product.value,
      productName: product.name,
      description,
    });

    console.info(`[Agendor] Lead criado com sucesso: ${dealTitle}`);
  } catch (err) {
    // Falha silenciosa — não bloqueia o fluxo do formulário
    console.warn('[Agendor] Erro ao enviar lead:', err.message);
  }
}

/* ─────────────────────────────────────────────────────
   EXPORTA PARA O ESCOPO GLOBAL
   (usado pelo main.js sem necessidade de módulos ES)
─────────────────────────────────────────────────────*/
window.AgendorCRM = {
  sendLead: sendLeadToAgendor,
  config:   AGENDOR_CONFIG,
};
