/**
 * =============================================================================
 * SKRIPT: Reset hesla existujícího uživatele (lokální vývoj)
 * =============================================================================
 *
 * Spuštění:  npx tsx src/seed/reset-heslo.ts <email>
 *
 * Najde uživatele podle e-mailu a nastaví mu nové náhodné heslo, které
 * vypíše do konzole. Používá Local API, takže nepotřebuje znát staré heslo.
 *
 * Tenhle soubor je pomocný nástroj pro nouzové situace (zapomenuté heslo)
 * — není součástí běžného workflow, klidně ho smaž, až ho nebudeš potřebovat.
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'

import config from '../payload.config'

const vygenerujHeslo = (delka = 16): string => {
  const znaky = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const nahodne = randomBytes(delka)
  return Array.from(nahodne, (bajt) => znaky[bajt % znaky.length]).join('')
}

const email = process.argv[2]

if (!email) {
  console.error('Použití: npx tsx src/seed/reset-heslo.ts <email>')
  process.exit(1)
}

const run = async () => {
  const payload = await getPayload({ config })

  const vysledek = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  const uzivatel = vysledek.docs[0]

  if (!uzivatel) {
    console.error(`❌ Uživatel s e-mailem "${email}" nenalezen.`)
    process.exit(1)
  }

  const noveHeslo = vygenerujHeslo()

  await payload.update({
    collection: 'users',
    id: uzivatel.id,
    data: { password: noveHeslo },
  })

  console.log('\n════════════════════════════════════════════════════════')
  console.log(`  Heslo pro ${email} (role: ${uzivatel.role}) resetováno`)
  console.log(`  Nové heslo: ${noveHeslo}`)
  console.log('  Přihlášení: http://localhost:3000/admin')
  console.log('════════════════════════════════════════════════════════\n')

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Reset selhal:', err)
  process.exit(1)
})
