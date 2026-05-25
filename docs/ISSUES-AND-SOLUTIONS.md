# WebPayback Protocol — Issues, Solutions & Alternatives

> Session log: May 2026  
> Stack: React 18 + Vite + Express + PostgreSQL (Neon) · Privy v3.18.0 · Humanity SDK v0.0.3

---

## Issue 1 — Humanity SDK OAuth Token Exchange Failing in Production

### Symptom
After the user authenticated on Humanity's portal and was redirected back to `/callback`, the token exchange failed silently or threw a CORS error. The user was stuck on the loading screen.

### Root Cause
The Humanity React SDK attempted to exchange the OAuth `code` directly from the browser to Humanity's token endpoint. In production this request is blocked by CORS policy, since the exchange must come from a trusted origin.

### Implemented Solution
Moved the token exchange server-side. The browser sends `{ code, codeVerifier }` to our own backend endpoint `/api/humanity/exchange-token`, which performs the call server-to-server with no CORS restrictions. The resulting access token is then returned to the client and stored in `localStorage`.

### Alternative Solutions
- **Proxy endpoint with refresh rotation**: same approach but add automatic token refresh logic on the backend, reducing the number of times the user must re-authenticate.
- **Backend session with httpOnly cookie**: instead of returning the token to the client at all, store it in a server-side session and set a `httpOnly` cookie. The token never touches JavaScript, making it immune to XSS attacks.

---

## Issue 2 — Firefox ETP Wiped PKCE from sessionStorage

### Symptom
On Firefox with Enhanced Tracking Protection enabled, users occasionally hit the error: _"Missing PKCE code verifier"_ after being redirected back from Humanity's auth page.

### Root Cause
Firefox's Enhanced Tracking Protection (ETP) treats cross-site navigations as potential tracking attempts. When the browser navigates away to `app.sandbox.humanity.org` and then back, ETP can clear `sessionStorage` for the originating domain — removing the PKCE `code_verifier` that was saved before the redirect.

### Implemented Solution
Before initiating the OAuth redirect, the PKCE `code_verifier` and `state` are backed up to `localStorage` under separate keys (`humanity_pkce_backup`, `humanity_state_backup`). In `HumanityCallback.tsx`, the code reads from `sessionStorage` first and falls back to `localStorage` if the value is missing. Both copies are deleted immediately after a successful exchange.

### Alternative Solutions
- **Server-side PKCE storage**: generate the PKCE pair on the backend and store it in the user's server session (keyed by a short-lived cookie). The client never touches `sessionStorage` at all, so browser privacy protections cannot interfere.
- **State parameter encoding**: encode the `code_verifier` inside the OAuth `state` parameter (encrypted). On callback, decode it from the URL instead of reading storage. This is storage-free but requires care to keep the state size within URL limits.

---

## Issue 3 — Privy Embedded Wallet Hanging on Creation

### Symptom
After email login via Privy, the embedded wallet creation spinner ran indefinitely. The user was never granted a wallet address and could not proceed.

### Root Cause
Privy was configured with `defaultChain` set to **Humanity Testnet (chain ID 1942999413)**, which is not supported by Privy's embedded wallet infrastructure. Privy silently failed to create the wallet because it could not reach the RPC endpoint for that chain.

### Implemented Solution
Changed `defaultChain` to **Polygon (137)**, a fully supported chain. Embedded wallets are now created on Polygon instantly. Since all EVM chains share the same address derivation, the wallet address produced is valid on Humanity Testnet and every other EVM network as well.

### Alternative Solutions
- **Ethereum mainnet as default**: equally supported by Privy; useful if the primary use case is Ethereum rather than Polygon.
- **Dynamic chain detection**: detect which chain the user's external wallet is connected to and set that as the default, giving a more native experience for MetaMask/WalletConnect users.

---

## Issue 4 — Dropdown Menus and Toast Notifications Had Invisible Black Text

### Symptom
Select dropdowns and toast notification messages were unreadable — dark text on a dark background.

### Root Cause
The shadcn/ui default theme uses CSS variables (`--foreground`, `--destructive-foreground`) that resolve to dark colors in certain configurations. The components had no explicit text color override, so they inherited the theme's default dark value.

### Implemented Solution
Applied explicit `text-white` to all affected components:
- `SelectContent` and `SelectItem` in `select.tsx`
- `ToastTitle` and `ToastDescription` in `toast.tsx`
- Replaced `text-destructive-foreground` with `text-white` in the `destructive` toast variant

Also added `bg-[hsl(240,33%,8%)]`, `border-2 border-[hsl(190,100%,50%)]`, and neon glow `shadow` for visual consistency with the WebPayback cyber theme.

### Alternative Solutions
- **CSS variable override in `index.css`**: redefine `--foreground` and `--destructive-foreground` in the `.dark` class to always resolve to white. This propagates automatically to all shadcn components without per-component overrides.
- **Tailwind dark mode variants**: use `dark:text-white` on each component for a more composable approach that works in both light and dark modes.

---

## Issue 5 — Redundant 2FA Gate Blocking Creator Portal Access

### Symptom
After successfully authenticating via Humanity (biometric) and Privy (wallet + OTP), users were shown a Google Authenticator (TOTP) prompt before accessing the Creator Portal — a third authentication step that added friction without meaningful security benefit.

### Root Cause
`ProtectedCreatorPortal.tsx` wrapped the portal in a `TwoFactorGate` component that checked `sessionStorage` for a `webpayback_2fa_verified` flag. This flag was set only after entering a TOTP code and was cleared on browser close or tab reload. The gate was implemented before Privy and Humanity were integrated and was never removed.

### Implemented Solution
Removed the `TwoFactorGate` wrapper from `ProtectedCreatorPortal.tsx`. The component now renders `CreatorPortal` directly. Also removed the 2FA step from `WalletLogin.tsx`. Backend routes for `/api/auth/2fa/*` were already marked deprecated and return stub responses — no backend changes were needed.

### Alternative Solutions
- **Optional 2FA**: keep TOTP as an opt-in security upgrade for users who want it, rather than a mandatory gate.
- **Session-level caching**: if 2FA is re-introduced, store the verified flag in a server-side session rather than `sessionStorage`, so it survives page reloads without asking the user to re-verify every time.

---

## Issue 6 — Double Redirect at End of Humanity OAuth Callback

### Symptom
After a successful Humanity login, users saw a brief "double jump" — two rapid navigations — before landing on `/login`.

### Root Cause
A race condition in `HumanityCallback.tsx`. The `useEffect` depended on `[isAuthenticated, navigate]`. The sequence was:

1. Component mounts → `isAuthenticated = false` → `run()` starts
2. `run()` saves token to `localStorage`
3. The `HumanityProvider` detects the new token → sets `isAuthenticated = true`
4. `useEffect` re-fires due to dependency change → first `navigate("/login")`
5. `run()` completes → second `navigate("/login")`

Additionally, the Humanity SDK's internal callback handler detected the `?code=` parameters still present in the URL and attempted its own (CORS-blocked) exchange, adding another navigation attempt.

### Implemented Solution
Three changes applied together:

| Change | Effect |
|---|---|
| `useRef(hasStarted)` guard | The exchange logic runs exactly once on mount, regardless of re-renders |
| `window.history.replaceState({}, "", pathname)` on mount | Clears `?code=&state=` from the URL immediately, preventing the SDK from detecting and re-processing the parameters |
| `useEffect` deps changed to `[]` | Effect no longer re-triggers when `isAuthenticated` changes |
| PKCE keys removed **before** backend call | SDK cannot find the verifier and attempt a parallel exchange |

### Alternative Solutions
- **Dedicated callback route outside React Router**: handle the `/callback` URL at the Express level, do the token exchange server-side before the SPA loads, then redirect to `/login` with a short-lived session cookie. React never sees `?code=` at all.
- **Popup mode for OAuth**: configure `HumanityConnect` with `mode="popup"` instead of `mode="redirect"`. The OAuth flow happens in a popup window; the parent page never navigates, so there is no redirect cycle and no race condition. Drawback: popups can be blocked by browsers.

---

## Issue 7 — In-Memory Storage Appeared to Work in Localhost

### Symptom / Question
Setting `storage="memory"` in `HumanityProvider` seemed to work fine during local development but would fail in production.

### Root Cause
In localhost, browsers apply significantly relaxed privacy and tracking protections:
- `localhost` is treated as a trusted secure origin — Firefox ETP and Safari ITP do not activate
- Vite's Hot Module Replacement (HMR) preserves parts of the JavaScript module state across fast reloads, making it appear that memory survives navigation
- The redirect cycle (`localhost:5000 → Humanity → localhost:5000`) may be classified as same-site by some browsers, reducing storage clearing

In production (`webpayback.com → app.humanity.org → webpayback.com`) the redirect is truly cross-origin. A full page reload occurs and all in-memory JavaScript state is completely destroyed between steps.

### Why localStorage Is Required for OAuth
The PKCE `code_verifier` must be available when the browser returns from Humanity's auth page. Since the redirect destroys memory, the verifier must be stored in a persistent medium (`localStorage` or `sessionStorage`) before the redirect and read back on return.

### More Secure Alternatives
- **httpOnly cookie session**: the backend stores the token; the client receives only a session cookie. Token is never exposed to JavaScript — eliminates XSS risk entirely.
- **Short-lived encrypted state parameter**: encode the PKCE verifier inside the OAuth `state` value (AES-encrypted, signed). Decoded on callback from the URL — no storage needed at all.
