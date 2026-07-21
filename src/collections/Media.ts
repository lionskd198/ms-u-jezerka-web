/**
 * =============================================================================
 * KOLEKCE: Média (obrázky)
 * =============================================================================
 *
 * Tohle je tzv. UPLOAD kolekce — díky bloku `upload` umí Payload k záznamům
 * ukládat soubory. Editor v administraci prostě přetáhne obrázek myší,
 * Payload ho uloží na disk (do složky /media) a do databáze zapíše metadata
 * (název souboru, velikost, rozměry…).
 *
 * Payload navíc pomocí knihovny `sharp` automaticky vygeneruje zmenšené
 * verze každého obrázku (viz `imageSizes`) — web pak nemusí rodičům posílat
 * 5MB fotky z mobilu, ale rozumně velké náhledy.
 */
import type { CollectionConfig } from 'payload'

import { jePrihlasen, verejneCteni } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',

  labels: {
    singular: 'Obrázek',
    plural: 'Obrázky',
  },

  admin: {
    group: 'Obsah',
    description: 'Fotky a obrázky pro web — do článků, na úvodní stránku…',
  },

  access: {
    // Obrázky si musí umět stáhnout každý návštěvník webu.
    read: verejneCteni,
    // Nahrávat, upravovat a mazat je smí admin i editor.
    create: jePrihlasen,
    update: jePrihlasen,
    delete: jePrihlasen,
  },

  upload: {
    // Složka na disku, kam se soubory fyzicky ukládají.
    staticDir: 'media',
    // Povolíme jen obrázky — dokumenty (PDF…) mají vlastní kolekci Dokumenty.
    mimeTypes: ['image/*'],
    // Automaticky generované velikosti. Payload ke každému nahranému obrázku
    // vytvoří tyto varianty a web si pak vybere tu nejvhodnější.
    imageSizes: [
      {
        name: 'nahled', // malý náhled do výpisů
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'karta', // střední velikost do karet článků
        width: 768,
        height: undefined, // výška se dopočítá podle poměru stran
      },
      {
        name: 'velky', // velký obrázek do hlavičky článku
        width: 1600,
        height: undefined,
      },
    ],
    // Náhled, který se ukáže v administraci ve výpisu.
    adminThumbnail: 'nahled',
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Popis obrázku (alt text)',
      required: true,
      admin: {
        description:
          'Krátký popis toho, co je na obrázku — čtou ho nevidomí uživatelé a vyhledávače.',
      },
    },
  ],
}
