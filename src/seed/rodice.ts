/**
 * Úvodní naplnění adresáře Rodiče (testovací adresy pro rozesílání aktualit).
 *
 * Spuštění:  npx tsx src/seed/rodice.ts
 * Proti produkci VŽDY s NODE_ENV=production (jinak Payload naběhne v dev
 * režimu a zapíše do databáze značku, která pak zablokuje start webu).
 *
 * Jde spustit opakovaně — existující adresu jen aktualizuje.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

/** E-mail → části slugů tříd, do kterých rodič patří. */
const RODICE = [
  { email: 'martin.kladnak@gmail.com', tridy: ['rybicky'] },
  { email: 'martin.skd@seznam.cz', tridy: ['zelvicky'] },
]

const run = async () => {
  const payload = await getPayload({ config })
  const tridy = await payload.find({ collection: 'tridy', limit: 100, depth: 0 })

  for (const rodic of RODICE) {
    const idTrid = rodic.tridy.map((cast) => {
      const trida = tridy.docs.find((t) => t.slug?.includes(cast))
      if (!trida) throw new Error(`Třída se slugem obsahujícím „${cast}" neexistuje.`)
      return trida.id
    })

    const existujici = await payload.find({
      collection: 'rodice',
      where: { email: { equals: rodic.email } },
      limit: 1,
    })

    if (existujici.docs[0]) {
      await payload.update({
        collection: 'rodice',
        id: existujici.docs[0].id,
        data: { tridy: idTrid, odebira: true },
      })
    } else {
      await payload.create({
        collection: 'rodice',
        data: { email: rodic.email, tridy: idTrid, odebira: true },
      })
    }
    payload.logger.info(`Rodič ${rodic.email} → třídy: ${rodic.tridy.join(', ')}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Seed rodičů selhal:', err)
  process.exit(1)
})
