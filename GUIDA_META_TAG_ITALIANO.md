# 🔧 Guida: Come Inserire il Meta Tag di Verifica

## Cosa significa "head section"?

La **head section** è la parte invisibile del codice HTML del tuo sito web dove vanno le informazioni tecniche. È diversa dal contenuto visibile della pagina.

## 🎯 Il tuo Meta Tag da inserire:
```html
<meta name="wpt-verification" content="wpt-verify-s2rk9ucnj87">
```

## 📋 Come inserirlo passo-passo:

### 1. **Se hai un sito WordPress:**
- Vai in **Bacheca → Aspetto → Editor del tema**
- Apri il file `header.php`
- Trova la sezione `<head>`
- Aggiungi il meta tag prima della chiusura `</head>`
- Salva le modifiche

### 2. **Se usi un editor come Wix, Squarespace, etc.:**
- Cerca nelle impostazioni "Codice personalizzato" o "HTML personalizzato"
- Trova l'opzione "Header Code" o "Codice nell'intestazione"
- Incolla il meta tag
- Salva

### 3. **Se modifichi i file HTML direttamente:**
- Apri il file `index.html` del tuo sito
- Trova la sezione che inizia con `<head>`
- Aggiungi il meta tag prima di `</head>`
- Salva il file
- Carica il file modificato sul server

## 🔍 Esempio di come dovrebbe apparire:

**PRIMA:**
```html
<head>
    <title>Il mio sito</title>
    <meta charset="utf-8">
</head>
```

**DOPO:**
```html
<head>
    <title>Il mio sito</title>
    <meta charset="utf-8">
    <meta name="wpt-verification" content="wpt-verify-s2rk9ucnj87">
</head>
```

## ✅ Come verificare che funzioni:
1. Salva le modifiche
2. Vai sul tuo sito web
3. Clicca con tasto destro → "Visualizza sorgente pagina"
4. Cerca il tuo token "wpt-verify-s2rk9ucnj87"
5. Se lo vedi, torna su WebPayback e clicca "Verify Meta Tag"

## 🔥 SOCIAL MEDIA - SOLUZIONE SEMPLICE:

### LinkedIn, Twitter, Facebook, Instagram:
**Non puoi accedere alla head section?** Nessun problema!

**SOLUZIONE: Crea un nuovo POST con il token**

Esempio per il tuo caso LinkedIn:
```
🚀 Sto verificando la mia presenza su WebPayback Protocol!
WPT-VERIFY: wpt-verify-s2rk9ucnj87
#blockchain #crypto #verification
```

O semplicemente:
```
wpt-verify-s2rk9ucnj87
```

### 📱 Formati riconosciuti per i POST:
- `WPT-VERIFY: wpt-verify-s2rk9ucnj87`
- `wpt-verify: wpt-verify-s2rk9ucnj87`
- `wpt-verify-s2rk9ucnj87` (solo il token)

**Il sistema scansiona tutti i tuoi post pubblici per trovare il token!**

## 🆘 Alternative complete:

Il nostro sistema ora riconosce questi formati ovunque:
- **Post pubblici** (LinkedIn, Twitter, Facebook)
- **Biografia/Descrizione profilo**
- **Contenuto delle pagine web**
- **Meta tag HTML** (per siti web tradizionali)