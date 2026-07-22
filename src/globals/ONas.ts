/**
 * =============================================================================
 * GLOBAL: Úvodní stránka (O nás)
 * =============================================================================
 *
 * Co je "global"? Zatímco KOLEKCE má mnoho záznamů (mnoho aktualit, mnoho
 * dokumentů), GLOBAL existuje právě JEDNOU. Hodí se pro obsah, který je na
 * webu jen jedenkrát — úvodní stránka, kontakty, patička…
 *
 * Struktura: hero sekce (štítek, nadpis, podtitulek, obrázek na pozadí),
 * pod ní „Co je nového" (aktuality, viz page.tsx) a hned pod tím sekce
 * „O nás" — kdo jsme, co děláme a proč, doplněná o fotky ze školky.
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
    description: 'Obsah úvodní stránky webu — uvítání, nadpis, obrázek, O nás a fotky.',
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
      name: 'heroObrazek',
      type: 'upload',
      relationTo: 'media',
      label: 'Obrázek v úvodní sekci',
      admin: {
        description: 'Obrázek na pozadí úvodní sekce (vpravo, jemně prolnutý do barvy).',
      },
    },
    {
      name: 'oNasNadpis',
      type: 'text',
      label: 'Nadpis sekce „O nás"',
      defaultValue: 'O nás',
      admin: {
        description: 'Nadpis nad textem kdo jsme / co děláme / proč to děláme.',
      },
    },
    {
      name: 'oNasText',
      type: 'richText',
      label: 'Text „O nás"',
      admin: {
        description:
          'Kdo jsme, co děláme a proč to děláme — zobrazuje se na úvodní stránce pod aktualitami.',
      },
    },
    {
      /**
       * Fotky ke „O nás". Každá položka je vztah na kolekci Média (upload) —
       * editor v administraci vybere/nahraje obrázek a nepovinně ho popíše.
       * Dokud je pole prázdné, web zobrazí hezký zástupný prostor
       * (viz src/app/(frontend)/page.tsx), ať je hned vidět, kam fotky patří.
       */
      name: 'fotografie',
      type: 'array',
      label: 'Fotky ze školky',
      labels: {
        singular: 'Fotka',
        plural: 'Fotky',
      },
      maxRows: 6,
      admin: {
        description:
          'Fotky do sekce „O nás". Nahraj přes toto pole — na webu se zobrazí v mřížce.',
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
          name: 'popisek',
          type: 'text',
          label: 'Popisek (nepovinný)',
        },
      ],
    },
  ],
}
