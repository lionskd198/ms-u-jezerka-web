/**
 * =============================================================================
 * KOLEKCE: Třídy (jednotlivé třídy školky)
 * =============================================================================
 *
 * Každá třída má vlastní veřejnou stránku (/tridy/nazev-tridy) s logem,
 * popisem a volným textem. Fotogalerie z akcí třídy nejsou tady — vedou se
 * v samostatné kolekci Fotografie (pole "trida" tam odkazuje zpátky sem).
 * Stejná data (název, věk, učitelky) se používají i na stránce Kontakty
 * v sekci „Třídy a učitelky" — ta teď na jednotlivé třídy odkazuje.
 *
 * Bez konceptů/verzí (na rozdíl od Aktuality) — jednodušší práce pro
 * editora, stejně jako u kolekce Dokumenty.
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen, verejneCteni } from '../access'

/**
 * Z názvu třídy vyrobí "slug" — text vhodný do URL adresy.
 * Stejná logika jako u Aktualit (viz komentář tam).
 */
const vytvorSlug = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // odstraní diakritiku
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // vše kromě písmen a číslic nahradí pomlčkou
    .replace(/^-+|-+$/g, '') // ořízne pomlčky na začátku a konci

export const Trida: CollectionConfig = {
  slug: 'tridy',

  labels: {
    singular: 'Třída',
    plural: 'Třídy',
  },

  typescript: {
    interface: 'Trida',
  },

  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'vek', 'updatedAt'],
    group: 'Obsah',
    description: 'Jednotlivé třídy školky — každá má vlastní stránku s popisem a fotogaleriemi.',
  },

  access: {
    read: verejneCteni,
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  fields: [
    {
      name: 'nazev',
      type: 'text',
      label: 'Název třídy',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresa stránky (slug)',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Vyplní se samo z názvu — část URL adresy, např. /tridy/berusky.',
        readOnly: true,
      },
      hooks: {
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
      name: 'vek',
      type: 'text',
      label: 'Věková skupina',
      admin: {
        position: 'sidebar',
        description: 'Např. „3–4 roky".',
      },
    },
    {
      name: 'ucitelky',
      type: 'array',
      label: 'Učitelky',
      labels: { singular: 'Učitelka', plural: 'Učitelky' },
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'jmeno',
          type: 'text',
          label: 'Jméno',
          required: true,
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo / fotka třídy',
      admin: {
        description: 'Zobrazí se v seznamu tříd i v hlavičce vlastní stránky třídy.',
      },
    },
    {
      name: 'popis',
      type: 'textarea',
      label: 'Krátký popis',
      admin: {
        description: 'Zobrazí se pod názvem třídy v seznamu tříd (na stránce /tridy).',
      },
    },
    {
      name: 'obsah',
      type: 'richText',
      label: 'Obsah stránky třídy',
      admin: {
        description: 'Delší text na vlastní stránce třídy — denní program, zaměření apod.',
      },
    },
    {
      /**
       * Fotky s vlastním nadpisem a popisem — na stránce třídy se zobrazí
       * jako střídavé bloky (fotka jednou vlevo, jednou vpravo).
       */
      name: 'fotky',
      type: 'array',
      label: 'Fotky ze třídy',
      labels: {
        singular: 'Fotka',
        plural: 'Fotky',
      },
      admin: {
        description:
          'Fotky s nadpisem a popisem na stránce třídy — zobrazí se střídavě fotka vlevo/vpravo.',
      },
      fields: [
        {
          name: 'obrazek',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Obrázek',
        },
        {
          name: 'nadpis',
          type: 'text',
          label: 'Nadpis',
        },
        {
          name: 'popis',
          type: 'textarea',
          label: 'Popis',
        },
      ],
    },
  ],
}
