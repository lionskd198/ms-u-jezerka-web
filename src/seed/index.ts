/**
 * =============================================================================
 * SEED SKRIPT — naplní databázi výchozím obsahem
 * =============================================================================
 *
 * Spuštění:  npm run seed
 *
 * Skript používá tzv. LOCAL API — Payload se dá volat přímo z Node.js kódu
 * (bez HTTP), stejné metody jako REST API: payload.create(), payload.find(),
 * payload.updateGlobal()… Local API standardně OBCHÁZÍ access control
 * (běží "jako systém"), proto seed nemusí být přihlášený.
 *
 * Skript jde spustit opakovaně — globals prostě přepíše a ukázkové aktuality
 * založí jen tehdy, když ještě žádné neexistují.
 */
// Načte proměnné z .env (DATABASE_URI, PAYLOAD_SECRET) — skript běží
// samostatně mimo Next.js, takže si je musí načíst sám.
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Pomocná funkce: vyrobí obsah pro pole typu `richText` z obyčejných odstavců.
 *
 * Editor Lexical ukládá text jako JSON strom uzlů (root → paragraph → text).
 * Když obsah vytváříme kódem (a ne v administraci), musíme ten JSON postavit
 * sami — tahle funkce to udělá za nás pro jednoduché odstavce textu.
 */
const odstavce = (...texty: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: texty.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'text',
          text,
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
    })),
  },
})

const seed = async () => {
  // Inicializace Payloadu — připojí se k databázi podle payload.config.ts
  const payload = await getPayload({ config })

  payload.logger.info('🌱 Plním databázi výchozím obsahem…')

  // ---------------------------------------------------------------------------
  // GLOBAL: Úvodní stránka — hero sekce a statistiky
  // ---------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'o-nas',
    data: {
      stitek: 'Vítejte na webu naší školky',
      nadpis: 'Mateřská škola U Jezérka',
      podtitulek:
        'Aktuální informace pro rodiče, dokumenty ke stažení a novinky ze tříd Žabičky, Želvičky a Rybičky.',
      statistiky: [
        { hodnota: '3', popisek: 'třídy' },
        { hodnota: '2–6', popisek: 'let — věk dětí' },
        { hodnota: '6', popisek: 'pedagožek' },
      ],
    },
  })
  payload.logger.info('✅ Global „Úvodní stránka" naplněn.')

  // ---------------------------------------------------------------------------
  // GLOBAL: Kontakty
  // ---------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'kontakty',
    data: {
      nazevSkoly: 'Mateřská škola U Jezérka Ratíškovice',
      adresa: 'Ratíškovice',
      provozniDoba: 'Po–Pá 6:30–16:00',
      email: 'msujezerka@seznam.cz',
      facebook: 'MŠ U Jezérka',
      tridy: [
        { nazev: 'I. třída — Žabičky', vek: 'nejmladší děti', ucitelky: '' },
        { nazev: 'II. třída — Želvičky', vek: 'prostřední třída', ucitelky: '' },
        { nazev: 'III. třída — Rybičky', vek: 'předškoláci', ucitelky: '' },
      ],
      telefony: [
        { popisek: 'Mateřská škola', cislo: '518 367 439' },
        { popisek: 'Mateřská škola (mobil)', cislo: '604 625 021' },
        { popisek: 'Základní škola', cislo: '518 367 660' },
        { popisek: 'Školní jídelna', cislo: '518 368 144' },
      ],
      vedouci: 'Zdeňka Šebková',
      pedagogove: [
        { jmeno: 'Nikol Dimitrovová' },
        { jmeno: 'Eva Kubíková' },
        { jmeno: 'Bc. Tereza Michenková' },
        { jmeno: 'Kamila Nemčeková' },
        { jmeno: 'Miroslava Slezáková' },
        { jmeno: 'Jitka Dobiášová' },
      ],
      provozniZamestnanci: [
        { jmeno: 'Marcela Kladňáková' },
        { jmeno: 'Dagmar Ondrouchová' },
        { jmeno: 'Kateřina Unčovská' },
      ],
    },
  })
  payload.logger.info('✅ Global „Kontakty" naplněn.')

  // ---------------------------------------------------------------------------
  // KOLEKCE: Aktuality — ukázkové články (jen pokud ještě žádné nejsou)
  // ---------------------------------------------------------------------------
  const { totalDocs } = await payload.count({ collection: 'aktuality' })

  if (totalDocs > 0) {
    payload.logger.info('ℹ️ Aktuality už existují — ukázkové články přeskakuji.')
  } else {
    // Ukázka článku typu "akce" — s datem konání
    await payload.create({
      collection: 'aktuality',
      data: {
        nazev: 'Muzikoterapie ve školce',
        typ: 'akce',
        datumAkce: '2026-06-18T09:00:00.000Z',
        obsah: odstavce(
          'Ve čtvrtek 18. června nás čeká oblíbená muzikoterapie. Děti si vyzkouší různé hudební nástroje, zazpívají si a zarelaxují při hudbě.',
          'Akce probíhá dopoledne v prostorách školky, není potřeba nic platit ani nosit.',
        ),
        publishedAt: new Date().toISOString(),
        // `_status: 'published'` = článek se rovnou publikuje.
        // Bez toho by zůstal jako koncept a na webu by nebyl vidět.
        _status: 'published',
      },
    })

    // Ukázka článku typu "informace"
    await payload.create({
      collection: 'aktuality',
      data: {
        nazev: 'Provoz školky o letních prázdninách',
        typ: 'informace',
        obsah: odstavce(
          'Vážení rodiče, informace o letním provozu školky a termínu uzavření najdete včas zde na webu a na nástěnkách jednotlivých tříd.',
          'V případě dotazů se obraťte na svou třídní učitelku.',
        ),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })

    // Ukázka článku typu "dokument" — upozornění na nový soubor
    await payload.create({
      collection: 'aktuality',
      data: {
        nazev: 'Nový jídelníček ke stažení',
        typ: 'dokument',
        obsah: odstavce(
          'V sekci Dokumenty najdete aktuální jídelníček na tento týden. Jídelníček pravidelně obměňujeme.',
        ),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })

    payload.logger.info('✅ Vytvořeny 3 ukázkové aktuality.')
  }

  payload.logger.info('🎉 Hotovo! Databáze je naplněná.')
  // Local API drží připojení k databázi — proces musíme ukončit ručně.
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed selhal:', err)
  process.exit(1)
})
