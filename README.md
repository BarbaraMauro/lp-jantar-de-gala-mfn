# 🥂 5ª Edição do Jantar de Gala MFN | IBREI
## Landing Page de Alta Conversão

Landing page premium desenvolvida para capturar inscrições e interesse em patrocínio do **5º Jantar de Gala MFN | IBREI**, posicionado como o principal evento de networking executivo do mercado imobiliário e financeiro nacional.

### Última atualização
- **Comprovante de pagamento (PIX e Cartão):** botão redireciona para WhatsApp `+5511992075511` com mensagem pré-formatada "Olá, realizei meu pagamento e encaminho em anexo o comprovante"
- **Formulário de patrocínio:** após envio, redireciona para WhatsApp `+551197829672` com mensagem personalizada contendo os dados do formulário
- **Fotos dos Speakers:** estrutura preparada para `images/speaker-jorge-lima.jpg`, `speaker-luiz-alberto.jpg`, `speaker-paulo-correa.jpg`, `speaker-daniella-marques.jpg`
- **Fotos dos Realizadores:** estrutura preparada para `images/realizador-gislaine-toth.jpg`, `realizador-mauricio-prazak.jpg`
- **Fallback de imagens:** se alguma foto não carregar, exibe ícone premium automaticamente

---

## ✅ Funcionalidades Implementadas

### Conversão de Inscrições
- **Hero** com promessa forte, metadados do evento e countdown em tempo real
- **Barra de urgência** fixa no topo com contagem regressiva de vagas
- **3 tipos de ingresso** (Individual R$1.200 / VIP Executivo R$2.500 / Mesa Corporativa R$9.500)
- **Formulário de inscrição** com validação, seleção automática via cards e persistência na API
- **Trust bar** com selos de segurança e prova social

### Conversão de Patrocínio Prata
- **Seção dedicada** com proposta de valor, benefícios e urgência (3 cotas · 1 reservada)
- **Card premium** do pacote com preço e lista de benefícios
- **Formulário separado** para captação de leads de patrocinadores

### Autoridade & Prova Social
- **Números animados** (4 edições / 800+ executivos / 200 vagas / 98% aprovação)
- **3 depoimentos** com foto, nome e cargo
- **Citação em destaque** com ROI real ("R$ 40 milhões")
- **Seção de vídeo** (aftermovie) com modal player
- **Seção de realizadores** (MFN e IBREI)

### UX & Interatividade
- Countdown ao vivo para 28/Nov/2025
- Partículas animadas no hero
- Scroll reveal em todos os elementos
- Scroll spy no menu (link ativo por seção)
- FAQ accordion com animação
- Menu hambúrguer responsivo com trap de foco
- Botão voltar ao topo
- Navegação suave em todos os anchors

---

## 📁 Estrutura de Arquivos

```
index.html        → Página única completa
css/
  style.css       → Design system premium (Dark & Gold · ~850 linhas)
js/
  main.js         → Lógica completa (countdown, forms, reveal, FAQ)
README.md         → Esta documentação
```

---

## 🎨 Design System

| Elemento      | Valor                          |
|---------------|-------------------------------|
| Tema          | Dark premium com dourado      |
| Gold          | `#C9A84C`                     |
| Background    | `#08080E`                     |
| Tipografia    | Cormorant Garamond (display) + Inter (corpo) |
| Border        | `rgba(201,168,76,.12)`        |

---

## 🗄️ Estrutura de Dados

### `registrations` — Inscrições no evento
| Campo         | Tipo  | Descrição                                |
|---------------|-------|------------------------------------------|
| `id`          | text  | UUID único                               |
| `name`        | text  | Nome completo do participante            |
| `email`       | text  | E-mail corporativo                       |
| `phone`       | text  | WhatsApp                                 |
| `company`     | text  | Empresa                                  |
| `role`        | text  | Cargo / função                           |
| `ticket_type` | text  | `individual` / `vip-executivo` / `mesa-corporativa` |

### `sponsors` — Leads de patrocínio
| Campo     | Tipo       | Descrição                           |
|-----------|------------|-------------------------------------|
| `id`      | text       | UUID único                          |
| `name`    | text       | Nome do contato                     |
| `company` | text       | Empresa interessada                 |
| `email`   | text       | E-mail corporativo                  |
| `phone`   | text       | WhatsApp                            |
| `message` | rich_text  | Contexto / interesse no patrocínio  |

---

## 🔗 Endpoints da API

| Ação                       | Método | URL                    |
|----------------------------|--------|------------------------|
| Criar inscrição            | POST   | `tables/registrations` |
| Listar inscrições          | GET    | `tables/registrations` |
| Criar lead de patrocínio   | POST   | `tables/sponsors`      |
| Listar leads de patrocínio | GET    | `tables/sponsors`      |

---

## 📐 Estrutura de Conversão (Fluxo da Página)

```
[Urgency Bar] → "Apenas 37 vagas"
     ↓
[Hero] → Promessa forte + CTA principal + Countdown
     ↓
[Autoridade] → Números animados (4 edições, 800+, 98%)
     ↓
[Sobre] → Reframing: "não é jantar, é sala de negócios"
     ↓
[Experiência] → Timeline que justifica valor hora a hora
     ↓
[Perfil] → "quem vai estar lá" — ativa FOMO
     ↓
[Vídeo + Prova] → Aftermovie + depoimento de ROI
     ↓
[Depoimentos] → 3 testemunhos executivos com cargo
     ↓
[Ingressos + Form] → Seleção + captura imediata
     ↓
[Patrocínio Prata] → CTA secundário com urgência de cotas
     ↓
[FAQ] → Remove objeções restantes
     ↓
[CTA Final] → Última chance com reforço emocional
```

---

## 🚧 Próximos Passos Recomendados

- [ ] Inserir logo real da MFN e IBREI
- [ ] Integrar link real do aftermovie (YouTube embed)
- [ ] Conectar com gateway de pagamento (Stripe / Pagar.me)
- [ ] Adicionar pixel de rastreamento (Meta Ads / Google Ads)
- [ ] Criar painel admin para visualizar inscrições e leads
- [ ] Adicionar fotos reais dos palestrantes confirmados
- [ ] Integrar com CRM ou ferramenta de e-mail marketing
- [ ] Implementar OG tags completas para compartilhamento social
- [ ] A/B test: testar variações do headline do hero

---

## 📅 Dados do Evento (5ª Edição)

| Item          | Detalhe                            |
|---------------|------------------------------------|
| Data          | 28 de Novembro de 2025             |
| Horário       | 19h00 às 23h30                     |
| Local         | Grand Hyatt São Paulo              |
| Capacidade    | 200 convidados (curados)           |
| Dress Code    | Black tie / Passeio completo       |
