/**
 * =============================================================================
 * KOLEKCE: Projekty (dlouhodobé projekty, do kterých je školka zapojená)
 * =============================================================================
 *
 * Např. Recyklohraní, Celé Česko čte dětem apod. — každý projekt má název,
 * krátký popis a malou fotku (většinou logo projektu). Zobrazují se jako
 * jednoduché karty na stránce /projekty, žádnou vlastní podstránku nemají.
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen, verejneCteni } from '../access'

export const Projekty: CollectionConfig = {
  slug: 'projekty',

  labels: {
    singular: 'Projekt',
    plural: 'Projekty',
  },

  typescript: {
    interface: 'Projekt',
  },

  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'updatedAt'],
    group: 'Obsah',
    description: 'Projekty, do kterých je školka dlouhodobě zapojená (např. Recyklohraní).',
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
      label: 'Název projektu',
      required: true,
    },
    {
      name: 'popis',
      type: 'textarea',
      label: 'Krátký popis',
      admin: {
        description: 'Pár vět o tom, o co v projektu jde.',
      },
    },
    {
      name: 'obrazek',
      type: 'upload',
      relationTo: 'media',
      label: 'Fotka / logo projektu',
    },
  ],
}
