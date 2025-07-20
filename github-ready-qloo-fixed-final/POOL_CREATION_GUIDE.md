# Guida Creazione Pool POL/WPT

## Situazione Attuale
- **WPT Token**: Deployato su Polygon `0x9077051D318b614F915E8A07861090856FDEC91e` ✅
- **POL Token**: Native Polygon `0x0000000000000000000000000000000000001010` ✅
- **PROBLEMA IDENTIFICATO**: WPT ha commissioni di trasferimento, incompatibili con V3
- **SOLUZIONE**: Usare Uniswap V2 obbligatoriamente

## Opzioni Disponibili

### OPZIONE A: Adattare Sistema a Pool V2
**Vantaggi:**
- Usa la liquidità già esistente
- Non richiede transazioni aggiuntive
- Funziona immediatamente

**Svantaggi:**
- Meno funzioni avanzate (no range personalizzabili)
- Sistema ottimizzato per V3

**Requisiti:**
- Indirizzo pool V2 creata dall'utente
- Aggiornamento del sistema per compatibilità V2

### PROCEDURA V2 OBBLIGATORIA
**WPT richiede V2** a causa delle commissioni di trasferimento.

**Procedura V2:**
1. Su Uniswap, clicca "Crea una posizione v2" 
2. Token A: `0x0000000000000000000000000000000000001010` (POL)
3. Token B: `0x9077051D318b614F915E8A07861090856FDEC91e` (WPT)
4. Imposta liquidità desiderata
5. Conferma transazioni
6. **IMPORTANTE**: Copia indirizzo pool generato per aggiornamento sistema

## Raccomandazione

**Se hai già liquidità significativa in V2:** Uso Opzione A
**Se la liquidità V2 è piccola:** Uso Opzione B per funzioni complete

## Informazioni Tecniche

### Differenze V2 vs V3
- **V2**: AMM classico, singolo prezzo per tutta la liquidità
- **V3**: Liquidità concentrata, range di prezzo personalizzabili

### Token Addresses Verificati
```
POL (Polygon Native): 0x0000000000000000000000000000000000001010
WPT (WebPayback): 0x9077051D318b614F915E8A07861090856FDEC91e
Network: Polygon Mainnet (Chain ID: 137)
```

### Sistema Staking
- **Pool Trading**: 8.5% APY (commissioni trading)
- **POL Staking**: 6.5% APY (validator rewards)
- **Combined APY**: 15.0% (pool + staking)

Una volta scelta l'opzione, il sistema mostrerà automaticamente dati autentici dalla blockchain.