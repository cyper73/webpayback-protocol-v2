# 🎛️ Guida Accesso Admin WebPayback

## 🖥️ **DA REPLIT (Qui nell'editor)**

### **Metodo 1: Quick Commands (Più Veloce)**
```bash
# Visualizza status pool
./scripts/quick-admin.sh status

# Configura parametri
./scripts/quick-admin.sh config

# Emergency stop
./scripts/quick-admin.sh stop
```

### **Metodo 2: CLI Interattivo**  
```bash
node scripts/admin-cli.js
```
Poi scegli dal menu: 1=Status, 2=Config, 3=Stop, 0=Exit

---

## 💻 **DAL TUO PC (PowerShell)**

### **Step 1: Scarica lo script**
1. Salva questo file sul tuo PC: `webpayback-admin.ps1`
2. Oppure copia il contenuto da `scripts/webpayback-admin.ps1`

### **Step 2: Esegui comandi**

**Comandi Diretti:**
```powershell
# Status pool
.\webpayback-admin.ps1 status

# Configurazione
.\webpayback-admin.ps1 config  

# Emergency stop
.\webpayback-admin.ps1 stop
```

**Menu Interattivo:**
```powershell
.\webpayback-admin.ps1
```

### **Step 3: Se PowerShell blocca gli script**
```powershell
# Abilita esecuzione script (una sola volta)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Poi esegui normalmente
.\webpayback-admin.ps1 status
```

---

## 🔐 **Credenziali**
- **Username:** `cyper`
- **Password:** `Matisse73`
- **URL:** `https://web-payback-tokenizer.replit.app`

---

## 📊 **Cosa Puoi Fare**

### **Pool Status**
- TVL pools USDT/WPT V2 ($563) e WMATIC/WPT V3 (€219)
- Stato sistema (ENABLED/DISABLED)
- Gas risparmiato
- Emergency status

### **Configurazione**  
- Soglia rebalancing (default 15%)
- Gas limit (default 200000)
- Abilita/disabilita emergency stop

### **Emergency Stop**
- Stop immediato operazioni automatiche
- Richiede conferma "YES"
- Blocca rebalancing e automazioni

---

## ✅ **Test Rapido**

**Da Replit:**
```bash
./scripts/quick-admin.sh status
```

**Dal PC:**
```powershell
.\webpayback-admin.ps1 status
```

Entrambi dovrebbero mostrare lo status dei pool in tempo reale.

---

## 🚨 **Sicurezza**
- Accesso solo con credenziali corrette
- HTTPS obbligatorio
- Token temporanei
- Nessuna interfaccia web esposta
- Logging di tutte le operazioni