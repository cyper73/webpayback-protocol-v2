# Guida Passo-Passo: Creazione Pool Balancer V2 USDT/WPT

## 🎯 Prima di Iniziare - Checklist

### ✅ Preparazione Necessaria
- [ ] Hai USDT su Polygon network
- [ ] Hai WPT token nel wallet
- [ ] Hai almeno 2-3 MATIC per gas
- [ ] Wallet collegato a Polygon (137)

### 📋 Indirizzi da Verificare
- **USDT**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **WPT**: `0x9408f17a8B4666f8cb8231BA213DE04137dc3825`
- **Balancer Vault**: `0xBA12222222228d8Ba445958a75a0704d566BF2C8`

---

## 🚀 STEP 1: Accesso a Balancer

### 1.1 Apri Balancer
1. Vai su **app.balancer.fi**
2. Clicca "Connect Wallet" (in alto a destra)
3. Seleziona il tuo wallet (MetaMask, WalletConnect, etc)
4. **IMPORTANTE**: Assicurati sia su **Polygon network**

### 1.2 Verifica Connessione
- In alto dovrebbe mostrare "Polygon" 
- Il tuo indirizzo wallet dovrebbe essere visibile
- Dovresti vedere i tuoi token USDT e WPT

---

## 🔧 STEP 2: Crea Pool

### 2.1 Naviga alla Creazione
1. Nel menu principale, clicca **"Pools"**
2. Clicca il pulsante **"Create Pool"** (solitamente in alto)
3. Si aprirà la procedura guidata

### 2.2 Selezione Tipo Pool
1. Ti chiederà di scegliere il tipo di pool
2. Seleziona **"Weighted Pool"** (NON Composable Stable Pool)
3. Clicca "Next" o "Continue"

---

## 🎛️ STEP 3: Configurazione Token

### 3.1 Aggiungi USDT
1. Clicca "Add Token" o "Select Token"
2. Incolla: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
3. Dovrebbe apparire "USDT" con logo
4. **Imposta peso: 80%**

### 3.2 Aggiungi WPT  
1. Clicca "Add Token" per il secondo token
2. Incolla: `0x9408f17a8B4666f8cb8231BA213DE04137dc3825`
3. Dovrebbe apparire "WPT" o "WebPayback Token"
4. **Imposta peso: 20%**

### 3.3 Imposta Swap Fee
- **Fee: 0.5%** (0.005 se in decimali)
- Questo è ottimale per token nuovi come WPT

---

## 💰 STEP 4: Liquidità Iniziale

### 4.1 Calcola Amounts
**Esempio per $200 investimento:**
- **USDT**: 160 USDT (80%)
- **WPT**: 4,000 WPT (20% = $40 valore)

### 4.2 Inserisci Quantità
1. Nel campo USDT: inserisci la tua quantità (es: 160)
2. Nel campo WPT: inserisci la tua quantità (es: 4000)
3. Il sistema dovrebbe calcolare automaticamente il rapporto

### 4.3 Verifica Ratio
- Deve mostrare circa 80/20 ratio
- Se non è corretto, aggiusta le quantità

---

## ✅ STEP 5: Approvazioni e Conferma

### 5.1 Approva Token
1. Clicca "Approve USDT" - conferma transazione
2. Clicca "Approve WPT" - conferma transazione
3. Aspetta conferme blockchain (1-2 minuti)

### 5.2 Crea Pool
1. Clicca "Create Pool" o "Confirm"
2. **Verifica i dettagli finali**:
   - Weights: 80% USDT, 20% WPT
   - Fee: 0.5%
   - Amounts corretti
3. Conferma transazione finale

### 5.3 Salva Pool Address
- Dopo creazione, salva l'indirizzo della pool
- Lo troverai nell'explorer o nell'interfaccia Balancer

---

## 🎉 STEP 6: Verifica Successo

### 6.1 Controlla Pool
- La pool dovrebbe apparire nel tuo portfolio
- Dovresti ricevere BPT (Balancer Pool Tokens)
- TVL dovrebbe riflettere il tuo investimento

### 6.2 Monitor Performance
- La pool è ora attiva e può ricevere trading
- Non andrà mai "out of range" (impossibile per design)
- Guadagnerai 0.5% su ogni swap + possibili BAL rewards

---

## 🆘 Troubleshooting

### Se Non Trovi i Token
- Assicurati di essere su Polygon network
- Verifica gli indirizzi contract siano corretti
- Prova ad aggiungere i token manualmente al wallet

### Se Gas è Alto
- Balancer V2 dovrebbe essere 30% più economico di Uniswap
- Se troppo alto, aspetta momento con meno congestione

### Se Approvazione Fallisce
- Aumenta il gas limit manualmente
- Assicurati di avere MATIC sufficiente

---

## 📞 Supporto

Se hai problemi durante il processo:
1. **Documenta l'errore esatto**
2. **Fai screenshot se necessario** 
3. **Riferisci a che step sei bloccato**

La procedura dovrebbe richiedere 10-15 minuti totali e costare ~$2-5 in gas fees.

**Questa pool eliminerà completamente i tuoi problemi "out of range" e "out of gas"!**