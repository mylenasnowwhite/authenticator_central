# Authenticator Central – TOTP Manager (Google Apps Script)

Sistema centralizado de geração de códigos **TOTP (Time-based One-Time Password)** para autenticação em múltiplos serviços (Google, Meta, TikTok, LinkedIn, Bing, RDStation, entre outros), desenvolvido em **Google Apps Script**, com interface web moderna e atualização automática a cada 30 segundos.

O projeto foi criado para **uso interno do time de Data Intelligence**, mantendo a **ordem original de configuração das contas**, sem armazenamento de segredos ou códigos.

---

## ✨ Funcionalidades

- 🔐 Geração de códigos **TOTP compatíveis com RFC 6238**
- ⏱ Atualização automática sincronizada a cada **30 segundos**
- 🧮 Suporte a **SHA-1 e SHA-256**
- 🖥 Interface web responsiva e moderna
- 📋 Botão de cópia rápida para o clipboard
- 🎨 Ícones e cores específicas por serviço
- 🧩 Arquitetura simples, sem dependências externas no backend
- 🔒 Nenhum código ou secret é persistido ou logado

---

## 🏗 Arquitetura


### Backend
- Google Apps Script
- Implementação manual de:
  - Base32 decoding
  - Contador TOTP uint64 (big-endian)
  - HMAC SHA-1 / SHA-256
- Endpoint via `doGet()` retornando JSON

### Frontend
- HTML + CSS + JavaScript
- Font Awesome 6
- Atualização automática a cada 30s
- Renderização dinâmica via `google.script.run`

---

## 🔢 Algoritmos Suportados

| Algoritmo | Status |
|----------|-------|
| SHA-1    | ✅ Suportado |
| SHA-256 | ✅ Suportado |
| SHA-512 | ❌ Não suportado (limitação do Apps Script) |

> ⚠️ **Importante:** Alguns provedores (ex: TikTok, Meta, LinkedIn) podem utilizar variações proprietárias de TOTP, mesmo declarando compatibilidade. Nesses casos, a divergência não é um bug do código.

---

## 🔐 Segurança

- Secrets ficam **apenas no código** (não são enviados ao frontend)
- Códigos TOTP:
  - Não são armazenados
  - Não são persistidos
  - Não são logados
- Geração ocorre **no backend**
- Comunicação frontend ↔ backend via canal seguro do Apps Script

> **Recomendação:** Restringir o acesso ao projeto via permissões do Google Workspace.

---

## 🧩 Configuração de Serviços

As contas são configuradas no backend (`Code.gs`) através do array:

```js
const SECRETS = [
  // [Nome exibido, Secret Base32, Algoritmo]
  ["Google - teste@empresa.com", "BASE32SECRET", 1],
  ["Meta Ads - teste@empresa.com", "BASE32SECRET", 256]
];


