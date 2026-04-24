/* ══════════════════════════════════════════════════════
   JANTAR DE GALA MFN | IBREI — 5ª Edição
   JavaScript Principal
══════════════════════════════════════════════════════ */

'use strict';

/* ─── CONSTANTS ─────────────────────────────────────── */
const AGENDOR_PRODUCTS = {
  ingresso:   { name: 'Jantar de Gala',             value: 1000  },
  patrocinio: { name: 'Patrocínio Prata',           value: 15000 },
  apoiador:   { name: 'Apoiador 3k Jantar de Gala', value: 3000  },
};
const EVENT_DATE = new Date('2026-06-08T19:00:00-03:00');

/* ─── DOM HELPERS ───────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════════════════════
   1. NAVBAR — scroll + hamburger
═══════════════════════════════════════════════════════ */
const navbar  = $('#navbar');
const burger  = $('#burger');
const mainNav = $('#main-nav');
const backTop = $('#back-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  backTop.classList.toggle('show', y > 500);
}, { passive: true });

burger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

$$('a[href^="#"]', mainNav).forEach(a => {
  a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ═══════════════════════════════════════════════════════
   2. COUNTDOWN
═══════════════════════════════════════════════════════ */
function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now  = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    $('#countdown').innerHTML = `
      <div style="color:var(--gold);font-family:var(--font-display);font-size:1.4rem;font-style:italic;">
        A noite chegou. Esteja pronto.
      </div>`;
    return;
  }

  const d  = Math.floor(diff / 864e5);
  const h  = Math.floor((diff % 864e5) / 36e5);
  const m  = Math.floor((diff % 36e5) / 6e4);
  const s  = Math.floor((diff % 6e4) / 1e3);

  $('#cd-days').textContent  = pad(d);
  $('#cd-hours').textContent = pad(h);
  $('#cd-min').textContent   = pad(m);
  $('#cd-sec').textContent   = pad(s);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ═══════════════════════════════════════════════════════
   3. PARTICLES (hero background)
═══════════════════════════════════════════════════════ */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 16 : 32;
  // Paleta fiel ao logo MFN: ember, ruby, bronze, nude
  const colors = [
    'rgba(233,90,42,',   // ember principal
    'rgba(210,65,25,',   // ember escuro
    'rgba(166,0,23,',    // ruby
    'rgba(184,100,42,',  // bronze
    'rgba(230,185,143,', // nude/bege
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size  = Math.random() * 2.5 + 0.8;
    const x     = Math.random() * 100;
    const dur   = Math.random() * 22 + 18;
    const del   = Math.random() * -22;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const alpha = (Math.random() * .35 + .08).toFixed(2);
    el.style.cssText = `
      left:${x}%;
      bottom:${Math.random() * 25}%;
      width:${size}px;
      height:${size}px;
      background:${color}${alpha});
      box-shadow:0 0 ${size * 3}px ${color}0.5);
      animation-duration:${dur}s;
      animation-delay:${del}s;
    `;
    container.appendChild(el);
  }
})();

/* ═══════════════════════════════════════════════════════
   4. ANIMATED NUMBERS (authority band)
═══════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1600) {
  // Prioridade: data-suffix > span com "%" > nenhum
  const dataSuffix = el.dataset.suffix || '';
  const pctSpan = el.closest('.auth-stat')?.querySelector('span')?.textContent || '';
  const suffix = dataSuffix || (pctSpan.includes('%') ? '%' : '');

  let start;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    const current = Math.floor(ease * target);
    el.textContent = current + suffix;
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + suffix;
    }
  };
  requestAnimationFrame(step);
}

const statEls = $$('.auth-stat strong[data-target]');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, +e.target.dataset.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: .5 });

statEls.forEach(el => statObserver.observe(el));

/* ═══════════════════════════════════════════════════════
   5. SCROLL REVEAL
═══════════════════════════════════════════════════════ */
const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════
   6. FAQ ACCORDION
═══════════════════════════════════════════════════════ */
$$('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';
    const answer   = btn.nextElementSibling;
    const faqItem  = btn.closest('.faq__item');

    // close all
    $$('.faq__q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
      b.closest('.faq__item').style.borderColor = '';
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
      faqItem.style.borderColor = 'rgba(201,151,58,.32)';
    }
  });
});

/* ═══════════════════════════════════════════════════════
   7. LOTE ATIVO AUTOMÁTICO (destaca lote conforme data)
═══════════════════════════════════════════════════════ */
(function highlightCurrentLote() {
  const now = new Date();
  const lotes = [
    { deadline: new Date('2026-04-30T23:59:59-03:00'), idx: 0, value: 'lote1' },
    { deadline: new Date('2026-05-15T23:59:59-03:00'), idx: 1, value: 'lote2' },
    { deadline: new Date('2026-05-31T23:59:59-03:00'), idx: 2, value: 'lote3' },
    { deadline: new Date('2026-06-05T23:59:59-03:00'), idx: 3, value: 'integral' },
  ];

  const loteCards = $$('.lote-card');
  let activeLote = lotes[lotes.length - 1]; // fallback = integral

  for (const l of lotes) {
    if (now <= l.deadline) { activeLote = l; break; }
  }

  // Reset all, activate correct one
  loteCards.forEach((c, i) => {
    c.classList.remove('lote-card--active');
    if (i === activeLote.idx) c.classList.add('lote-card--active');
    if (i < activeLote.idx)   c.style.opacity = '.3';
  });

  // Pre-select lote in form
  const loteSelect = $('#r-lote');
  if (loteSelect) loteSelect.value = activeLote.value;
})();

/* ═══════════════════════════════════════════════════════
   8a. COPY PIX KEY
═══════════════════════════════════════════════════════ */
const copyPixBtn  = $('#copy-pix-btn');
const copyPixText = $('#copy-pix-text');
const pixKey      = $('#pix-key');

if (copyPixBtn && pixKey) {
  copyPixBtn.addEventListener('click', async () => {
    const key = pixKey.textContent.trim();
    try {
      await navigator.clipboard.writeText(key);
      copyPixText.textContent = '✓ Chave copiada!';
      copyPixBtn.style.borderColor = 'var(--gold)';
      copyPixBtn.style.color = 'var(--gold)';
      setTimeout(() => {
        copyPixText.textContent = 'Copiar chave PIX';
        copyPixBtn.style.borderColor = '';
        copyPixBtn.style.color = '';
      }, 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = key;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      copyPixText.textContent = '✓ Chave copiada!';
      setTimeout(() => { copyPixText.textContent = 'Copiar chave PIX'; }, 2500);
    }
  });
}

/* ═══════════════════════════════════════════════════════
   8b. REGISTER FORM
═══════════════════════════════════════════════════════ */
const registerForm = $('#register-form');

if (registerForm) {
  // Remove error class on input
  $$('input, select', registerForm).forEach(field => {
    field.addEventListener('input', () => field.classList.remove('field-error'));
    field.addEventListener('change', () => field.classList.remove('field-error'));
  });

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate
    let valid = true;
    $$('[required]', registerForm).forEach(field => {
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        field.classList.add('field-error');
        valid = false;
      }
    });
    if (!valid) {
      const firstError = registerForm.querySelector('.field-error');
      if (firstError) firstError.focus();
      return;
    }

    // Loading state
    const submitBtn  = $('#r-submit');
    const submitText = $('#r-btn-text');
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando…';

    const loteEl     = $('#r-lote');
    const paymentEl  = $('#r-payment');
    const comunidadeEl = $('#r-comunidade');

    const payload = {
      name:           $('#r-name').value.trim(),
      email:          $('#r-email').value.trim(),
      phone:          $('#r-phone').value.trim(),
      company:        $('#r-company').value.trim(),
      role:           $('#r-role').value.trim(),
      lote:           loteEl?.value || '',
      payment_method: paymentEl?.value || '',
      comunidade_c:   comunidadeEl?.value || 'nao',
    };

    try {
      const res = await fetch('tables/registrations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API error');
    } catch (_) {
      // silently continue — show success regardless in demo
    }

    // ── Agendor CRM: enviar lead (fire-and-forget, não bloqueia o fluxo) ──
    if (window.AgendorCRM) {
      window.AgendorCRM.sendLead(
        {
          name:    payload.name,
          email:   payload.email,
          phone:   payload.phone,
          company: payload.company,
          role:    payload.role,
          produto: produto.name,
          valor: produto.value,
          origem: "LP GitHub"
        },
        'ingresso'  // → produto: Jantar de Gala | valor: R$ 1.000
      );
    }

    // Show success
    submitBtn.classList.add('hidden');
    $('#register-success').classList.remove('hidden');
    registerForm.reset();
  });
}

/* ═══════════════════════════════════════════════════════
   9. SPONSOR FORM
═══════════════════════════════════════════════════════ */
const sponsorForm = $('#sponsor-form');

if (sponsorForm) {
  $$('input, select', sponsorForm).forEach(field => {
    field.addEventListener('input', () => field.classList.remove('field-error'));
  });

  sponsorForm.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    $$('[required]', sponsorForm).forEach(field => {
      if (!field.value.trim()) { field.classList.add('field-error'); valid = false; }
    });
    if (!valid) return;

    const submitBtn  = $('#sp-submit');
    const submitText = $('#sp-btn-text');
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando…';

    const payload = {
      name:    $('#sp-name').value.trim(),
      company: $('#sp-company').value.trim(),
      email:   $('#sp-email').value.trim(),
      phone:   $('#sp-phone').value.trim(),
      message: $('#sp-msg').value.trim(),
    };

    try {
      await fetch('tables/sponsors', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
    } catch (_) {}

     if (window.AgendorCRM) {
  const produto = AGENDOR_PRODUCTS['patrocinio'];

  window.AgendorCRM.sendLead(
    {
      name:    payload.name,
      email:   payload.email,
      phone:   payload.phone,
      company: payload.company,
      role:    '',
      produto: produto.name,
      valor:   produto.value,
      origem:  "LP GitHub",
      mensagem: payload.message
    },
    'patrocinio'
  );
}

    submitBtn.classList.add('hidden');
    $('#sponsor-success').classList.remove('hidden');
    sponsorForm.reset();
  });
}

/* ═══════════════════════════════════════════════════════
   10. VIDEO PLAYER (modal-style)
═══════════════════════════════════════════════════════ */
const videoBox = $('#video-box');

if (videoBox) {
  const openVideo = () => {
    const modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,.92);
      display:flex;align-items:center;justify-content:center;
      animation:fade-up .3s ease;
    `;
    modal.innerHTML = `
      <div style="position:relative;width:90%;max-width:860px;">
        <button id="close-modal" aria-label="Fechar vídeo" style="
          position:absolute;top:-44px;right:0;
          background:none;border:none;color:#fff;font-size:1.4rem;
          cursor:pointer;opacity:.7;transition:opacity .2s;
        ">✕ Fechar</button>
        <div style="
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:12px;
          aspect-ratio:16/9;
          display:flex;align-items:center;justify-content:center;
          color:var(--gold);
          font-family:var(--font-display);
          font-size:1.1rem;
          font-style:italic;
          gap:16px;
        ">
          <i class="fa-solid fa-film" style="font-size:2rem;opacity:.5;"></i>
          <span>Aftermovie disponível em breve</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.querySelector('#close-modal').addEventListener('click', closeVideo);
    modal.addEventListener('click', e => { if (e.target === modal) closeVideo(); });

    function closeVideo() {
      modal.remove();
      document.body.style.overflow = '';
    }
  };

  videoBox.addEventListener('click', openVideo);
  videoBox.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(); }
  });
}

/* ═══════════════════════════════════════════════════════
   11. SMOOTH ANCHORS
═══════════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ═══════════════════════════════════════════════════════
   12. ACTIVE NAV LINKS (scroll spy)
═══════════════════════════════════════════════════════ */
const sections = $$('section[id]');
const navLinks  = $$('.navbar__nav a');

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + e.target.id) {
          a.style.color = 'var(--gold)';
        }
      });
    }
  });
}, { threshold: .4 });

sections.forEach(s => spyObserver.observe(s));

/* ═══════════════════════════════════════════════════════
   13. KEYBOARD ACCESSIBILITY — trap focus in mobile nav
═══════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    }
    // Fecha modais com ESC
    closeRegisterModal();
    closeSponsorModal();
  }
});

/* ═══════════════════════════════════════════════════════
   14. MODAL RESERVA DE ASSENTO
═══════════════════════════════════════════════════════ */
const modalRegister = $('#modal-register');

function openRegisterModal() {
  if (!modalRegister) return;
  // Reset ao step 1
  showRegStep('reg-step-1');
  modalRegister.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeRegisterModal() {
  if (!modalRegister || modalRegister.hidden) return;
  modalRegister.hidden = true;
  document.body.style.overflow = '';
}

function showRegStep(stepId) {
  $$('.modal-step', modalRegister).forEach(s => s.classList.add('hidden'));
  const step = $('#' + stepId);
  if (step) step.classList.remove('hidden');
}

// Abrir modal pelo botão da seção de ingressos
const openRegBtn = $('#open-register-modal');
if (openRegBtn) openRegBtn.addEventListener('click', openRegisterModal);

// Abrir modal por qualquer CTA que aponte para #inscricao via botão
$$('a[href="#inscricao"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    openRegisterModal();
  });
});

// Fechar modal
const closeRegBtn = $('#close-register-modal');
if (closeRegBtn) closeRegBtn.addEventListener('click', closeRegisterModal);
if (modalRegister) {
  modalRegister.addEventListener('click', e => {
    if (e.target === modalRegister) closeRegisterModal();
  });
}

// STEP 1 — dados pessoais
const regStep1Form = $('#reg-form-step1');
if (regStep1Form) {
  $$('input, select', regStep1Form).forEach(f => {
    f.addEventListener('input', () => f.classList.remove('field-error'));
  });
  regStep1Form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    $$('[required]', regStep1Form).forEach(f => {
      if (!f.value.trim()) { f.classList.add('field-error'); valid = false; }
    });
    if (!valid) { regStep1Form.querySelector('.field-error')?.focus(); return; }

    // Salva lead
    const _leadName    = $('#m-name').value.trim();
    const _leadEmail   = $('#m-email').value.trim();
    const _leadPhone   = $('#m-phone').value.trim();
    const _leadCompany = $('#m-company').value.trim();
    const _leadRole    = $('#m-role').value.trim();

    try {
      await fetch('tables/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         _leadName,
          email:        _leadEmail,
          phone:        _leadPhone,
          company:      _leadCompany,
          role:         _leadRole,
          lote:         'lote1',
          comunidade_c: $('#m-comunidade').value,
          status:       'lead',
        }),
      });
    } catch (_) {}

    // ── Agendor CRM: enviar lead de ingresso (fire-and-forget) ──
   if (window.AgendorCRM) {
  const produto = AGENDOR_PRODUCTS['ingresso'];

  window.AgendorCRM.sendLead(
    {
      name:    _leadName,
      email:   _leadEmail,
      phone:   _leadPhone,
      company: _leadCompany,
      role:    _leadRole,
      produto: produto.name,
      valor:   produto.value,
      origem:  "LP GitHub"
    },
    'ingresso'
  );
}

// STEP 2 — escolha de pagamento
const payPix  = $('#pay-pix');
const payCard = $('#pay-card');

if (payPix)  payPix.addEventListener('click',  () => showRegStep('reg-step-pix'));
if (payCard) payCard.addEventListener('click', () => showRegStep('reg-step-card'));

// STEP 3A — comprovante PIX
const modalCopyPix  = $('#modal-copy-pix');
const modalPixKey   = $('#modal-pix-key');
const modalCopyText = $('#modal-copy-text');

if (modalCopyPix && modalPixKey) {
  modalCopyPix.addEventListener('click', async () => {
    const key = modalPixKey.textContent.trim();
    try {
      await navigator.clipboard.writeText(key);
    } catch (_) {
      const el = document.createElement('textarea');
      el.value = key; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    modalCopyText.textContent = '✓ Chave copiada!';
    setTimeout(() => { modalCopyText.textContent = 'Copiar chave PIX'; }, 2500);
  });
}

// Upload file label — PIX
const pixFileInput = $('#pix-comp-file');
const pixFileName  = $('#pix-file-name');
if (pixFileInput && pixFileName) {
  pixFileInput.addEventListener('change', () => {
    const f = pixFileInput.files[0];
    if (f) {
      pixFileName.textContent = '📎 ' + f.name;
      pixFileName.classList.remove('hidden');
    }
  });
}

// Envio comprovante PIX
const pixCompForm = $('#pix-comprovante-form');
if (pixCompForm) {
  pixCompForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fileInput = pixCompForm.querySelector('input[type="file"]');
    if (!fileInput.files.length) { fileInput.classList.add('field-error'); return; }

    try {
      await fetch('tables/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         $('#m-name')?.value?.trim() || '',
          email:        $('#m-email')?.value?.trim() || '',
          phone:        $('#m-phone')?.value?.trim() || '',
          payment_method: 'pix',
          comprovante_enviado: true,
          obs:          $('#pix-obs')?.value?.trim() || '',
          status:       'comprovante_enviado',
        }),
      });
    } catch (_) {}

    pixCompForm.classList.add('hidden');
    $('#pix-success').classList.remove('hidden');
    pixFileName?.classList.add('hidden');
  });
}

// Upload file label — Cartão
const cardFileInput = $('#card-comp-file');
const cardFileName  = $('#card-file-name');
if (cardFileInput && cardFileName) {
  cardFileInput.addEventListener('change', () => {
    const f = cardFileInput.files[0];
    if (f) {
      cardFileName.textContent = '📎 ' + f.name;
      cardFileName.classList.remove('hidden');
    }
  });
}

// Envio comprovante Cartão
const cardCompForm = $('#card-comprovante-form');
if (cardCompForm) {
  cardCompForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await fetch('tables/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           $('#m-name')?.value?.trim() || '',
          email:          $('#m-email')?.value?.trim() || '',
          payment_method: 'cartao',
          comprovante_enviado: true,
          status:         'comprovante_enviado',
        }),
      });
    } catch (_) {}

    cardCompForm.classList.add('hidden');
    $('#card-success').classList.remove('hidden');
    cardFileName?.classList.add('hidden');
  });
}

/* ═══════════════════════════════════════════════════════
   15. MODAL PATROCÍNIO
═══════════════════════════════════════════════════════ */
const modalSponsor = $('#modal-sponsor');

function openSponsorModal(btn) {
  if (!modalSponsor) return;
  const cota = btn?.dataset?.modalCota || '';
  const label = $('#sp-modal-cota-label');
  if (label) label.textContent = cota;

  // Reset form
  const form = $('#sponsor-modal-form');
  if (form) { form.reset(); form.classList.remove('hidden'); }
  $('#sp-modal-form')?.classList.remove('hidden');
  $('#sp-modal-success')?.classList.add('hidden');
  $$('.field-error', modalSponsor).forEach(f => f.classList.remove('field-error'));

  modalSponsor.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeSponsorModal() {
  if (!modalSponsor || modalSponsor.hidden) return;
  modalSponsor.hidden = true;
  document.body.style.overflow = '';
}

// Botão principal "Quero conhecer as cotas"
const openSponsorBtn = $('#open-sponsor-modal');
if (openSponsorBtn) {
  openSponsorBtn.addEventListener('click', () => openSponsorModal(openSponsorBtn));
}

// Expor para uso inline nos botões das cotas
window.openSponsorModal = openSponsorModal;

// Fechar modal
const closeSponsorBtn = $('#close-sponsor-modal');
if (closeSponsorBtn) closeSponsorBtn.addEventListener('click', closeSponsorModal);
if (modalSponsor) {
  modalSponsor.addEventListener('click', e => {
    if (e.target === modalSponsor) closeSponsorModal();
  });
}

// Formulário de patrocínio no modal
const sponsorModalForm = $('#sponsor-modal-form');
if (sponsorModalForm) {
  $$('input, textarea', sponsorModalForm).forEach(f => {
    f.addEventListener('input', () => f.classList.remove('field-error'));
  });

  const spmBtn  = $('#spm-submit');
  const spmText = $('#spm-btn-text');

  sponsorModalForm.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    $$('[required]', sponsorModalForm).forEach(f => {
      if (!f.value.trim()) { f.classList.add('field-error'); valid = false; }
    });
    if (!valid) { sponsorModalForm.querySelector('.field-error')?.focus(); return; }

    if (spmBtn)  spmBtn.disabled = true;
    if (spmText) spmText.textContent = 'Enviando…';

    const cota = $('#sp-modal-cota-label')?.textContent || '';

    const name    = $('#spm-name').value.trim();
    const company = $('#spm-company').value.trim();
    const email   = $('#spm-email').value.trim();
    const phone   = $('#spm-phone').value.trim();
    const message = $('#spm-msg').value.trim();

    // Salvar no banco
    try {
      await fetch('tables/sponsors', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email, phone, message, cota }),
      });
    } catch (_) {}

    // ── Agendor CRM: enviar lead (fire-and-forget, não bloqueia o fluxo) ──
    if (window.AgendorCRM) {
      // Identifica a cota pelo texto preenchido no label da modal
      // "Patrocínio Jantar de Gala 2026 — R$ 15.000"  → chave 'patrocinio'
      // "Apoiador Jantar de Gala 2026 — A partir de R$ 3.000" → chave 'apoiador'
       const dealKey = cota.toLowerCase().includes('apoiador') ? 'apoiador' : 'patrocinio';
       const produto = AGENDOR_PRODUCTS[dealKey];
      window.AgendorCRM.sendLead(
        {
          name:    name,
          email:   email,
          phone:   phone,
          company: company,
          role:    '',           // campo não existe no formulário de patrocínio
         produto: produto.name,
         valor:   produto.value,
         origem:  "LP GitHub",
         mensagem: message,
         cota: cota
        },
        dealKey
      );
    }

    // Redirecionar para WhatsApp com mensagem personalizada
    const waMsg = encodeURIComponent(
      `Olá! Gostaria de obter informações sobre patrocínio do Jantar de Gala MFN | IBREI.\n\n` +
      `*Nome:* ${name}\n` +
      `*Empresa:* ${company}\n` +
      `*E-mail:* ${email}\n` +
      `*Telefone:* ${phone}\n` +
      (cota ? `*Cota de interesse:* ${cota}\n` : '') +
      (message ? `*Mensagem:* ${message}` : '')
    );
    window.open(`https://wa.me/5511978279672?text=${waMsg}`, '_blank');

    $('#sp-modal-form').classList.add('hidden');
    $('#sp-modal-success').classList.remove('hidden');
    sponsorModalForm.reset();
    if (spmBtn)  spmBtn.disabled = false;
    if (spmText) spmText.textContent = 'Solicitar informações de patrocínio';
  });
}

/* ═══════════════════════════════════════════════════════
   INIT LOG
═══════════════════════════════════════════════════════ */
console.info('🥂 Jantar de Gala MFN | IBREI — 5ª Edição · Página carregada.');
