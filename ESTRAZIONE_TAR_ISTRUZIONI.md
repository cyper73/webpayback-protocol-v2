# 🎯 ESTRAZIONE FILE routes.ts DAL TAR

## ARCHIVI DISPONIBILI:
1. **webpayback-github-AI-DETECTION-FINAL-20250122.tar.gz** (PIÙ RECENTE - CONSIGLIATO)
2. **webpayback-github-QLOO-ENUM-CLEAN-FINAL-20250720.tar.gz** (PIÙ VECCHIO)

## COMANDO PER ESTRARRE:

```bash
# Nel tuo PowerShell dalla directory webpayback
cd webpayback

# Estrai l'archivio più recente 
tar -xzf webpayback-github-AI-DETECTION-FINAL-20250122.tar.gz

# Il file si trova in:
# webpayback-github-AI-DETECTION-FINAL/server/routes.ts

# Copia il file aggiornato
cp webpayback-github-AI-DETECTION-FINAL/server/routes.ts server/routes.ts

# Pulizia (opzionale)
rm -rf webpayback-github-AI-DETECTION-FINAL/
```

## PERCORSO ESATTO NEL TAR:
```
webpayback-github-AI-DETECTION-FINAL/
└── server/
    └── routes.ts  ← QUESTO È IL FILE CHE TI SERVE
```

## VERIFICA MODIFICHE:
Il file aggiornato contiene:
- DeepSeek AI detection (linea ~519)
- Grok AI detection (linea ~522)  
- Reward amounts aggiornati (linea ~565)

## COMMIT FINALE:
```bash
git add server/routes.ts
git commit -m "feat: Add DeepSeek and Grok AI detection support"
git push origin webpayback
```