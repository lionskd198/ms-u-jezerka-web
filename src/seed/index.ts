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
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

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
  // Obrázek do hero sekce (jezírko) — nahraje se do Médií, jen pokud tam
  // ještě není (podle alt textu), a použije se v globalu „Úvodní stránka".
  // ---------------------------------------------------------------------------
  const existujiciHeroObrazek = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Ilustrace jezírka se rákosím' } },
    limit: 1,
  })

  const heroObrazek =
    existujiciHeroObrazek.docs[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: 'Ilustrace jezírka se rákosím' },
      filePath: path.resolve(dirname, 'assets/hero-jezirko.png'),
    }))

  // ---------------------------------------------------------------------------
  // Fotka do sekce „O nás" — stejný princip jako hero obrázek výše.
  // Do globalu ji ale doplníme JEN pokud tam editor mezitím nenahrál svoje
  // vlastní fotky — seed nesmí přepsat to, co si editor v administraci
  // sám doplnil (viz `soucasnyONas.fotografie` níže).
  // ---------------------------------------------------------------------------
  const existujiciFotoONas = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Děti u ohniště na zahradě' } },
    limit: 1,
  })

  const fotoONas =
    existujiciFotoONas.docs[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: 'Děti u ohniště na zahradě' },
      filePath: path.resolve(dirname, 'assets/o-nas-foto-1.jpg'),
    }))

  const soucasnyONas = await payload.findGlobal({ slug: 'o-nas' })

  // ---------------------------------------------------------------------------
  // GLOBAL: Úvodní stránka — hero sekce
  // ---------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'o-nas',
    data: {
      stitek: 'Vítejte na webu naší školky',
      nadpis: 'Mateřská škola U Jezérka',
      podtitulek:
        'Aktuální informace pro rodiče, dokumenty ke stažení a novinky ze tříd Žabičky, Želvičky a Rybičky.',
      heroObrazek: heroObrazek.id,
      // Fotku přidáme, jen když sekce ještě žádnou nemá — jinak necháme
      // beze změny (klíč `fotografie` prostě vynecháme z dat k uložení).
      ...(!soucasnyONas.fotografie?.length && {
        fotografie: [{ obrazek: fotoONas.id, popisek: 'Děti u ohniště na zahradě' }],
      }),
      oNasNadpis: 'O nás',
      oNasText: odstavce(
        'Jsme trojtřídní mateřská škola v Ratíškovicích. Děti jsou u nás rozdělené do tříd podle věku, což nám umožňuje přizpůsobit činnosti tomu, co která věková skupina zrovna potřebuje.',
        'Naše velká zahrada sousedí přímo s lesem. Děti tu mají k dispozici průlezky, lanové prvky, venkovní hudební nástroje i malé jezírko, podle kterého se školka jmenuje. Velkou část dne proto trávíme venku.',
        'Děláme to proto, že věříme v prožitkové učení — děti si věci zkoušejí vlastníma rukama, protože co si samy vyzkouší, to si zapamatují nejlépe. Chceme, aby k nám děti chodily rády a odcházely samostatné a připravené na další krok.',
      ),
      // fotografie necháváme prázdné — nahraje editor v administraci.
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
      adresa: 'U Jezérka 670, 696 02 Ratíškovice',
      provozniDoba: 'Po–Pá 6:30–16:00',
      email: 'msujezerka@seznam.cz',
      facebook: 'MŠ U Jezérka',
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
  // KOLEKCE: Aktuality — ukázkové články. Každý se kontroluje zvlášť podle
  // názvu (ne najednou podle "existuje už nějaká aktualita?"), aby později
  // přidaná ukázka (jako fotogalerie) nezůstala navždy přeskočená jen proto,
  // že v databázi už jiné aktuality byly.
  // ---------------------------------------------------------------------------
  const UKAZKOVE_AKTUALITY = [
    {
      nazev: 'Muzikoterapie ve školce',
      typ: 'akce' as const,
      datumAkce: '2026-06-18T09:00:00.000Z',
      obsah: odstavce(
        'Ve čtvrtek 18. června nás čeká oblíbená muzikoterapie. Děti si vyzkouší různé hudební nástroje, zazpívají si a zarelaxují při hudbě.',
        'Akce probíhá dopoledne v prostorách školky, není potřeba nic platit ani nosit.',
      ),
    },
    {
      nazev: 'Provoz školky o letních prázdninách',
      typ: 'informace' as const,
      obsah: odstavce(
        'Vážení rodiče, informace o letním provozu školky a termínu uzavření najdete včas zde na webu a na nástěnkách jednotlivých tříd.',
        'V případě dotazů se obraťte na svou třídní učitelku.',
      ),
    },
    {
      nazev: 'Nový školní řád ke stažení',
      typ: 'dokument' as const,
      obsah: odstavce(
        'V sekci Dokumenty najdete aktuální znění školního řádu — pravidelně ho podle potřeby aktualizujeme.',
      ),
    },
    {
      nazev: 'Fotky z podzimní besídky',
      typ: 'fotogalerie' as const,
      odkazNaGalerii: 'https://www.rajce.idnes.cz/',
      obsah: odstavce(
        'Podívejte se na fotky z podzimní besídky — děti si užily tanečky, básničky i společné tvoření s rodiči.',
      ),
    },
  ]

  for (const aktualita of UKAZKOVE_AKTUALITY) {
    const existuje = await payload.find({
      collection: 'aktuality',
      where: { nazev: { equals: aktualita.nazev } },
      limit: 1,
    })
    if (existuje.totalDocs > 0) {
      continue
    }
    await payload.create({
      collection: 'aktuality',
      data: {
        ...aktualita,
        publishedAt: new Date().toISOString(),
        // `_status: 'published'` = článek se rovnou publikuje.
        // Bez toho by zůstal jako koncept a na webu by nebyl vidět.
        _status: 'published',
      },
    })
  }
  payload.logger.info('✅ Ukázkové aktuality zkontrolovány.')

  // ---------------------------------------------------------------------------
  // KOLEKCE: Dokumenty — pár ukázkových souborů ze skutečného webu školky
  // (msujezerkaratiskovice.cz), ať /dokumenty nevypadá prázdně. Každý se
  // nahraje jen pokud tam ještě není (podle názvu) — skript jde spustit znovu.
  // ---------------------------------------------------------------------------
  const UKAZKOVE_DOKUMENTY = [
    {
      nazev: 'Školní vzdělávací program',
      kategorie: 'vzdelavaci-program' as const,
      soubor: 'ukazkove-dokumenty/skolni-vzdelavaci-program.pdf',
    },
    {
      nazev: 'Školní řád',
      kategorie: 'rady-a-smernice' as const,
      soubor: 'ukazkove-dokumenty/skolni-rad.pdf',
    },
    {
      nazev: 'Přihláška k předškolnímu vzdělávání',
      kategorie: 'prihlasky-a-zapis' as const,
      soubor: 'ukazkove-dokumenty/prihlaska.pdf',
    },
    {
      nazev: 'Úplata za předškolní vzdělávání',
      kategorie: 'ostatni' as const,
      soubor: 'ukazkove-dokumenty/uplata-za-vzdelavani.pdf',
    },
  ]

  for (const dokument of UKAZKOVE_DOKUMENTY) {
    const existuje = await payload.find({
      collection: 'dokumenty',
      where: { nazev: { equals: dokument.nazev } },
      limit: 1,
    })
    if (existuje.totalDocs > 0) {
      continue
    }
    await payload.create({
      collection: 'dokumenty',
      data: { nazev: dokument.nazev, kategorie: dokument.kategorie },
      filePath: path.resolve(dirname, 'assets', dokument.soubor),
    })
  }
  payload.logger.info('✅ Ukázkové dokumenty nahrány.')

  // ---------------------------------------------------------------------------
  // KOLEKCE: Třídy — tři třídy školky, ať /tridy nevypadá prázdně. Editor si
  // pak v administraci doplní logo, popis, obsah i odkazy na fotogalerie.
  // ---------------------------------------------------------------------------
  const UKAZKOVE_TRIDY = [
    { nazev: 'I. třída — Žabičky', vek: 'nejmladší děti' },
    { nazev: 'II. třída — Želvičky', vek: 'prostřední třída' },
    { nazev: 'III. třída — Rybičky', vek: 'předškoláci' },
  ]

  for (const trida of UKAZKOVE_TRIDY) {
    const existuje = await payload.find({
      collection: 'tridy',
      where: { nazev: { equals: trida.nazev } },
      limit: 1,
    })
    if (existuje.totalDocs > 0) {
      continue
    }
    await payload.create({ collection: 'tridy', data: trida })
  }
  payload.logger.info('✅ Ukázkové třídy zkontrolovány.')

  payload.logger.info('🎉 Hotovo! Databáze je naplněná.')
  // Local API drží připojení k databázi — proces musíme ukončit ručně.
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed selhal:', err)
  process.exit(1)
})
