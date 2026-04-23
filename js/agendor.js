/* ══════════════════════════════════════════════════════
   AGENDOR CRM — Integração de Leads
   Jantar de Gala MFN | IBREI — 5ª Edição

   Documentação: https://api.agendor.com.br/v3/
   Autenticação: Token API
   Funil: SDR | Etapa: Lead Novo
   Auto-descoberta de IDs na inicialização
══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   CONFIGURAÇÃO
─────────────────────────────────────────────────────*/
const AGENDOR_TOKEN   = '55eda00a-2b23-445c-8673-ec6333f5bfc1';
const AGENDOR_EMAIL   = 'marketing@grupomfn.com.br';
const AGENDOR_BASE    = 'https://api.agendor.com.br/v3';

// Nomes a localizar automaticamente (busca case-insensitive)
const FUNNEL_NAME     = 'SDR';       // nome do funil no Agendor
const STAGE_NAME      = 'Lead Novo'; // nome da etapa no Agendor

// Produtos fixos conforme mapeamento solicitado
const AGENDOR_PRODUCTS = {
  ingresso:   { name: 'Jantar de Gala',             value: 1000  },
  patrocinio: { name: 'Patrocínio Prata',            value: 15000 },
  apoiador:   { name: 'Apoiador 3k Jantar de Gala', value: 3000  },
};

// IDs resolvidos em tempo de execução (auto-descoberta)
let _resolvedFunnelId = null;
let _resolvedStageId  = null;
let _initPromise      = null; // garante que a descoberta roda apenas 1x

/* ─────────────────────────────────────────────────────
   HELPERS INTERNOS
─────────────────────────────────────────────────────*/
function _headers() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Token ${AGENDOR_TOKEN}`,
    'X-User-Email':  AGENDOR_EMAIL,
  };
}

async function _get(path) {
  const res = await fetch(`${AGENDOR_BASE}${path}`, { headers: _headers() });
  if (!res.ok) throw new Error(`Agendor GET ${path} → ${res.status}`);
  return res.json();
}

async function _post(path, body) {
  const res = await fetch(`${AGENDOR_BASE}${path}`, {
    method:  'POST',
    headers: _headers(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Agendor POST ${path} → ${res.status}: ${txt}`);
  }
  return res.json();
}

/* ─────────────────────────────────────────────────────
   AUTO-DESCOBERTA — Funil SDR + Etapa "Lead Novo"
─────────────────────────────────────────────────────*/
async function _init() {
  if (_resolvedFunnelId && _resolvedStageId) return; // já resolvido

  // 1. Lista todos os funis
  const funnelsData = await _get('/funnels');
  const funnels     = funnelsData.data || funnelsData || [];

  // Localiza o funil cujo nome contenha "SDR" (case-insensitive)
  const funnel = funnels.find(f =>
    (f.name || '').toLowerCase().includes(FUNNEL_NAME.toLowerCase())
  );

  if (!funnel) {
    // Se não achar "SDR", usa o primeiro disponível
    const fallback = funnels[0];
    if (!fallback) throw new Error('[Agendor] Nenhum funil encontrado.');
    _resolvedFunnelId = fallback.id;
    console.warn(`[Agendor] Funil "${FUNNEL_NAME}" não encontrado. Usando: "${fallback.name}" (id ${fallback.id})`);
  } else {
    _resolvedFunnelId = funnel.id;
    console.info(`[Agendor] Funil encontrado: "${funnel.name}" (id ${funnel.id})`);
  }

  // 2. Lista etapas do funil encontrado
  const stagesData = await _get(`/funnels/${_resolvedFunnelId}/stages`);
  const stages     = stagesData.data || stagesData || [];

  // Localiza a etapa "Lead Novo" (case-insensitive)
  const stage = stages.find(s =>
    (s.name || '').toLowerCase().includes(STAGE_NAME.toLowerCase())
  );

  if (!stage) {
    // Se não achar "Lead Novo", usa a primeira etapa
    const fallback = stages[0];
    if (!fallback) throw new Error('[Agendor] Nenhuma etapa encontrada no funil.');
    _resolvedStageId = fallback.id;
    console.warn(`[Agendor] Etapa "${STAGE_NAME}" não encontrada. Usando: "${fallback.name}" (id ${fallback.id})`);
  } else {
    _resolvedStageId = stage.id;
    console.info(`[Agendor] Etapa encontrada: "${stage.name}" (id ${stage.id})`);
  }
}

/* ─────────────────────────────────────────────────────
   UPSERT ORGANIZAÇÃO (empresa)
─────────────────────────────────────────────────────*/
async function _upsertOrganization(companyName) {
  if (!companyName) return null;
  try {
    const res = await _get(`/organizations?q=${encodeURIComponent(companyName)}&per_page=1`);
    const list = res.data || [];
    if (list.length > 0) return list[0].id;

    const created = await _post('/organizations', { name: companyName });
    return created.data?.id || null;
  } catch (err) {
    console.warn('[Agendor] Org upsert falhou:', err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────────────
   UPSERT PESSOA
─────────────────────────────────────────────────────*/
async function _upsertPerson({ name, email, phone, company, role }) {
  // Tenta localizar pelo e-mail
  try {
    const res  = await _get(`/people?q=${encodeURIComponent(email)}&per_page=1`);
    const list = res.data || [];
    if (list.length > 0) {
      console.info(`[Agendor] Pessoa já existe: ${list[0].name} (id ${list[0].id})`);
      return list[0].id;
    }
  } catch (_) {}

  // Cria nova pessoa
  const body = {
    name,
    email,
    contact: { whatsapp: phone },
    role:    role || '',
  };

  // Vincula empresa se informada
  const orgId = await _upsertOrganization(company);
  if (orgId) body.organization = { id: orgId };

  const created = await _post('/people', body);
  const personId = created.data?.id || null;
  console.info(`[Agendor] Pessoa criada: ${name} (id ${personId})`);
  return personId;
}

/* ─────────────────────────────────────────────────────
   CRIAR NEGÓCIO no Funil SDR
─────────────────────────────────────────────────────*/
async function _createDeal({ personId, title, value, productName, description }) {
  const body = {
    title,
    value,
    funnel:      { id: _resolvedFunnelId },
    stage:       { id: _resolvedStageId  },
    person:      { id: personId          },
    description,
    products: productName
      ? [{ name: productName, price: value, quantity: 1 }]
      : [],
  };

  const res = await _post('/deals', body);
  const dealId = res.data?.id || null;
  console.info(`[Agendor] Negócio criado: "${title}" (id ${dealId})`);
  return dealId;
}

/* ─────────────────────────────────────────────────────
   FUNÇÃO PÚBLICA — sendLeadToAgendor
   leadData  : { name, email, phone, company, role }
   dealKey   : 'ingresso' | 'patrocinio' | 'apoiador'
─────────────────────────────────────────────────────*/
async function sendLeadToAgendor(leadData, dealKey) {
  const product = AGENDOR_PRODUCTS[dealKey];
  if (!product) {
    console.warn('[Agendor] Chave de produto inválida:', dealKey);
    return;
  }

  try {
    // Garante que funil/etapa estão resolvidos (roda apenas 1x)
    if (!_initPromise) _initPromise = _init();
    await _initPromise;

    // Cria/localiza a pessoa
    const personId = await _upsertPerson(leadData);
    if (!personId) throw new Error('Pessoa não criada');

    // Cria o negócio
    const description = [
      `Produto: ${product.name}`,
      `Empresa: ${leadData.company || '—'}`,
      `Cargo:   ${leadData.role    || '—'}`,
      `WhatsApp:${leadData.phone   || '—'}`,
      `Origem:  Landing Page Jantar de Gala MFN | IBREI`,
    ].join('\n');

    await _createDeal({
      personId,
      title:       `${product.name} — ${leadData.name}`,
      value:        product.value,
      productName:  product.name,
      description,
    });

  } catch (err) {
    // Falha silenciosa — nunca bloqueia o formulário
    console.warn('[Agendor] Erro ao enviar lead:', err.message);
  }
}

/* ─────────────────────────────────────────────────────
   EXPÕE NO ESCOPO GLOBAL (usado pelo main.js)
─────────────────────────────────────────────────────*/
window.AgendorCRM = { sendLead: sendLeadToAgendor };
