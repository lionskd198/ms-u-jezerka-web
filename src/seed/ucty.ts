/**
 * =============================================================================
 * SKRIPT: Vytvoření uživatelských účtů (admin + editor)
 * =============================================================================
 *
 * Spuštění:  npm run seed:ucty
 *
 * Vytvoří dva účty s NÁHODNĚ VYGENEROVANÝMI hesly a vypíše je do konzole:
 *   - administrátor (ty) — plná práva včetně správy uživatelů
 *   - editor — smí spravovat obsah (aktuality, dokumenty, obrázky, texty
 *     stránek), ale nevidí správu uživatelů
 *
 * ⚠️ Hesla se zobrazí JEN JEDNOU při běhu skriptu. Po prvním přihlášení
 * si je změňte v administraci (ikona účtu vpravo nahoře → Účet).
 *
 * Skript je bezpečné pustit opakovaně — existující účty přeskočí.
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Vygeneruje náhodné, ale opsatelné heslo (bez matoucích znaků jako 0/O).
 * `crypto.randomBytes` je kryptograficky bezpečný zdroj náhody.
 */
const vygenerujHeslo = (delka = 16): string => {
  const znaky = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const nahodne = randomBytes(delka)
  return Array.from(nahodne, (bajt) => znaky[bajt % znaky.length]).join('')
}

const UCTY = [
  {
    email: 'martinkladnak@gmail.com',
    jmeno: 'Martin Kladňák',
    role: 'admin' as const,
    popis: 'ADMINISTRÁTOR',
  },
  {
    email: 'editor@msujezerka.cz',
    jmeno: 'Editor školky',
    role: 'editor' as const,
    popis: 'EDITOR',
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  console.log('\n════════════════════════════════════════════════════════')
  console.log('  Vytváření účtů — hesla si ULOŽTE, zobrazí se jen teď!')
  console.log('════════════════════════════════════════════════════════')

  // Účty vytváříme v pořadí admin → editor. Kdyby byla databáze prázdná,
  // hook v Users.ts udělá z prvního účtu admina — proto je admin první.
  for (const ucet of UCTY) {
    // Kontrola, jestli účet už neexistuje (skript jde pouštět opakovaně)
    const existujici = await payload.find({
      collection: 'users',
      where: { email: { equals: ucet.email } },
      limit: 1,
    })

    if (existujici.totalDocs > 0) {
      console.log(`\n  ${ucet.popis}: ${ucet.email} už existuje — přeskakuji.`)
      continue
    }

    const heslo = vygenerujHeslo()

    await payload.create({
      collection: 'users',
      data: {
        email: ucet.email,
        password: heslo,
        jmeno: ucet.jmeno,
        role: ucet.role,
      },
    })

    console.log(`\n  ${ucet.popis}`)
    console.log(`  E-mail: ${ucet.email}`)
    console.log(`  Heslo:  ${heslo}`)
  }

  console.log('\n════════════════════════════════════════════════════════')
  console.log('  Přihlášení: http://localhost:3000/admin')
  console.log('  Po prvním přihlášení si heslo změňte!')
  console.log('════════════════════════════════════════════════════════\n')

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Vytvoření účtů selhalo:', err)
  process.exit(1)
})
