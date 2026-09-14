# Web mateřské školky — Payload CMS 3 + PostgreSQL + Next.js

Web MŠ U Jezérka Ratíškovice s vlastní administrací. Celý projekt je jedna
Next.js aplikace, uvnitř které běží [Payload CMS](https://payloadcms.com) —
administrace i veřejný web na stejné adrese.

## Co kde je

| Adresa | Co tam najdeš |
| --- | --- |
| `http://localhost:3000/` | veřejný web (úvod, aktuality, dokumenty, kontakty) |
| `http://localhost:3000/admin` | administrace (Payload) |
| `http://localhost:3000/api/...` | automaticky generované REST API |

## První spuštění (krok za krokem)

```powershell
# 1. Spusť databázi (potřebuješ zapnutý Docker Desktop)
docker compose up -d

# 2. Nainstaluj závislosti (stačí jednou)
npm install

# 3. Naplň databázi výchozím obsahem (texty, kontakty, ukázkové aktuality)
npm run seed

# 4. Vytvoř účty admin + editor (hesla se vypíšou do konzole — ulož si je!)
npm run seed:ucty

# 5. Spusť vývojový server
npm run dev
```

Přihlášení do administrace: `http://localhost:3000/admin`. Po prvním
přihlášení si **změň heslo** (ikona účtu vpravo nahoře → Účet). Kdybys
zakládal účty ručně přes uvítací obrazovku, první účet automaticky dostane
roli Administrátor (zajišťuje to hook v `src/collections/Users.ts`).

## Role uživatelů

| | Administrátor | Editor |
| --- | --- | --- |
| Aktuality, dokumenty, obrázky, texty stránek | ✅ | ✅ |
| Správa uživatelů a rolí | ✅ | ❌ (vidí a upraví jen svůj účet) |

Oprávnění definují funkce v `src/access/index.ts` — tam je i vysvětlení,
jak access control v Payloadu funguje.

## Jak se pracuje s obsahem

- **Aktuality** — články pro rodiče. Každý má *typ* (Informace / Akce školky /
  Dokument), podle kterého web umí filtrovat. Článek se nejdřív uloží jako
  **koncept** a na webu se objeví až po kliknutí na **Publikovat**
  (Payload "drafts" — viz `src/collections/Aktuality.ts`).
- **Dokumenty** — soubory ke stažení (PDF, Word…). Nahraješ soubor, dáš mu
  název a kategorii; stránka `/dokumenty` je sama seskupí. **Jídelníček** je
  dokument v kategorii Jídelníček. Dokumenty jdou přikládat k aktualitám
  jako přílohy.
- **Obrázky** — fotky do článků. Payload z každé automaticky vyrobí zmenšené
  verze (náhled / karta / velký).
- **O nás** a **Kontakty** (sekce *Stránky*) — obsah úvodní stránky a stránky
  kontaktů. Existují jen jednou, proto jsou to tzv. *globals*, ne kolekce.

## Struktura projektu

```
src/
├── payload.config.ts      ← hlavní konfigurace CMS (začni číst tady)
├── collections/           ← typy obsahu s mnoha záznamy (= tabulky v DB)
│   ├── Users.ts           ← uživatelé + role admin/editor
│   ├── Media.ts           ← obrázky (upload)
│   ├── Dokumenty.ts       ← soubory ke stažení (upload + kategorie)
│   └── Aktuality.ts       ← články s typem, přílohami a koncepty
├── globals/               ← obsah existující právě jednou
│   ├── ONas.ts            ← texty úvodní stránky
│   └── Kontakty.ts        ← kontaktní údaje
├── access/index.ts        ← kdo co smí (access control)
├── seed/index.ts          ← naplnění databáze výchozím obsahem
└── app/
    ├── (payload)/         ← administrace (spravuje Payload, needituj)
    └── (frontend)/        ← veřejný web (Next.js server komponenty)
```

Všechny soubory jsou podrobně komentované — vysvětlují nejen *co* kód dělá,
ale i *proč* a jaký koncept Payloadu se v něm používá.

## Užitečné příkazy

| Příkaz | Co dělá |
| --- | --- |
| `npm run dev` | vývojový server (automaticky obnovuje po změně kódu) |
| `npm run seed` | naplní DB výchozím obsahem (globals přepíše, aktuality nepřidá znovu) |
| `npm run seed:ucty` | vytvoří účty admin + editor s vygenerovanými hesly |
| `npm run generate:types` | přegeneruje `payload-types.ts` po změně kolekcí |
| `npm run migrate:create nazev` | vytvoří novou databázovou migraci po změně kolekcí (viz níže) |
| `npm run build` + `npm start` | produkční build a spuštění |
| `docker compose up -d` / `stop` | start / zastavení databáze |

## SEO

- **Meta tagy** — titulek, popis a Open Graph (náhled při sdílení) generuje
  Next.js z `layout.tsx`; detail aktuality má vlastní přes `generateMetadata`.
- **`/sitemap.xml` a `/robots.txt`** — generují se automaticky
  (`src/app/sitemap.ts`, `src/app/robots.ts`); sitemap obsahuje i všechny
  publikované aktuality, robots blokuje `/admin` a `/api`.
- **Strukturovaná data** (JSON-LD, typ *Preschool*) — v layoutu, z globalu
  Kontakty.
- `NEXT_PUBLIC_SERVER_URL` (skutečná doména) je napevno v `zerops.yml` —
  používá se v sitemap, OG tazích, CORS i CSRF. Zapékat se musí už do
  buildu (viz komentář v `zerops.yml`), proto NENÍ v Zerops GUI, ale přímo
  v souboru — po změně domény uprav `zerops.yml` a znovu nasaď.

## Cookies

Web ukládá jen **nezbytné** cookies (přihlášení do administrace), na které
se souhlas nevztahuje — proto nemá cookie lištu. ⚠️ Kdyby se v budoucnu
přidala analytika (Google Analytics apod.) nebo jiné nepovinné cookies,
je potřeba doplnit lištu se souhlasem (GDPR), nebo zvolit analytiku bez
cookies (Umami, Plausible).

## Zabezpečení

- **Access control** (`src/access/index.ts`) — editor nemůže spravovat
  uživatele ani si změnit roli (field-level ochrana pole `role`).
- **Zámek účtu** — po 5 špatných heslech se účet na 10 minut zamkne.
- **CORS + CSRF** — API přijímá požadavky z prohlížeče jen z vlastní domény.
- **Limit uploadů** — max. 15 MB na soubor; typy souborů omezené per kolekce.
- **Bezpečnostní hlavičky** (`next.config.ts`) — X-Frame-Options,
  nosniff, Referrer-Policy, Permissions-Policy; vypnutá hlavička X-Powered-By.
- **Cookies** — `sameSite: Lax`, na produkci (HTTPS) `secure`.
- Koncepty článků nejsou veřejně čitelné (access vrací jen `published`).

## Databázové migrace

Ve vývoji Payload sám drží schéma databáze v souladu s konfigurací (tzv.
*push mode* — nic ručně neřešíš). **V produkci je push automaticky vypnutý**
(bezpečnostní pojistka — ať si CMS samo nepřepisuje strukturu ostré databáze)
a místo něj se používají migrace ze složky `src/migrations`, které se při
startu aplikace v produkci aplikují samy (`prodMigrations` v
`payload.config.ts`) — ověřeno end-to-end proti čisté databázi.

**Kdykoli přidáš/změníš pole v kolekci nebo globalu**, vytvoř novou migraci
a commitni ji spolu se změnou kódu:

```powershell
npm run migrate:create popis-zmeny
```

Příkaz nepotřebuje běžící databázi — jen porovná konfiguraci s poslední
migrací a vygeneruje SQL rozdíl.

## Úložiště nahraných souborů

Lokálně se obrázky a dokumenty ukládají na disk (`/media`, `/dokumenty`).
V produkci (viz níže) se místo toho použije S3 kompatibilní úložiště —
kontejner aplikace je totiž při každém nasazení nový a soubory na jeho
disku by se ztratily. Přepíná se to samo podle vyplněných `S3_*` proměnných
v `.env` (`pouzitS3Uloziste` v `payload.config.ts`) — bez nich lokální vývoj
funguje beze změny.

## Nasazení na Zerops

Projekt běží na [Zerops](https://zerops.io) v projektu **web**
(`oJ1DoA35QJqucQdBelpCWA`), služba **nodejs** (`taCu7FVBSuq2GBKkeKvsHQ`) +
služba **postgresql**. Pipeline nasazení je v `zerops.yml`
(`zerops-project-import.yml` je jen referenční popis infrastruktury pro
založení od nuly někde jinde).

**Před prvním pushem** musí mít služba `nodejs` v Zerops GUI
(Environment Variables) nastavené — bez toho build/start spadne:

| Klíč | Hodnota |
| --- | --- |
| `DATABASE_URI` | `${postgresql_connectionString}/${postgresql_dbName}` |
| `PAYLOAD_SECRET` | vygenerovaný náhodný řetězec (jako lokální v `.env`), ideálně jako **Secret** |

`NEXT_PUBLIC_SERVER_URL` v GUI nastavovat nemusíš — je napevno v
`zerops.yml` (skutečná doména), protože `NEXT_PUBLIC_*` proměnné Next.js
zapéká už při buildu a proměnné z GUI tou dobou ještě nejsou dostupné.

Nasazení:

```powershell
zcli login <token>       # token z Zerops GUI → Access Token Management
zcli push nodejs --setup nodejs -P oJ1DoA35QJqucQdBelpCWA
```

Po prvním nasazení:
- povol veřejnou subdoménu: `zcli service enable-subdomain -P oJ1DoA35QJqucQdBelpCWA -S taCu7FVBSuq2GBKkeKvsHQ`
  (do prvního nasazení to nejde — Zerops do té doby neví, že služba mluví HTTP),
- přidej službu **Object Storage** a vyplň `S3_*` proměnné (jinak nahrané
  soubory při dalším nasazení zmizí — viz sekci výše),
- spusť `npm run seed` a `npm run seed:ucty` proti produkci (přes Zerops
  terminál dané služby), pokud chceš i tam výchozí obsah a účty.

Databázové migrace i produkční nastavení Payloadu (vypnutý push, S3 storage)
se aplikují automaticky — nic dalšího není potřeba.
