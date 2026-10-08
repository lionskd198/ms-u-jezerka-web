/**
 * =============================================================================
 * KOLEKCE: Rodiče (adresář pro rozesílání aktualit e-mailem)
 * =============================================================================
 *
 * Jeden záznam = jedna e-mailová adresa rodiče a třídy, do kterých chodí
 * jeho děti. Podle tříd se pak u aktuality vybírá, komu se e-mail pošle
 * (viz pole „Rozeslat e-mailem" v kolekci Aktuality).
 *
 * ⚠️ Jde o osobní údaje — na rozdíl od ostatního obsahu NEJSOU veřejně
 * čitelné. Vidí a spravuje je jen přihlášený uživatel (admin/editor).
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen } from '../access'

export const Rodice: CollectionConfig = {
  slug: 'rodice',

  labels: {
    singular: 'Rodič',
    plural: 'Rodiče',
  },

  typescript: {
    interface: 'Rodic',
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'jmeno', 'tridy', 'odebira'],
    group: 'Správa',
    description:
      'E-mailové adresy rodičů pro rozesílání aktualit. U aktuality se pak volí, jestli jde všem, nebo jen vybraným třídám.',
  },

  access: {
    read: jePrihlasen,
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'E-mail',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'jmeno',
      type: 'text',
      label: 'Jméno (nepovinné)',
    },
    {
      name: 'tridy',
      type: 'relationship',
      relationTo: 'tridy',
      hasMany: true,
      label: 'Třídy',
      admin: {
        description:
          'Třídy, do kterých chodí děti tohoto rodiče. Rozhoduje o tom, které e-maily „jen pro třídu" dostane.',
      },
    },
    {
      name: 'odebira',
      type: 'checkbox',
      label: 'Posílat e-maily',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Odškrtni, když si rodič e-maily nepřeje — adresa zůstane uložená, ale nic mu nepřijde.',
      },
    },
  ],
}
