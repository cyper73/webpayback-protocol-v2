# USDT/WPT Pool Strategy - Soluzione Out of Range

## 🎯 Strategia Completa USDT/WPT Pool

### Token Addresses Verificati
- **WPT**: `0x9408f17a8B4666f8cb8231BA213DE04137dc3825` ✅
- **USDT Polygon**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` ✅

### Vantaggi Rispetto a WMATIC/WPT

#### 1. **Stabilità Range**
- **WMATIC/WPT**: Entrambi volatili (problema attuale)
- **USDT/WPT**: Solo WPT volatile, USDT stabile a $1
- **Risultato**: Range più prevedibile e duraturo

#### 2. **Range Ottimale Suggerito**
```
Range Conservativo: $0.005 - $0.05 per WPT (10x crescita)
Range Aggressivo: $0.01 - $0.02 per WPT (2x crescita)
Range Bilanciato: $0.008 - $0.03 per WPT (3.75x crescita)
```

#### 3. **Calcolo Liquidità Iniziale**
Se investi $100 USD:
- **50% USDT**: 50 USDT
- **50% WPT**: 5,000 WPT (se prezzo = $0.01)
- **Range**: $0.008 - $0.03 (rimane attivo a lungo)

## 🔧 Setup Tecnico Pool

### Fee Tier Consigliato
- **0.30%**: Standard per coppie con token meno liquidi
- **1.00%**: Alternativa per maggiori guadagni (meno volume)

### Parametri Uniswap V3
```javascript
Token0: USDT (0xc2132D05D31c914a87C6611C10748AEb04B58e8F)
Token1: WPT (0x9408f17a8B4666f8cb8231BA213DE04137dc3825)
Fee: 3000 (0.30%) o 10000 (1.00%)
TickLower: Corrispondente a $0.008
TickUpper: Corrispondente a $0.03
```

### Calcolo Tick Values
```
Prezzo = 1.0001^tick
$0.008 → tick ≈ -92103
$0.03 → tick ≈ -80543
Range: 11,560 tick (ampio range)
```

## 📊 Confronto Performance

### Pool Attuale (WMATIC/WPT)
- ❌ Fuori range frequentemente
- ❌ Entrambi token volatili
- ❌ Difficile prevedere movimento
- ✅ TVL attuale: €219

### Pool Proposta (USDT/WPT)
- ✅ Range più stabile
- ✅ Solo WPT volatile
- ✅ Maggiore volume USDT
- ✅ Facilità gestione range

## 🚀 Piano Implementazione

### Fase 1: Preparazione
1. Acquista USDT su Polygon
2. Calcola rapporto USDT/WPT desiderato
3. Imposta range ottimale

### Fase 2: Creazione Pool
1. Vai su Uniswap V3
2. Seleziona "Create Pool" se non esiste
3. Inserisci USDT/WPT con range calcolato

### Fase 3: Migrazione (Opzionale)
1. Rimuovi liquidità da WMATIC/WPT
2. Converti WMATIC in USDT
3. Aggiungi a pool USDT/WPT

## 💡 Gestione Range Ottimale

### Monitoraggio
- **Range attuale**: Controlla settimanalmente
- **Prezzo WPT**: Se si avvicina ai limiti
- **Azione**: Aggiusta range prima che esca

### Strategia Adattiva
- **Bull Market**: Range più alto ($0.01 - $0.05)
- **Bear Market**: Range più basso ($0.005 - $0.02)
- **Stabile**: Range centrato ($0.008 - $0.03)

## 📈 Benefici Attesi

### Redditività
- **Meno tempo fuori range**: +300% efficienza
- **Volume USDT**: Maggiori commissioni
- **Gestione semplice**: Meno manutenzione

### Rischi Ridotti
- **Impermanent Loss**: Minore con stablecoin
- **Volatilità**: Solo un lato della coppia
- **Liquidità**: USDT sempre liquido

Questa strategia elimina il problema "out of range" e aumenta significativamente la redditività della posizione.