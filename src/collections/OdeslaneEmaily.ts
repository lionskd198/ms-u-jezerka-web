/**
 * =============================================================================
 * KOLEKCE: Odeslané e-maily (přehled rozesílání aktualit)
 * =============================================================================
 *
 * Jeden záznam = jeden e-mail jednomu rodiči. Zapisuje je jen systém při
 * rozesílání aktuality (viz src/email/rozeslatAktualitu.ts) — editor je
 * v administraci pouze čte, aby viděl, komu zpráva odešla a komu ne.
 *
 * „Odesláno" znamená, že zprávu převzal poštovní server Seznamu. Jestli ji
 * pak příjemce opravdu dostal (a ne třeba do spamu), odsud poznat nejde.
 */
import type { CollectionConfig } from 'payload'

import { jeAdmin, jePrihlasen } from '../access'

export const OdeslaneEmaily: CollectionConfig = {
  slug: 'odeslane-emaily',

  labels: {
    singular: 'Odeslaný e-mail',
    plural: 'Odeslané e-maily',
  },

  typescript: {
    interface: 'OdeslanyEmail',
  },

  defaultSort: '-createdAt',

  admin: {
    useAsTitle: 'prijemce',
    defaultColumns: ['createdAt', 'prijemce', 'stav', 'aktualita', 'chyba'],
    group: 'Správa',
    description:
      'Přehled e-mailů rozeslaných rodičům — komu, kdy, ke které aktualitě a jestli se odeslání povedlo. Záznamy vytváří systém sám.',
  },

  access: {
    read: jePrihlasen,
    // Ručně se nic nezakládá ani neupravuje — zapisuje jen systém.
    create: () => false,
    update: () => false,
    delete: jeAdmin,
  },

  fields: [
    {
      name: 'prijemce',
      type: 'text',
      label: 'Příjemce',
      required: true,
      index: true,
    },
    {
      name: 'stav',
      type: 'select',
      label: 'Stav',
      required: true,
      options: [
        { label: '✓ Odesláno', value: 'odeslano' },
        { label: '✗ Chyba', value: 'chyba' },
      ],
    },
    {
      name: 'aktualita',
      type: 'relationship',
      relationTo: 'aktuality',
      label: 'Aktualita',
    },
    {
      name: 'predmet',
      type: 'text',
      label: 'Předmět zprávy',
    },
    {
      name: 'chyba',
      type: 'textarea',
      label: 'Popis chyby',
      admin: {
        condition: (data) => data?.stav === 'chyba',
      },
    },
  ],
}
