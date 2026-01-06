# Dokumentácia Projektu: Marian Stancik AI Web

Tento dokument poskytuje kompletný technický prehľad o projekte osobnej webovej stránky a AI agenta pre Mariana Stančíka.

## 1. Prehľad Projektu

Projekt je moderná, interaktívna webová stránka (Portfolio/Landing Page) postavená na **Next.js 15**, ktorá integruje pokročilého **AI Agenta** na kvalifikáciu leadov a rezerváciu konzultácií. Stránka je plne lokalizovaná (SK, EN, PL) a optimalizovaná pre výkon a SEO.

## 2. Technologický Stack

### Core
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Jazyk:** TypeScript
- **Runtime:** Node.js

### UI & Styling
- **Styling:** Tailwind CSS
- **Komponenty:** Shadcn/ui (Radix UI primitives)
- **Animácie:** Framer Motion (pre vstupné animácie a interakcie)
- **Ikony:** Lucide React

### AI & Backend
- **AI SDK:** Vercel AI SDK Core (`ai`), Google Provider (`@ai-sdk/google`), React Hooks (`@ai-sdk/react`)
- **Model:** Google Gemini 2.5 Flash (nastaviteľné cez `.env`)
- **Emailing:** Resend (pre notifikácie o leadoch)
- **Validácia:** Zod (pre validáciu vstupov a AI tools)

## 3. Štruktúra Projektu

```
/src
├── app/
│   ├── api/chat/route.ts       # Hlavný endpoint pre AI chata
│   ├── actions.ts              # Server Actions (odosielanie emailov)
│   ├── icon.tsx, layout.tsx    # Globálne nastavenia, favicon
│   └── page.tsx                # Hlavná landing page
├── components/
│   ├── sections/               # Hlavné sekcie stránky (Hero, Roadmap, atď.)
│   └── ui/                     # Znovupoužiteľné UI komponenty (Button, Modal...)
│       └── consultation-modal.tsx # Klient pre chat okno
├── lib/
│   ├── i18n/                   # Logika pre jazyky (dictionaries.ts)
│   └── hooks/                  # Vlastné hooky (use-language.ts)
├── locales/                    # Prekladové súbory
│   ├── sk.json
│   ├── en.json
│   └── pl.json
└── public/                     # Statické asety
```

## 4. API a Služby

### 4.1 AI Chat Endpoint (`/api/chat`)
Tento endpoint zabezpečuje komunikáciu s LLM modelom.

- **Cesta:** `/api/chat/route.ts` (POST)
- **Funkcionalita:**
    - Prijíma históriu správ.
    - Normalizuje formát správ pomocou `convertToModelMessages`.
    - Definuje nástroje (Tools), napr. `saveLead`.
    - Streamuje odpoveď späť do klienta pomocou `toUIMessageStreamResponse`.
- **Systémový Prompt:** Definuje osobnosť agenta (profesionálny, zameraný na predaj, "weeks not years" mentalita).

### 4.2 Nástroje (Tools)
Agent má prístup k nástrojom, ktoré mu umožňujú vykonávať akcie.

- **`saveLead`**:
    - **Účel:** Uloží kontaktné údaje záujemcu a pošle notifikáciu.
    - **Parametre:** `name`, `email` (povinný), `phone`, `company`, `interest`.
    - **Akcia:** Zavolá Resend API na odoslanie emailu na `marian@stancik.ai`.

### 4.3 Server Actions (`actions.ts`)
Obsahuje serverové funkcie pre formuláre a emailing.

- **`sendEmail`**: Odosiela transakčné emaily cez Resend. Používa sa pri manuálnom audite alebo kontaktnom formulári.

## 5. Externé Služby

| Služba | Účel | Konfigurácia |
|--------|------|--------------|
| **Vercel** | Hosting a CI/CD pipeline | Automatický deploy z `main` vetvy |
| **Google AI Studio** | Poskytovateľ LLM (Gemini) | API kľúč v `GOOGLE_GENERATIVE_AI_API_KEY` |
| **Resend** | Odosielanie emailov | API kľúč v `RESEND_API_KEY` |

## 6. Lokalizácia (i18n)

Implementovali sme vlastné, ľahké riešenie pre preklady bez middleware bloatu.

- **Súbory:** JSON súbory v `src/locales/` obsahujú kľúč-hodnota páry.
- **Hook:** `useLanguage()` (v `src/lib/hooks/use-language.ts`)
    - Udržiava stav vybraného jazyka.
    - Poskytuje funkciu `t(key)` na získanie prekladu.
- **Použitie:** V komponentoch sa texty nahrádzajú volaním `t('hero.title')`.

## 7. Proces Vývoja a Nasadenia

1.  **Lokálny Vývoj:**
    - Príkaz: `npm run dev`
    - Beží na: `http://localhost:3000`
2.  **Build:**
    - Príkaz: `npm run build`
    - Kontroluje TypeScript chyby a optimalizuje kód.
3.  **Nasadenie (Deploy):**
    - **Automatické:** Push do vetvy `main` spustí Vercel build.
    - **Manuálne:** Cez Vercel CLI alebo dashboard.

## 8. Bezpečnosť

- **API Kľúče:** Všetky citlivé kľúče (Google, Resend) sú v `.env` súbore a nie sú prístupné na kliente (okrem `NEXT_PUBLIC_` premenných, ak by boli potrebné).
- **Validácia:** Vstupy do AI a formulárov sú validované cez Zod schémy, aby sa predišlo injection útokom alebo chybám.
