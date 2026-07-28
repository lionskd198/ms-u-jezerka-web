// Dočasný pomocný skript — smaže staré záznamy médií/dokumentů vázané na
// (teď už neexistující) lokální disk, ať je hlavní seed skript, který
// běží hned po tomhle, vytvoří znovu — tentokrát už v S3 úložišti.
// Používá Local API, takže nepotřebuje přihlašovací token.
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

const run = async () => {
  const payload = await getPayload({ config })

  await payload.updateGlobal({ slug: 'o-nas', data: { fotografie: [] } })
  console.log('✅ o-nas.fotografie vyčištěno')

  const media = await payload.find({ collection: 'media', limit: 50 })
  for (const m of media.docs) {
    await payload.delete({ collection: 'media', id: m.id })
    console.log(`✅ smazáno media ${m.id} (${m.alt})`)
  }

  const dokumenty = await payload.find({ collection: 'dokumenty', limit: 50 })
  for (const d of dokumenty.docs) {
    await payload.delete({ collection: 'dokumenty', id: d.id })
    console.log(`✅ smazán dokument ${d.id} (${d.nazev})`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Selhalo:', err)
  process.exit(1)
})
