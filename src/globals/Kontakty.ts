/**
 * =============================================================================
 * GLOBAL: Kontakty
 * =============================================================================
 *
 * Kontaktní údaje školky — existují jen jednou, proto global (viz ONas.ts).
 * Web z nich staví stránku /kontakty a patičku.
 */
import type { GlobalConfig } from 'payload'

import { jePrihlasen } from '../access'

export const Kontakty: GlobalConfig = {
  slug: 'kontakty',

  label: 'Kontakty',

  admin: {
    group: 'Stránky',
    description: 'Adresa, telefony, třídy a zaměstnanci pro stránku Kontakty.',
  },

  access: {
    read: () => true,
    update: jePrihlasen,
  },

  fields: [
    {
      name: 'nazevSkoly',
      type: 'text',
      label: 'Oficiální název školy',
      required: true,
    },
    {
      name: 'adresa',
      type: 'textarea',
      label: 'Adresa',
    },
    {
      name: 'provozniDoba',
      type: 'text',
      label: 'Provozní doba',
      admin: {
        description: 'Např. „Po–Pá 6:30–16:30".',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mail',
    },
    {
      name: 'facebook',
      type: 'text',
      label: 'Facebook (název stránky nebo odkaz)',
    },
    {
      name: 'telefony',
      type: 'array',
      label: 'Telefonní čísla',
      labels: { singular: 'Telefon', plural: 'Telefony' },
      fields: [
        {
          name: 'popisek',
          type: 'text',
          label: 'Popisek (např. Mateřská škola, Školní jídelna…)',
          required: true,
        },
        {
          name: 'cislo',
          type: 'text',
          label: 'Číslo',
          required: true,
        },
      ],
    },
    {
      name: 'odkazNaJidelnicek',
      type: 'text',
      label: 'Odkaz na jídelníček',
      admin: {
        description:
          'Externí odkaz na jídelníček (např. web školní jídelny) — zobrazí se jako položka v hlavičce webu. Necháš-li prázdné, položka se v hlavičce nezobrazí.',
      },
    },
    {
      name: 'vedouci',
      type: 'text',
      label: 'Vedoucí učitelka',
    },
    {
      name: 'pedagogove',
      type: 'array',
      label: 'Pedagogický sbor',
      labels: { singular: 'Pedagog', plural: 'Pedagogové' },
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
      name: 'provozniZamestnanci',
      type: 'array',
      label: 'Provozní zaměstnanci',
      labels: { singular: 'Zaměstnanec', plural: 'Zaměstnanci' },
      fields: [
        {
          name: 'jmeno',
          type: 'text',
          label: 'Jméno',
          required: true,
        },
      ],
    },
  ],
}
