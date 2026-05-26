# WebPayback Protocol — Problemi, Soluzioni e Alternative

> Log sessione: Maggio 2026
> Stack: React 18 + Vite + Express + PostgreSQL (Neon) · Privy v3.18.0 · Humanity SDK v0.0.3

---

## Problema 1 — Scambio token OAuth di Humanity SDK che falliva in produzione

### Sintomo
Dopo che l'utente si autenticava sul portale Humanity e veniva reindirizzato a `/callback`, lo scambio del token falliva silenziosamente o restituiva un errore CORS. L'utente restava bloccato sulla schermata di caricamento.

### Causa radice
Il React SDK di Humanity tentava di scambiare il codice OAuth direttamente dal browser al token endpoint di Humanity. In produzione questa richiesta viene bloccata dalle policy CORS, poiché lo scambio deve avvenire da un'origine attendibile.

### Soluzione implementata
Spostato lo scambio token server-side. Il browser invia `{ code, codeVerifier }` al nostro endpoint backend `/api/humanity/exchange-token`, che esegue la chiamata server-to-server senza restrizioni CORS. Il token di accesso risultante viene restituito al client e memorizzato in `localStorage`.

### Alternative
- **Endpoint proxy con rotazione refresh**: stesso approccio ma aggiungendo logica di refresh automatico del token sul backend, riducendo le volte in cui l'utente deve ri-autenticarsi.
- **Sessione backend con cookie httpOnly**: invece di restituire il token al client, memorizzarlo in una sessione server-side e impostare un cookie `httpOnly`. Il token non tocca mai JavaScript, rendendolo immune agli attacchi XSS.

---

## Problema 2 — Firefox ETP cancellava il PKCE da sessionStorage

### Sintomo
Su Firefox con Enhanced Tracking Protection abilitato, gli utenti occasionalmente incontravano l'errore: _"Missing PKCE code verifier"_ dopo essere stati reindirizzati dalla pagina di auth di Humanity.

### Causa radice
L'Enhanced Tracking Protection (ETP) di Firefox tratta le navigazioni cross-site come potenziali tentativi di tracking. Quando il browser naviga su `app.sandbox.humanity.org` e poi torna indietro, ETP può cancellare il `sessionStorage` del dominio originario — rimuovendo il `code_verifier` PKCE che era stato salvato prima del redirect.

### Soluzione implementata
Prima di avviare il redirect OAuth, il `code_verifier` e lo `state` PKCE vengono salvati in backup su `localStorage` sotto chiavi separate (`humanity_pkce_backup`, `humanity_state_backup`). In `HumanityCallback.tsx`, il codice legge prima da `sessionStorage` e, se il valore manca, effettua il fallback su `localStorage`. Entrambe le copie vengono cancellate immediatamente dopo uno scambio riuscito.

### Alternative
- **PKCE storage server-side**: generare la coppia PKCE sul backend e memorizzarla nella sessione dell'utente (chiave da un cookie a breve durata). Il client non tocca mai `sessionStorage`, quindi le protezioni privacy del browser non possono interferire.
- **Codifica nel parametro state**: codificare il `code_verifier` dentro il parametro OAuth `state` (cifrato). Al callback, decodificarlo dall'URL invece di leggere dallo storage. È storage-free ma richiede attenzione per mantenere la dimensione dello state entro i limiti dell'URL.

---

## Problema 3 — Creazione wallet embedded di Privy che bloccava

### Sintomo
Dopo il login via email su Privy, lo spinner di creazione del wallet embedded girava all'infinito. L'utente non riceveva mai un indirizzo wallet e non poteva procedere.

### Causa radice
Privy era configurato con `defaultChain` impostato su **Humanity Testnet (chain ID 1942999413)**, che non è supportato dall'infrastruttura wallet embedded di Privy. Privy falliva silenziosamente nella creazione del wallet perché non poteva raggiungere l'RPC endpoint per quella chain.

### Soluzione implementata
Cambiato `defaultChain` a **Polygon (137)**, una chain pienamente supportata. I wallet embedded vengono ora creati istantaneamente su Polygon. Poiché tutte le chain EVM condividono lo stesso address derivation, l'indirizzo del wallet prodotto è valido anche su Humanity Testnet e su ogni altra rete EVM.

### Alternative
- **Ethereum mainnet come default**: altrettanto supportato da Privy; utile se il caso d'uso principale è Ethereum anziché Polygon.
- **Rilevamento dinamico chain**: rilevare a quale chain è connesso il wallet esterno dell'utente e impostarlo come default, offrendo un'esperienza più nativa per utenti MetaMask/WalletConnect.

---

## Problema 4 — Menu dropdown e notifiche Toast con testo nero invisibile

### Sintomo
I dropdown Select e i messaggi delle notifiche Toast erano illeggibili — testo scuro su sfondo scuro.

### Causa radice
Il tema di default shadcn/ui usa variabili CSS (`--foreground`, `--destructive-foreground`) che risolvono a colori scuri in certe configurazioni. I componenti non avevano override esplicito del colore del testo, quindi ereditavano il valore scuro di default del tema.

### Soluzione implementata
Applicato `text-white` esplicito a tutti i componenti interessati:
- `SelectContent` e `SelectItem` in `select.tsx`
- `ToastTitle` e `ToastDescription` in `toast.tsx`
- Sostituito `text-destructive-foreground` con `text-white` nella variante `destructive` del toast

Aggiunti anche `bg-[hsl(240,33%,8%)]`, `border-2 border-[hsl(190,100%,50%)]` e neon glow `shadow` per coerenza visiva con il tema cyber di WebPayback.

### Alternative
- **Override variabili CSS in `index.css`**: ridefinire `--foreground` e `--destructive-foreground` nella classe `.dark` per risolvere sempre a bianco. Questo si propaga automaticamente a tutti i componenti shadcn senza override per-componente.
- **Varianti Tailwind dark mode**: usare `dark:text-white` su ogni componente per un approccio più componibile che funziona sia in light che in dark mode.

---

## Problema 5 — Gate 2FA ridondante che bloccava l'accesso al Creator Portal

### Sintomo
Dopo l'autenticazione riuscita su Humanity (biometrica) e su Privy (wallet + OTP), agli utenti veniva mostrato un prompt Google Authenticator (TOTP) prima di accedere al Creator Portal — un terzo step di autenticazione che aggiungeva attrito senza un beneficio di sicurezza significativo.

### Causa radice
`ProtectedCreatorPortal.tsx` wrappava il portal in un componente `TwoFactorGate` che controllava `sessionStorage` per la flag `webpayback_2fa_verified`. Questa flag veniva impostata solo dopo l'inserimento di un codice TOTP e veniva cancellata alla chiusura del browser o al refresh del tab. Il gate era stato implementato prima dell'integrazione di Privy e Humanity e non era mai stato rimosso.

### Soluzione implementata
Rimosso il wrapper `TwoFactorGate` da `ProtectedCreatorPortal.tsx`. Il componente ora renderizza `CreatorPortal` direttamente. Rimosso anche lo step 2FA da `WalletLogin.tsx`. Le route backend per `/api/auth/2fa/*` erano già marcate deprecate e restituiscono risposte stub — nessuna modifica backend necessaria.

### Alternative
- **2FA opzionale**: mantenere TOTP come upgrade di sicurezza opt-in per utenti che lo vogliono, invece di un gate obbligatorio.
- **Cache a livello di sessione**: se il 2FA viene reintrodotto, memorizzare la flag verificata in una sessione server-side anziché in `sessionStorage`, così sopravvive al refresh della pagina senza richiedere all'utente di ri-verificarsi ogni volta.

---

## Problema 6 — Doppio redirect alla fine del callback OAuth di Humanity

### Sintomo
Dopo un login Humanity riuscito, gli utenti vedevano un breve "salto doppio" — due navigazioni rapide — prima di atterrare su `/login`.

### Causa radice
Una race condition in `HumanityCallback.tsx`. L'`useEffect` dipendeva da `[isAuthenticated, navigate]`. La sequenza era:

1. Component monta → `isAuthenticated = false` → `run()` si avvia
2. `run()` salva il token in `localStorage`
3. Il `HumanityProvider` rileva il nuovo token → imposta `isAuthenticated = true`
4. `useEffect` si ri-attiva per cambiamento dipendenza → primo `navigate("/login")`
5. `run()` completa → secondo `navigate("/login")`

Inoltre, l'handler interno del callback dell'SDK Humanity rilevava i parametri `?code=` ancora presenti nell'URL e tentava il proprio scambio (bloccato da CORS), aggiungendo un altro tentativo di navigazione.

### Soluzione implementata
Tre modifiche applicate insieme:

| Modifica | Effetto |
|---|---|
| Guard `useRef(hasStarted)` | La logica di scambio esegue esattamente una volta al mount, indipendentemente dai re-render |
| `window.history.replaceState({}, "", pathname)` al mount | Pulisce `?code=&state=` dall'URL immediatamente, impedendo all'SDK di rilevare e ri-processare i parametri |
| Dipendenze `useEffect` cambiate a `[]` | L'effetto non si ri-attiva più quando `isAuthenticated` cambia |
| Chiavi PKCE rimosse **prima** della chiamata backend | L'SDK non trova il verifier e non può tentare uno scambio parallelo |

### Alternative
- **Route callback dedicata fuori da React Router**: gestire l'URL `/callback` a livello Express, eseguire lo scambio token server-side prima che la SPA carichi, poi reindirizzare a `/login` con un cookie di sessione a breve durata. React non vede mai `?code=`.
- **Modalità popup per OAuth**: configurare `HumanityConnect` con `mode="popup"` invece di `mode="redirect"`. Il flusso OAuth avviene in una finestra popup; la pagina genitore non naviga mai, quindi non c'è ciclo di redirect né race condition. Svantaggio: i popup possono essere bloccati dal browser.

---

## Problema 7 — Storage in-memory che sembrava funzionare su localhost

### Sintomo / Domanda
Impostare `storage="memory"` in `HumanityProvider` sembrava funzionare durante lo sviluppo locale ma falliva in produzione.

### Causa radice
In localhost, i browser applicano protezioni privacy e tracking significativamente più rilassate:
- `localhost` è trattato come un'origine sicura attendibile — Firefox ETP e Safari ITP non si attivano
- L'Hot Module Replacement (HMR) di Vite preserva parti dello stato del modulo JavaScript tra ricaricamenti rapidi, facendo sembrare che la memoria sopravviva alla navigazione
- Il ciclo di redirect (`localhost:5000 → Humanity → localhost:5000`) può essere classificato come same-site da alcuni browser, riducendo la cancellazione dello storage

In produzione (`webpayback.com → app.humanity.org → webpayback.com`) il redirect è veramente cross-origin. Si verifica un full page reload e tutto lo stato JavaScript in-memory viene completamente distrutto tra i passaggi.

### Perché localStorage è richiesto per OAuth
Il `code_verifier` PKCE deve essere disponibile quando il browser torna dalla pagina di auth di Humanity. Poiché il redirect distrugge la memoria, il verifier deve essere memorizzato in un mezzo persistente (`localStorage` o `sessionStorage`) prima del redirect e riletto al ritorno.

### Alternative più sicure
- **Sessione con cookie httpOnly**: il backend memorizza il token; il client riceve solo un cookie di sessione. Il token non è mai esposto a JavaScript — elimina completamente il rischio XSS.
- **Parametro state cifrato a breve durata**: codificare il `code_verifier` dentro il valore OAuth `state` (AES-cifrato, firmato). Decodificato al callback dall'URL — nessuno storage necessario.
