/**
 * =============================================================================
 * KOLEKCE: Fotografie (odkazy na fotogalerie z akcí)
 * =============================================================================
 *
 * Jeden záznam = jedna akce s odkazem na fotky (např. Rajče). Volitelně jde
 * přiřadit ke konkrétní třídě (pole "trida") — pak se zobrazí i na stránce
 * dané třídy. Bez přiřazené třídy je záznam obecný a zobrazí se jen na
 * stránce /fotografie.
 *
 * Fotogalerie u Aktualit (typ "fotogalerie") jsou samostatný, nezávislý
 * mechanismus — tahle kolekce ho nenahrazuje, jen řeší fotky vázané na třídy
 * a obecné fotoalbum na jednom místě.
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen, verejneCteni } from '../access'

export const Fotografie: CollectionConfig = {
  slug: 'fotografie',

  labels: {
    singular: 'Fotografie',
    plural: 'Fotografie',
  },

  typescript: {
    interface: 'Fotografie',
  },

  admin: {
    useAsTitle: 'nazevAkce',
    defaultColumns: ['nazevAkce', 'trida', 'updatedAt'],
    group: 'Obsah',
    description: 'Odkazy na fotogalerie z akcí — volitelně přiřazené ke třídě.',
  },

  access: {
    read: verejneCteni,
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  fields: [
    {
      name: 'nazevAkce',
      type: 'text',
      label: 'Název akce',
      required: true,
    },
    {
      name: 'trida',
      type: 'relationship',
      relationTo: 'tridy',
      label: 'Třída',
      admin: {
        position: 'sidebar',
        description:
          'Nepovinné — bez přiřazené třídy se fotky zobrazí jen na stránce Fotografie, s třídou i na její vlastní stránce.',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Text',
      admin: {
        description: 'Krátký popis k akci (nepovinné).',
      },
    },
    {
      name: 'odkaz',
      type: 'text',
      label: 'Odkaz na fotogalerii',
      required: true,
    },
  ],
}
