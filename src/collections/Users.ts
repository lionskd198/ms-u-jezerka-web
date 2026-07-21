/**
 * =============================================================================
 * KOLEKCE: Uživatelé (Users)
 * =============================================================================
 *
 * Co je "kolekce"? V Payloadu je kolekce = typ obsahu = tabulka v databázi.
 * Každý záznam kolekce je jeden "dokument" (řádek). Payload z této konfigurace
 * automaticky vytvoří tabulku v PostgreSQL, REST + GraphQL API a formuláře
 * v administraci — nic z toho nemusíš programovat ručně.
 *
 * Tato kolekce je navíc AUTENTIZAČNÍ (`auth: true`) — Payload jí automaticky
 * přidá pole email + heslo, přihlašování, odhlašování, reset hesla atd.
 *
 * Role v našem systému:
 *   - admin  → smí úplně vše, včetně správy uživatelských účtů (to jsi ty)
 *   - editor → smí spravovat obsah (aktuality, dokumenty, obrázky, texty),
 *              ale NEsmí zakládat/mazat uživatele ani měnit role
 */
import type { CollectionConfig } from 'payload'

import { jeAdmin, jeAdminNeboSam, jeAdminPole } from '../access'

export const Users: CollectionConfig = {
  // `slug` je systémový název kolekce — objeví se v URL adresách API
  // (např. /api/users) a v názvu tabulky v databázi.
  slug: 'users',

  // Popisky pro administraci — Payload je zobrazí místo systémového slugu.
  labels: {
    singular: 'Uživatel',
    plural: 'Uživatelé',
  },

  admin: {
    // Které pole se zobrazí jako "název" záznamu v přehledech administrace.
    useAsTitle: 'email',
    defaultColumns: ['email', 'jmeno', 'role'],
    // Skupina v levém menu administrace.
    group: 'Správa',
    description: 'Účty pro přístup do administrace. Role určuje, co kdo smí.',
    // Editorům celou kolekci v menu administrace schováme — stejně by s ní
    // nemohli nic dělat (viz `access` níže). `hidden` je jen kosmetika,
    // skutečnou ochranu zajišťuje access control!
    hidden: ({ user }) => user?.role !== 'admin',
  },

  /**
   * Zapne autentizaci — přidá email, heslo, přihlašování, JWT tokeny…
   * Objekt místo `true` navíc umožňuje zabezpečení doladit:
   */
  auth: {
    // Po 5 špatných pokusech o heslo se účet na 10 minut zamkne —
    // ochrana proti hádání hesel (brute force).
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // v milisekundách

    cookies: {
      // Přihlašovací cookie se neposílá při požadavcích z cizích webů.
      sameSite: 'Lax',
      // Na produkci (HTTPS) se cookie posílá jen šifrovaně.
      secure: process.env.NODE_ENV === 'production',
    },
  },

  access: {
    // Nové uživatele smí zakládat jen admin.
    // (Úplně první účet po instalaci vzniká speciálním endpointem
    //  "first register", který funguje jen dokud je databáze prázdná.)
    create: jeAdmin,
    // Seznam uživatelů vidí admin; editor vidí jen sám sebe.
    read: jeAdminNeboSam,
    // Upravit účet smí admin (kterýkoli), editor jen ten svůj.
    update: jeAdminNeboSam,
    // Mazat účty smí jen admin.
    delete: jeAdmin,
  },

  fields: [
    // Pole `email` a `password` přidává `auth: true` automaticky.
    {
      name: 'jmeno',
      type: 'text',
      label: 'Jméno',
      admin: {
        description: 'Celé jméno — zobrazuje se v administraci.',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrátor', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      // Field-level access: roli smí nastavit/změnit jen admin.
      // Bez tohohle by si editor mohl přes API sám nastavit roli "admin"!
      access: {
        create: jeAdminPole,
        update: jeAdminPole,
      },
      // `saveToJWT` uloží roli přímo do přihlašovacího tokenu, takže je
      // dostupná v access funkcích bez dalšího dotazu do databáze.
      saveToJWT: true,
    },
  ],

  hooks: {
    /**
     * Hook = vlastní funkce, kterou Payload spustí v určitou chvíli
     * životního cyklu dokumentu (před uložením, po smazání…).
     *
     * `beforeChange` běží těsně před uložením do databáze.
     * Tady řešíme jednu speciální situaci: ÚPLNĚ PRVNÍ uživatel
     * (zakládaný přes uvítací obrazovku /admin) musí být admin —
     * jinak by se do systému nikdy žádný admin nedostal.
     */
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) {
            data.role = 'admin'
          }
        }
        return data
      },
    ],
  },
}
