/* ══════════════════════════════════════════════════════
   AGENDOR CRM — Integração de Leads
   Jantar de Gala MFN | IBREI — 5ª Edição

   Documentação: https://api.agendor.com.br/v3/
   Autenticação: Token API
   Funil: SDR | Etapa: Lead Novo
   Auto-descoberta de IDs na inicialização
══════════════════════════════════════════════════════ */

'use strict';

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/a1l472inhz95k294uh18u2prp1n2q2r5';

const AGENDOR_PRODUCTS = {
  ingresso:   { name: 'Jantar de Gala',             value: 1000  },
  patrocinio: { name: 'Patrocínio Prata',            value: 15000 },
  apoiador:   { name: 'Apoiador 3k Jantar de Gala', value: 3000  },
};

const _AGENDOR_META = {
  token:  '55eda00a-2b23-445c-8673-ec6333f5bfc1',
  email:  'marketing@grupomfn.com.br',
  funnel: 'SDR',
  stage:  'Lead Novo',
};

async function sendLeadToAgendor(leadData, dealKey) {
  const product = AGENDOR_PRODUCTS[dealKey];
  if (!product) { console.warn('[Agendor] Produto inválido:', dealKey); return; }

  const payload = {
    pessoa_nome:     leadData.name    || '',
    pessoa_email:    leadData.email   || '',
    pessoa_whatsapp: leadData.phone   || '',
    pessoa_cargo:    leadData.role    || '',
    pessoa_empresa:  leadData.company || '',
    negocio_titulo:  product.name + ' — ' + leadData.name,
    negocio_valor:   product.value,
    negocio_produto: product.name,
    negocio_funil:   _AGENDOR_META.funnel,
    negocio_etapa:   _AGENDOR_META.stage,
    negocio_descricao: 'Produto: ' + product.name + '\nEmpresa: ' + (leadData.company||'—') + '\nCargo: ' + (leadData.role||'—') + '\nWhatsApp: ' + (leadData.phone||'—') + '\nOrigem: Landing Page Jantar de Gala MFN | IBREI',
    agendor_token:   _AGENDOR_META.token,
    agendor_email:   _AGENDOR_META.email,
  };

  console.info('[Agendor] Enviando lead:', payload);

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (res.ok) {
      console.info('[Agendor] ✅ Lead enviado com sucesso!');
    } else {
      console.warn('[Agendor] Make erro ' + res.status);
    }
  } catch (err) {
    console.warn('[Agendor] Erro:', err.message);
  }
}

window.AgendorCRM = { sendLead: sendLeadToAgendor };
