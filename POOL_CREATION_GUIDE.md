# Guida Creazione Pool POL/WPT su Uniswap V3

## Token Addresses Corretti

### POL (Polygon Token) - Native su Polygon
- **Contract Address**: `0x0000000000000000000000000000000000001010`
- **Symbol**: POL
- **Decimals**: 18
- **Verified**: ✅ PolygonScan ufficiale

### WPT (WebPayback Token)  
- **Contract Address**: `0x9077051D318b614F915E8A07861090856FDEC91e`
- **Symbol**: WPT
- **Decimals**: 18
- **Network**: Polygon Mainnet

## Procedura Creazione Pool Uniswap V3

### Step 1: Preparazione
1. **Wallet Setup**: Assicurati di avere MetaMask configurato su Polygon Mainnet
2. **Network**: Polygon Mainnet (Chain ID: 137)
3. **Gas**: Tieni ~50 POL per gas fees
4. **Token Balance**: Verifica di avere sia POL che WPT disponibili

### Step 2: Accesso Uniswap V3
1. Vai su [app.uniswap.org](https://app.uniswap.org)
2. Connetti wallet MetaMask
3. Seleziona "Polygon" network nell'interfaccia
4. Clicca su "Pool" nel menu principale

### Step 3: Creazione Nuova Pool
1. Clicca "Create a pool" o "New Position"
2. **Token A**: Inserisci indirizzo POL: `0x0000000000000000000000000000000000001010`
3. **Token B**: Inserisci indirizzo WPT: `0x9077051D318b614F915E8A07861090856FDEC91e`
4. **Fee Tier**: Seleziona 0.3% (standard per token pairs)

### Step 4: Configurazione Liquidità
1. **Price Range**: Imposta range di prezzo iniziale
   - Esempio: Price min: 0.001 POL per WPT
   - Price max: 10 POL per WPT
2. **Deposit Amount**: Inserisci quantità di entrambi i token
   - Esempio: 1000 POL + 1000 WPT
3. **Price Setting**: Imposta prezzo iniziale (es: 1 POL = 1 WPT)

### Step 5: Conferma Transazione
1. Review dettagli pool
2. Approva spesa token (2 transazioni separate)
3. Conferma creazione pool
4. Attendi conferma blockchain (~30 secondi)

## Parametri Raccomandati

### Pool Configuration
- **Token Pair**: POL/WPT
- **Fee**: 0.3% (0.05% per pool stablecoin, 1% per token esotici)
- **Initial Price**: 1:1 ratio (modificabile)
- **Tick Spacing**: 60 (default per 0.3% fee)

### Liquidità Iniziale Suggerita
- **POL**: 1,000-5,000 POL (~$230-1,150)
- **WPT**: Equivalente in valore WPT
- **Total Value**: $500-2,000 per iniziare

## Verifiche Post-Creazione

### 1. Pool Address
- Copia l'indirizzo della pool generata
- Verifica su PolygonScan
- Aggiorna sistema WebPayback con nuovo indirizzo

### 2. Liquidità
- Controlla che entrambi i token siano depositati
- Verifica fee tier (0.3%)
- Conferma range di prezzo attivo

### 3. Trading
- Testa uno swap piccolo POL→WPT
- Verifica che il trading funzioni
- Controlla slippage ragionevole (<5%)

## Troubleshooting Comuni

### Token Non Riconosciuto
- Verifica indirizzo contratto
- Importa manualmente il token
- Controlla network (Polygon vs Ethereum)

### Transazione Fallita  
- Aumenta gas limit
- Verifica balance token
- Attendi blocco confirmato

### Prezzo Instabile
- Aumenta liquidità
- Stringe range di prezzo  
- Monitora trading volume

## Aggiornamento Sistema WebPayback

Dopo creazione pool, aggiorna:
1. **Pool Address** nel codice
2. **Real Pool Data Service**
3. **Frontend Pool Display**
4. **API Endpoints**

```typescript
// Esempio aggiornamento indirizzo pool
const NEW_POL_WPT_POOL = "0x[NUOVO_INDIRIZZO_POOL]";
```

## Risorse Utili

- **Uniswap V3**: [app.uniswap.org](https://app.uniswap.org)
- **PolygonScan**: [polygonscan.com](https://polygonscan.com)
- **POL Token**: [polygonscan.com/token/0x0000000000000000000000000000000000001010](https://polygonscan.com/token/0x0000000000000000000000000000000000001010)
- **WPT Token**: [polygonscan.com/token/0x9077051D318b614F915E8A07861090856FDEC91e](https://polygonscan.com/token/0x9077051D318b614F915E8A07861090856FDEC91e)

---

**Importante**: Verifica sempre gli indirizzi dei contratti prima di creare liquidità. Una volta creata, la pool non può essere annullata, solo la liquidità può essere rimossa.