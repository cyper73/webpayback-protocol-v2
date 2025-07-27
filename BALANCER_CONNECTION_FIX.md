# Fix Connessione Balancer - "Wrong Network"

## 🔧 PROBLEMA: Balancer dice "Wrong Network" anche se sei su Polygon

## ✅ SOLUZIONI DA PROVARE (IN ORDINE):

### SOLUZIONE 1: Forza Refresh Connessione
1. **Disconnetti wallet** da Balancer (clicca wallet address → Disconnect)
2. **Nel wallet**, assicurati sia selezionato "Polygon Mainnet" 
3. **Refresha pagina** Balancer (F5 o Ctrl+R)
4. **Riconnetti wallet** → Dovrebbe ora riconoscere Polygon

### SOLUZIONE 2: Chain ID Manuale
1. **In Balancer**, cerca un pulsante per **"Switch Network"** o simile
2. **Clicca e seleziona Polygon** dalla lista
3. **Conferma nel wallet** quando chiede di switchare

### SOLUZIONE 3: URL Diretto Polygon
Invece di app.balancer.fi, prova:
- **polygon.balancer.fi** (se esiste)
- O aggiungi **?chainId=137** alla fine dell'URL

### SOLUZIONE 4: Verifica Chain ID Wallet
Nel tuo wallet:
1. **Network Settings** → Polygon Mainnet
2. **Verifica Chain ID = 137** (non 1 o altro)
3. **Se diverso**, cambialo a 137

### SOLUZIONE 5: Clear Cache
1. **Ctrl+Shift+Delete** → Clear browsing data
2. **Riapri Balancer** e riconnetti wallet

---

## 🎯 ALTERNATIVA: Uniswap V3 per Test

Se Balancer continua problemi, possiamo **creare pool weighted su Uniswap V3** con parametri simili come fallback temporaneo.

---

## 📞 DEBUG INFO NEEDED

Se nulla funziona, dimmi:
1. **Che wallet usi?** (MetaMask, Trust, Coinbase, altro)
2. **Chain ID mostrato** nel wallet per Polygon
3. **Screenshot errore** esatto di Balancer
4. **URL completo** che stai usando per Balancer

---

## 🚀 PROSSIMI PASSI

**Prova Soluzione 1 prima** (disconnect/refresh/reconnect) - risolve 80% dei casi.

**Dimmi se funziona o serve altra soluzione!**