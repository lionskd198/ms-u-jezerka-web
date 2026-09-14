/**
 * =============================================================================
 * KOLEKCE: Aktuality (články / novinky)
 * =============================================================================
 *
 * Jedna společná kolekce pro všechny novinky na webu. Každý článek má TYP
 * (informace / akce / dokument), podle kterého se dá na webu filtrovat:
 *   - informace → běžná sdělení pro rodiče (provoz, prázdniny…)
 *   - akce      → události s datem konání (besídka, muzikoterapie, výlet…)
 *   - dokument  → upozornění na nový dokument (nový jídelníček, směrnice…)
 *
 * K článku jde připojit úvodní obrázek, fotky přímo do textu a přílohy
 * (soubory z kolekce Dokumenty).
 *
 * KONCEPTY vs. PUBLIKOVÁNO (drafts):
 * Díky `versions.drafts` má každý článek stav "koncept" nebo "publikováno".
 * Editor si článek připraví, uloží jako koncept, a na webu se objeví až po
 * kliknutí na "Publikovat". Payload navíc ukládá historii verzí — v detailu
 * článku se dá vrátit ke starší verzi.
 */
import type { CollectionConfig, Where } from 'payload'

import { jePrihlasen } from '../access'

/**
 * "Kde" podmínka pro veřejně viditelné aktuality — publikované A zároveň
 * buď bez vyplněné platnosti, nebo s platností v budoucnu (případně dnes).
 *
 * Používá se na DVOU místech, která spolu jinak nesouvisí, a musí dávat
 * stejný výsledek:
 *  1) tady v `access.read` (REST/GraphQL API, admin rozhraní),
 *  2) ve veřejných stránkách webu (Local API `payload.find`).
 * Local API totiž při volání bez `overrideAccess: false` access control
 * PŘESKAKUJE (výchozí chování Payloadu) — filtr z `access.read` by se tak
 * na veřejný web vůbec neuplatnil, proto ho stránky musí použít ručně.
 */
export const verejnyDotazAktuality = (): Where => ({
  and: [
    { _status: { equals: 'published' } },
    {
      or: [
        { platnostDo: { exists: false } },
        { platnostDo: { greater_than_equal: new Date().toISOString() } },
      ],
    },
  ],
})

/**
 * Typy článků — konstantu opět sdílíme s veřejným webem (filtr, štítky).
 */
export const TYPY_AKTUALIT = [
  { label: 'Informace', value: 'informace' },
  { label: 'Akce školky', value: 'akce' },
  { label: 'Dokument', value: 'dokument' },
  { label: 'Fotogalerie', value: 'fotogalerie' },
] as const

/**
 * Pomocná funkce: z názvu článku vyrobí "slug" — text vhodný do URL adresy.
 * Např. "Zápis dětí 2026/27" → "zapis-deti-2026-27".
 * `normalize('NFD')` rozloží písmena s diakritikou (á → a + čárka)
 * a regulární výraz diakritiku a speciální znaky odstraní.
 */
const vytvorSlug = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // odstraní diakritiku
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // vše kromě písmen a číslic nahradí pomlčkou
    .replace(/^-+|-+$/g, '') // ořízne pomlčky na začátku a konci

export const Aktuality: CollectionConfig = {
  slug: 'aktuality',

  labels: {
    singular: 'Aktualita',
    plural: 'Aktuality',
  },

  // Název TypeScript typu v generovaném souboru payload-types.ts.
  // Bez tohoto by Payload zkusil název odvodit sám (a u českých slov
  // vymyslí nesmysl — anglické skloňování na češtinu nefunguje).
  typescript: {
    interface: 'Aktualita',
  },

  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'typ', 'datumAkce', '_status', 'updatedAt'],
    group: 'Obsah',
    description: 'Novinky pro rodiče — informace, akce školky a upozornění na dokumenty.',
  },

  // Zapne koncepty a historii verzí (viz komentář nahoře).
  versions: {
    drafts: true,
    maxPerDoc: 20, // kolik starých verzí se uchovává
  },

  access: {
    /**
     * Čtení: přihlášený uživatel (admin/editor) vidí vše včetně konceptů.
     * Nepřihlášený návštěvník webu vidí JEN publikované články — vracíme
     * query podmínku na interní pole `_status`, které spravují drafts.
     */
    read: ({ req }) => {
      if (req.user) {
        return true
      }
      return verejnyDotazAktuality()
    },
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  fields: [
    {
      name: 'nazev',
      type: 'text',
      label: 'Název',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresa článku (slug)',
      unique: true, // dva články nesmí mít stejnou adresu
      index: true, // zrychlí vyhledávání článku podle adresy
      admin: {
        position: 'sidebar',
        description: 'Vyplní se samo z názvu — část URL adresy, např. /aktuality/zapis-deti.',
        readOnly: true,
      },
      hooks: {
        /**
         * Field hook `beforeValidate` běží před validací dat.
         * Slug generujeme vždy znovu z názvu, takže ho editor nemusí řešit.
         */
        beforeValidate: [
          ({ data }) => {
            if (data?.nazev) {
              return vytvorSlug(data.nazev)
            }
            return undefined
          },
        ],
      },
    },
    {
      name: 'typ',
      type: 'select',
      label: 'Typ aktuality',
      required: true,
      defaultValue: 'informace',
      options: [...TYPY_AKTUALIT],
      admin: {
        position: 'sidebar',
        description: 'Podle typu se dá na webu filtrovat.',
      },
    },
    {
      name: 'datumAkce',
      type: 'date',
      label: 'Datum konání akce',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd. M. yyyy HH:mm',
        },
        /**
         * `condition` pole zobrazí jen když je splněna podmínka —
         * datum konání dává smysl jen u typu "akce".
         */
        condition: (data) => data?.typ === 'akce',
      },
    },
    {
      name: 'odkazNaGalerii',
      type: 'text',
      label: 'Odkaz na fotogalerii',
      admin: {
        position: 'sidebar',
        description:
          'Odkaz na fotky z akce (např. Rajče, Google Fotky, Facebook album) — zobrazí se jako tlačítko pod článkem.',
        // Dává smysl jen u typu "fotogalerie".
        condition: (data) => data?.typ === 'fotogalerie',
      },
    },
    {
      name: 'uvodniObrazek',
      type: 'upload', // pole typu upload = odkaz na záznam v upload kolekci
      relationTo: 'media',
      label: 'Úvodní obrázek',
      admin: {
        description: 'Zobrazí se ve výpisu aktualit a v hlavičce článku.',
      },
    },
    {
      name: 'obsah',
      type: 'richText', // vizuální editor textu (Lexical) — odstavce, nadpisy, obrázky…
      label: 'Obsah článku',
      required: true,
    },
    {
      name: 'prilohy',
      type: 'relationship', // vztah na jinou kolekci (cizí klíč v databázi)
      relationTo: 'dokumenty',
      hasMany: true, // článek může mít víc příloh
      label: 'Přílohy (dokumenty)',
      admin: {
        description: 'Soubory ke stažení pod článkem — vyber z nahraných dokumentů.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Datum zveřejnění',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' },
        description: 'Podle tohoto data se aktuality řadí na webu (nejnovější první).',
      },
      hooks: {
        // Při prvním publikování doplníme aktuální datum automaticky.
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?._status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'platnostDo',
      type: 'date',
      label: 'Platnost do (nepovinné)',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy HH:mm' },
        description:
          'Po tomto datu se aktualita na webu přestane zobrazovat (výpis, detail, sitemapa). Zůstane uložená a jde ji kdykoli prodloužit nebo smazat datum úplně. Necháš-li prázdné, platí bez omezení.',
      },
    },
  ],
}
