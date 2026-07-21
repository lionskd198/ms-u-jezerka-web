/**
 * =============================================================================
 * GLOBAL: Úvodní stránka (O nás)
 * =============================================================================
 *
 * Co je "global"? Zatímco KOLEKCE má mnoho záznamů (mnoho aktualit, mnoho
 * dokumentů), GLOBAL existuje právě JEDNOU. Hodí se pro obsah, který je na
 * webu jen jedenkrát — úvodní stránka, kontakty, patička…
 *
 * Struktura odpovídá designu webu: hero sekce (štítek, nadpis, podtitulek)
 * a pruh statistik pod ní.
 */
import type { GlobalConfig } from 'payload'

import { jePrihlasen } from '../access'

export const ONas: GlobalConfig = {
  slug: 'o-nas',

  label: 'Úvodní stránka',

  // Název TypeScript typu v payload-types.ts (viz komentář v Aktuality.ts).
  typescript: {
    interface: 'ONas',
  },

  admin: {
    group: 'Stránky',
    description: 'Obsah úvodní stránky webu — uvítání, nadpis a statistiky.',
  },

  access: {
    // Číst může každý (web), upravovat admin i editor.
    read: () => true,
    update: jePrihlasen,
  },

  fields: [
    {
      name: 'stitek',
      type: 'text',
      label: 'Štítek nad nadpisem',
      defaultValue: 'Vítejte na webu naší školky',
      admin: {
        description: 'Malý barevný štítek úplně nahoře v úvodní sekci.',
      },
    },
    {
      name: 'nadpis',
      type: 'text',
      label: 'Hlavní nadpis',
      required: true,
      defaultValue: 'Mateřská škola U Jezérka',
    },
    {
      name: 'podtitulek',
      type: 'textarea',
      label: 'Podtitulek',
      admin: {
        description: 'Věta pod hlavním nadpisem — co rodiče na webu najdou.',
      },
    },
    {
      /**
       * Pole typu ARRAY = opakovatelná skupina polí. Editor může přidávat,
       * mazat a přeskupovat položky (tady jednotlivé statistiky).
       */
      name: 'statistiky',
      type: 'array',
      label: 'Statistiky',
      labels: {
        singular: 'Statistika',
        plural: 'Statistiky',
      },
      maxRows: 4,
      admin: {
        description: 'Čísla v bílém pruhu pod úvodní sekcí (např. „3 třídy").',
      },
      fields: [
        {
          name: 'hodnota',
          type: 'text',
          label: 'Hodnota (velké číslo)',
          required: true,
        },
        {
          name: 'popisek',
          type: 'text',
          label: 'Popisek pod číslem',
          required: true,
        },
      ],
    },
  ],
}
