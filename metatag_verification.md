# WebPayback Protocol - Meta Tag Verification System

## Meta Tag di Verifica

Il WebPayback Protocol utilizza un sistema di meta tag per verificare la proprietà dei domini e dei contenuti. I creator devono aggiungere un meta tag specifico alle loro pagine per confermare la proprietà e abilitare il monitoraggio AI.

## Meta Tag Standard

### Formato Base
```html
<meta name="webpayback-verification" content="WPT-VERIFY-{TOKEN}" />
```

### Esempio Completo
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="webpayback-verification" content="WPT-VERIFY-abc123def456" />
  <title>Il Mio Sito</title>
</head>
<body>
  <!-- Contenuto della pagina -->
</body>
</html>
```

## Istruzioni per Piattaforma

### YouTube
Per i video YouTube, aggiungi il token nella descrizione:
```
🎯 WebPayback Protocol Verification: WPT-VERIFY-abc123def456
```

### Instagram
Nel profilo Instagram, aggiungi il token nella bio:
```
🎯 WPT-VERIFY-abc123def456
```

### TikTok
Nel profilo TikTok, aggiungi il token nella bio:
```
🎯 WPT-VERIFY-abc123def456
```

### Discord
Nel canale Discord, aggiungi il token nella descrizione del canale:
```
🎯 WebPayback Protocol: WPT-VERIFY-abc123def456
```

### X/Twitter
Nel profilo X/Twitter, aggiungi il token nella bio:
```
🎯 WPT-VERIFY-abc123def456
```

### Medium/Substack
Nell'articolo o profilo, aggiungi il token:
```
🎯 WebPayback Protocol Verification: WPT-VERIFY-abc123def456
```

### GitHub
Nel README del repository, aggiungi:
```markdown
<!-- WebPayback Protocol Verification -->
🎯 WPT-VERIFY-abc123def456
```

### Siti Web Personali
Aggiungi il meta tag nell'`<head>` della pagina:
```html
<meta name="webpayback-verification" content="WPT-VERIFY-abc123def456" />
```

## Processo di Verifica

### 1. Registrazione Creator
- Vai su [webpayback.replit.app](https://webpayback.replit.app)
- Registra il tuo URL/canale
- Ricevi il token di verifica unico

### 2. Inserimento Token
- Copia il token fornito
- Aggiungi il token secondo le istruzioni della tua piattaforma
- Salva le modifiche

### 3. Verifica Automatica
- Il sistema Chainlink verifica automaticamente il token
- Ricevi conferma entro 60 secondi
- Monitoraggio AI attivato immediatamente

## Sicurezza e Validazione

### Token Unici
- Ogni creator riceve un token univoco
- I token sono legati al specific URL/canale
- Validità illimitata una volta verificato

### Verifica Chainlink
- Utilizzo di Chainlink Functions per validazione
- Verifica cross-chain sicura
- Prevenzione frodi e duplicazioni

### Monitoraggio Continuo
- Verifica periodica della presenza del token
- Alert automatici se il token viene rimosso
- Riattivazione automatica al ripristino

## Esempi Pratici

### Esempio 1: Canale YouTube
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Token: WPT-VERIFY-yt789xyz123
Posizione: Descrizione video
Formato: "🎯 WebPayback Protocol Verification: WPT-VERIFY-yt789xyz123"
```

### Esempio 2: Profilo Instagram
```
URL: https://instagram.com/mycreator
Token: WPT-VERIFY-ig456abc789
Posizione: Bio profilo
Formato: "🎯 WPT-VERIFY-ig456abc789"
```

### Esempio 3: Repository GitHub
```
URL: https://github.com/user/repo
Token: WPT-VERIFY-gh123xyz456
Posizione: README.md
Formato: "🎯 WPT-VERIFY-gh123xyz456"
```

### Esempio 4: Sito Web Personale
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="webpayback-verification" content="WPT-VERIFY-web789abc123" />
  <meta charset="UTF-8">
  <title>Il Mio Portfolio</title>
</head>
<body>
  <h1>Benvenuto nel mio sito</h1>
  <!-- Contenuto... -->
</body>
</html>
```

## Troubleshooting

### Token Non Rilevato
- Verifica che il token sia esattamente come fornito
- Controlla la posizione corretta per la tua piattaforma
- Assicurati che il contenuto sia pubblico
- Attendi fino a 60 secondi per la verifica

### Verifica Fallita
- Controlla che l'URL sia corretto
- Verifica che il token sia visibile pubblicamente
- Riprova la verifica dal dashboard
- Contatta il supporto se il problema persiste

### Rimozione Accidentale
- Reinserisci il token nella posizione corretta
- La verifica si riattiva automaticamente
- Nessuna perdita di dati o reward accumulate

## API per Sviluppatori

### Endpoint di Verifica
```bash
POST /api/domain/chainlink/verify-meta-tag
Content-Type: application/json

{
  "url": "https://example.com",
  "token": "WPT-VERIFY-abc123def456"
}
```

### Risposta di Successo
```json
{
  "success": true,
  "verified": true,
  "domain": "example.com",
  "token": "WPT-VERIFY-abc123def456",
  "verificationTimestamp": "2025-01-17T22:30:00Z",
  "chainlinkData": {
    "requestId": "0x123...",
    "gasUsed": "0.001",
    "responseTime": "1.2s"
  }
}
```

### Controllo Stato
```bash
GET /api/domain/chainlink/status?url=https://example.com
```

## Supporto

Per assistenza con la verifica del meta tag:
- **Dashboard**: [webpayback.replit.app](https://webpayback.replit.app)
- **GitHub**: [github.com/cyper73/webpayback](https://github.com/cyper73/webpayback)
- **Discord**: [Community Discord](https://discord.gg/webpayback)

---

**WebPayback Protocol** - Verifica la proprietà dei tuoi contenuti e inizia a guadagnare WPT token quando AI utilizza il tuo lavoro.