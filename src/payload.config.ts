/**
 * =============================================================================
 * HLAVNÍ KONFIGURACE PAYLOADU
 * =============================================================================
 *
 * Tenhle soubor je srdce celého CMS. Říká Payloadu:
 *   - jaké kolekce a globals existují (= jaký obsah web má),
 *   - do jaké databáze ukládat (PostgreSQL),
 *   - jaký editor textu používat (Lexical),
 *   - jak má vypadat administrace (jazyk, přihlašovací kolekce…).
 *
 * Z této konfigurace Payload automaticky vyrobí:
 *   - tabulky v PostgreSQL (při vývoji se schéma synchronizuje samo),
 *   - administraci na adrese /admin,
 *   - REST API na /api a GraphQL na /api/graphql,
 *   - TypeScript typy (soubor payload-types.ts → příkaz `npm run generate:types`).
 */
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import {
  defaultColors,
  FixedToolbarFeature,
  lexicalEditor,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
// Překlady administrace — čeština + angličtina (záloha pro nepřeložené texty)
import { cs } from '@payloadcms/translations/languages/cs'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Naše kolekce (mnoho záznamů) a globals (jeden záznam)
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Dokumenty } from './collections/Dokumenty'
import { Aktuality } from './collections/Aktuality'
import { Trida } from './collections/Trida'
import { Fotografie } from './collections/Fotografie'
import { Projekty } from './collections/Projekty'
import { Rodice } from './collections/Rodice'
import { ONas } from './globals/ONas'
import { Kontakty } from './globals/Kontakty'
// Databázové migrace — viz komentář u `prodMigrations` níže.
import { migrations } from './migrations'

// Pomůcka pro ES moduly — zjistí absolutní cestu ke složce tohoto souboru
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * =============================================================================
 * ÚLOŽIŠTĚ NAHRANÝCH SOUBORŮ (obrázky + dokumenty)
 * =============================================================================
 *
 * Ve VÝVOJI se soubory ukládají normálně na disk (do složek /media
 * a /dokumenty) — nic speciálního není potřeba, funguje to samo.
 *
 * V PRODUKCI (na Zerops i jinde) ale kontejner, ve kterém aplikace běží,
 * NENÍ trvalý — při každém nasazení nové verze nebo restartu se vytvoří
 * úplně od začátku a cokoli uložené jen na jeho disku (tedy i nahrané
 * fotky a dokumenty) by nenávratně zmizelo!
 *
 * Řešení: místo lokálního disku se soubory posílají do S3 kompatibilního
 * "Object Storage" (na Zerops je to vestavěná služba) — to je trvalé
 * úložiště nezávislé na životě kontejneru. Aktivuje se to automaticky,
 * jakmile jsou v .env vyplněné S3_* proměnné (viz zerops-project-import.yml);
 * bez nich (typicky na tvém počítači) se nic nemění a jede se z disku.
 */
const pouzitS3Uloziste = Boolean(process.env.S3_BUCKET)

/**
 * =============================================================================
 * ODESÍLÁNÍ E-MAILŮ (SMTP — Seznam)
 * =============================================================================
 *
 * Používá se pro rozesílání aktualit rodičům (viz src/email) a pro
 * „Zapomněli jste heslo?" v administraci. Zapne se, jakmile jsou vyplněné
 * SMTP_* proměnné; bez nich Payload e-maily jen vypisuje do logu.
 *
 * Seznam dovolí odesílat jen z adresy přihlášeného účtu, proto je odesílatel
 * vždy SMTP_USER. Port 465 = šifrované spojení od začátku, port 587 = STARTTLS.
 */
const smtpPort = Number(process.env.SMTP_PORT || 465)
const emailAdapter = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_USER || '',
      defaultFromName: 'MŠ U Jezérka',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        // Na jiném portu (587) se šifruje až přes STARTTLS — bez něj neposílat.
        requireTLS: smtpPort !== 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    })
  : undefined

/**
 * Adresa webu z .env (bez, nebo s "www", podle toho, co je nastavené) +
 * její doplněk (druhá varianta). Web totiž běží na obou variantách domény
 * (s www i bez www) a bez téhle druhé varianty by přihlášení do
 * administrace z té "nenastavené" varianty spadlo na chybě CORS/CSRF
 * (Origin prohlížeče by neodpovídal ničemu z povoleného seznamu).
 */
const adresaWebu = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const adresaWebuBezWww = adresaWebu.replace('://www.', '://')
const adresaWebuSWww = adresaWebuBezWww.replace('://', '://www.')
const povoleneAdresy = Array.from(new Set([adresaWebu, adresaWebuBezWww, adresaWebuSWww]))

export default buildConfig({
  admin: {
    // Kolekce, jejíž uživatelé se smí přihlásit do administrace.
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Metadata administrace (titulek okna prohlížeče)
    meta: {
      titleSuffix: ' — MŠ U Jezérka',
    },
  },

  // Jazyk administrace: čeština, s angličtinou jako zálohou
  i18n: {
    supportedLanguages: { cs, en },
    fallbackLanguage: 'en',
  },

  // Registrace veškerého obsahu — pořadí zde = pořadí v menu administrace
  collections: [Aktuality, Dokumenty, Trida, Fotografie, Projekty, Rodice, Media, Users],
  globals: [ONas, Kontakty],

  /**
   * Editor textu pro pole typu `richText` (moderní editor Lexical).
   *
   * Výchozí funkce (`defaultFeatures`) už obsahují: tučné/kurzíva/podtržení,
   * nadpisy H1–H6 (= různé velikosti písma), odrážkové a číslované seznamy,
   * zarovnání, odsazení, odkazy, citace, vodorovnou čáru a VKLÁDÁNÍ OBRÁZKŮ
   * (tlačítko + / příkaz „/obrázek" vloží obrázek z kolekce Média).
   *
   * Navíc přidáváme:
   *  - FixedToolbarFeature → lišta nástrojů je pořád vidět nahoře
   *    (jako ve Wordu), ne jen po označení textu
   *  - TextStateFeature → barvy textu a zvýraznění
   */
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      TextStateFeature({
        // Připravené palety barev (text + pozadí) z Payloadu
        state: {
          color: { ...defaultColors.text },
          background: { ...defaultColors.background },
        },
      }),
    ],
  }),

  // Tajný klíč pro podepisování přihlašovacích tokenů — čte se z .env
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    // Kam se generují TypeScript typy (`npm run generate:types`)
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  /**
   * Databázový adaptér — PostgreSQL. Connection string je v .env.
   *
   * Ve VÝVOJI (NODE_ENV !== 'production') Payload sám drží schéma databáze
   * v souladu s konfigurací ("push" — žádné ruční migrace nejsou potřeba).
   *
   * V PRODUKCI je push automaticky VYPNUTÝ (bezpečnostní pojistka Payloadu —
   * na ostrém webu nechceme, aby si CMS samo přepisovalo strukturu tabulek).
   * Místo toho se řízeně spouští `prodMigrations` — soubory v `src/migrations`
   * s přesným SQL, které se při startu aplikace na produkci automaticky
   * aplikují. Po každé změně kolekcí/globals proto spusť:
   *
   *   npx payload migrate:create nazev_zmeny
   *
   * …a nový soubor migrace commitni do gitu spolu se změnou kódu.
   */
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    prodMigrations: migrations,
  }),

  // Knihovna pro zpracování obrázků (zmenšené verze v kolekci Média)
  sharp,

  // Odesílání e-mailů — viz `emailAdapter` nahoře (bez SMTP_* se jen loguje).
  ...(emailAdapter && { email: emailAdapter }),

  // ===========================================================================
  // ZABEZPEČENÍ
  // ===========================================================================

  // Veřejná adresa webu — čte se z .env, aby šla na produkci změnit.
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  /**
   * CORS = které cizí weby smí volat naše API z prohlížeče.
   * Povolujeme jen náš vlastní web — žádná cizí stránka tak nemůže
   * z prohlížeče návštěvníka volat naše API.
   *
   * Web je dostupný jak bez "www", tak s "www" (obě varianty domény
   * fungují) — proto musí být povolené OBĚ, jinak přihlášení do
   * administrace z varianty, která v NEXT_PUBLIC_SERVER_URL chybí,
   * skončí chybou CORS při ukládání.
   */
  cors: povoleneAdresy,

  /**
   * CSRF ochrana — přihlašovací cookie se přijme jen u požadavků
   * přicházejících z těchto adres. Brání útoku, kdy by cizí stránka
   * "potají" odeslala požadavek jménem přihlášeného uživatele.
   */
  csrf: povoleneAdresy,

  /**
   * Globální limit velikosti nahrávaných souborů (v bajtech) — 15 MB.
   * Brání zahlcení serveru obřími soubory.
   */
  upload: {
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  },

  /**
   * Plugin pro S3 úložiště se aktivuje jen když jsou vyplněné S3_* proměnné
   * (viz `pouzitS3Uloziste` výše) — na produkci ano, na tvém počítači ne.
   */
  plugins: pouzitS3Uloziste
    ? [
        s3Storage({
          // Které kolekce mají soubory posílat do S3 místo na disk.
          collections: {
            media: { disableLocalStorage: true },
            dokumenty: { disableLocalStorage: true },
          },
          bucket: process.env.S3_BUCKET || '',
          config: {
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            region: process.env.S3_REGION || 'us-east-1',
            endpoint: process.env.S3_ENDPOINT,
            // Zerops (a většina S3-kompatibilních služeb mimo AWS) vyžaduje
            // "path style" adresy (endpoint/bucket/soubor) místo AWS stylu
            // (bucket.endpoint/soubor).
            forcePathStyle: true,
          },
        }),
      ]
    : [],
})
