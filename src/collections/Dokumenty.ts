/**
 * =============================================================================
 * KOLEKCE: Dokumenty (soubory ke stažení)
 * =============================================================================
 *
 * Systém na dokumenty funguje takhle:
 *   1. Editor v administraci nahraje soubor (PDF, Word, Excel…),
 *   2. dá mu srozumitelný název a zařadí ho do KATEGORIE,
 *   3. web dokumenty automaticky zobrazí na stránce /dokumenty,
 *      seskupené podle kategorií, s odkazem ke stažení.
 *
 * Jídelníček NENÍ dokument v téhle kolekci — je to externí odkaz
 * (pole "Odkaz na jídelníček" v globalu Kontakty), protože ho spravuje
 * jiná stránka (např. web školní jídelny).
 *
 * Dokumenty jdou navíc připojit k článku v Aktualitách (pole "Přílohy") —
 * třeba přihlášku k zápisu rovnou k článku o zápisu.
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen, verejneCteni } from '../access'

/**
 * Kategorie dokumentů. Definujeme je jako konstantu, protože je používá
 * i veřejný web (pro nadpisy a pořadí skupin na stránce /dokumenty).
 * Chceš-li přidat kategorii, stačí přidat řádek sem.
 */
export const KATEGORIE_DOKUMENTU = [
  { label: 'Přihlášky a zápis', value: 'prihlasky-a-zapis' },
  { label: 'Řády a směrnice', value: 'rady-a-smernice' },
  { label: 'Vzdělávací program', value: 'vzdelavaci-program' },
  { label: 'Ostatní', value: 'ostatni' },
] as const

export const Dokumenty: CollectionConfig = {
  slug: 'dokumenty',

  labels: {
    singular: 'Dokument',
    plural: 'Dokumenty',
  },

  // Název TypeScript typu v payload-types.ts (viz komentář v Aktuality.ts).
  typescript: {
    interface: 'Dokument',
  },

  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'kategorie', 'updatedAt'],
    group: 'Obsah',
    description:
      'Soubory ke stažení — řády, přihlášky, vzdělávací program… Web je zobrazí seskupené podle kategorií.',
  },

  access: {
    // Stáhnout dokument smí každý návštěvník webu.
    read: verejneCteni,
    // Spravovat je smí admin i editor.
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  // I dokumenty jsou "upload" kolekce — jen s jinými typy souborů než Média.
  upload: {
    staticDir: 'dokumenty',
    mimeTypes: [
      'application/pdf', // .pdf
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'image/*', // naskenované dokumenty jako obrázek
    ],
  },

  fields: [
    {
      name: 'nazev',
      type: 'text',
      label: 'Název dokumentu',
      required: true,
      admin: {
        description:
          'Srozumitelný název pro rodiče, např. „Přihláška k předškolnímu vzdělávání" — zobrazí se na webu místo názvu souboru.',
      },
    },
    {
      name: 'kategorie',
      type: 'select',
      label: 'Kategorie',
      required: true,
      defaultValue: 'ostatni',
      // `[...X]` vytvoří obyčejnou kopii konstanty (TypeScript formalita).
      options: [...KATEGORIE_DOKUMENTU],
      admin: {
        description: 'Podle kategorie se dokumenty seskupují na stránce Dokumenty.',
        // `position: 'sidebar'` přesune pole do pravého sloupce editačního formuláře.
        position: 'sidebar',
      },
    },
    {
      name: 'popis',
      type: 'textarea',
      label: 'Popis (nepovinný)',
      admin: {
        description: 'Krátká poznámka pod názvem dokumentu na webu.',
      },
    },
  ],
}
