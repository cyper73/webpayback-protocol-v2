# Fix Errore Prezzo Uniswap - Calcolo Sbagliato

## 🚨 PROBLEMA IDENTIFICATO

**Uniswap mostra:**
- 5,000,000 WPT = 9509,99 USDT (8097€)
- Questo è SBAGLIATO matematicamente!

**Calcolo Corretto:**
- Prezzo: 525,762 WPT = 1 USDT
- 5,000,000 WPT ÷ 525,762 = **9.51 USDT** (non 9509!)

## ✅ SOLUZIONI IMMEDIATE

### Opzione 1: Riduci Drasticamente l'Amount
**Inserisci invece:**
- **WPT**: 525,762 (solo questo numero)
- **Dovrebbe dare**: 1 USDT equivalente

### Opzione 2: Usa Importi Piccoli per Test
**Per pool da $2:**
- **USDT**: 1 USDT
- **WPT**: 525,762 WPT

### Opzione 3: Controlla Pool Esistente
Prima di creare nuova pool, verifica se USDT/WPT esiste già:
- Vai su "Import Pool" 
- Cerca pair USDT/WPT esistente

## 🔧 TROUBLESHOOTING IMMEDIATO

### 1. Clear dei Campi
- Cancella tutti i numeri
- Ricomincia con importi minimi

### 2. Test con 1 USDT
```
USDT: 1
WPT: 525762 (senza virgole)
```

### 3. Verifica Decimali Token
Il problema potrebbe essere nei decimals:
- USDT ha 6 decimali
- WPT potrebbe avere 18 decimali
- Questo spiega la differenza enorme

## 💡 STRATEGIA ALTERNATIVA

### Usa Importi Minimi
**Per evitare errori di calcolo:**
- **USDT**: 5 USDT
- **WPT**: 2,628,810 WPT (5 × 525,762)
- **Valore totale**: $10 (non $8000!)

## 🎯 AZIONE IMMEDIATA

1. **Cancella tutti i campi** in Uniswap
2. **Inserisci**: 1 USDT
3. **Lascia che calcoli** automaticamente WPT
4. **Verifica** che sia ~525,762 WPT
5. **Se corretto**, scala a 5 USDT

**Il bug è nel calcolo dell'interfaccia, non nel prezzo di mercato!**