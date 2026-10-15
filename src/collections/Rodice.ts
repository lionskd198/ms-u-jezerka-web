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
    components: {
      // Nad výpisem formulář pro vložení celého seznamu adres jedné třídy.
      beforeList: ['/components/admin/HromadnyImportRodicu#HromadnyImportRodicu'],
    },
  },

  endpoints: [
    {
      /**
       * POST /api/rodice/hromadny-import  { trida: id, emaily: "text" }
       * Rozdělí text na adresy, vyhodí duplicity a každou adresu založí,
       * nebo existujícímu rodiči třídu PŘIDÁ (ostatní třídy mu nechá).
       */
      path: '/hromadny-import',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ chyba: 'Nejste přihlášen.' }, { status: 401 })

        const telo = (req.json ? await req.json() : {}) as { trida?: number | string; emaily?: string }
        const idTridy = Number(telo.trida)
        if (!idTridy) return Response.json({ chyba: 'Vyberte třídu.' }, { status: 400 })

        // Duplicity poznáme bez ohledu na velikost písmen, zapíše se tvar z prvního výskytu.
        const unikatni = new Map<string, string>()
        for (const kus of String(telo.emaily ?? '').split(/[\s,;]+/)) {
          if (kus.includes('@') && !unikatni.has(kus.toLowerCase())) unikatni.set(kus.toLowerCase(), kus)
        }

        let nove = 0
        let pridanaTrida = 0
        let bezZmeny = 0
        const chyby: string[] = []
        for (const email of unikatni.values()) {
          try {
            const existujici = await req.payload.find({
              collection: 'rodice',
              where: { email: { equals: email } },
              limit: 1,
              depth: 0,
              req,
            })
            const rodic = existujici.docs[0]
            if (!rodic) {
              await req.payload.create({
                collection: 'rodice',
                data: { email, tridy: [idTridy], odebira: true },
                req,
              })
              nove++
              continue
            }
            const tridy = (rodic.tridy ?? []).map((t) => (typeof t === 'object' ? t.id : t))
            if (tridy.includes(idTridy)) {
              bezZmeny++
              continue
            }
            await req.payload.update({
              collection: 'rodice',
              id: rodic.id,
              data: { tridy: [...tridy, idTridy] },
              req,
            })
            pridanaTrida++
          } catch (err) {
            chyby.push(`${email}: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        return Response.json({ nove, pridanaTrida, bezZmeny, chyby })
      },
    },
  ],

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
        components: {
          // Ve výpisech fajfka / křížek místo textu „pravda / nepravda".
          Cell: '/components/admin/BunkaAnoNe#BunkaAnoNe',
        },
      },
    },
  ],
}
