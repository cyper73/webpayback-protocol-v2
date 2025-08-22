# WebPayback Admin CLI Tools

Due strumenti di amministrazione sicuri senza interfacce web esposte:

## 🚀 Quick Admin Script (Bash)

### Uso rapido:
```bash
# Status pool manager
./scripts/quick-admin.sh status

# Stop emergenza
./scripts/quick-admin.sh stop

# Configurazione parametri
./scripts/quick-admin.sh config
```

### Caratteristiche:
- ✅ Login automatico
- ✅ Zero esposizione web
- ✅ Comandi one-shot
- ✅ Output formattato
- ✅ Conferme di sicurezza

## 🎛️ Interactive CLI (Node.js)

### Avvio:
```bash
node scripts/admin-cli.js
```

### Menu interattivo:
```
🎛️ WEBPAYBACK ADMIN CLI
═══════════════════════
1. 📊 Pool Status
2. ⚙️ Configure Pool  
3. 🚨 Emergency Stop
4. 🔄 Refresh Login
0. 🚪 Exit
```

### Caratteristiche:
- ✅ Menu interattivo completo
- ✅ Autenticazione persistente
- ✅ Gestione errori avanzata
- ✅ Configurazione guidata
- ✅ Conferme multiple per operazioni critiche

## 🔐 Sicurezza

Entrambi gli strumenti:
- Usano credenziali `cyper/Matisse73`
- Richiedono HTTPS
- Token temporanei
- Zero tracce web pubbliche
- Logging operazioni

## 📊 Funzionalità Disponibili

### Pool Manager:
- Status completo pool (TVL, stato, soglie)
- Configurazione parametri di rebalancing
- Emergency stop con conferma
- Monitoraggio gas usage

### Future Extensions:
- Allowance management
- Contract reserves
- Internal security monitoring
- Transaction batching

## 🎯 Raccomandazione d'Uso

**Quick Script** - Per operazioni veloci e automazione
**Interactive CLI** - Per gestione completa e configurazioni avanzate

Entrambi garantiscono accesso admin completo senza esporre interfacce web.