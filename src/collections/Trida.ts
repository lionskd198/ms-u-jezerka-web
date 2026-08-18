/**
 * =============================================================================
 * KOLEKCE: Třídy (jednotlivé třídy školky)
 * =============================================================================
 *
 * Každá třída má vlastní veřejnou stránku (/tridy/nazev-tridy) s logem,
 * popisem, volným textem a odkazy na fotogalerie z akcí (např. Rajče).
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
      type: 'text',
      label: 'Učitelky',
      admin: {
        position: 'sidebar',
        description: 'Jména oddělená čárkou.',
      },
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
      name: 'galerie',
      type: 'array',
      label: 'Fotogalerie z akcí',
      labels: { singular: 'Odkaz na fotogalerii', plural: 'Odkazy na fotogalerie' },
      admin: {
        description:
          'Odkazy na fotky z akcí třídy (např. Rajče) — vždy název akce a odkaz, zobrazí se jako pěkný seznam na stránce třídy.',
      },
      fields: [
        {
          name: 'nazevAkce',
          type: 'text',
          label: 'Název akce',
          required: true,
        },
        {
          name: 'odkaz',
          type: 'text',
          label: 'Odkaz na fotogalerii',
          required: true,
        },
      ],
    },
  ],
}
