/**
 * =============================================================================
 * STRÁNKA: Prohlášení o přístupnosti ( /prohlaseni-o-pristupnosti )
 * =============================================================================
 *
 * Povinné prohlášení dle zákona č. 99/2019 Sb. o přístupnosti internetových
 * stránek. Text je převzatý z podepsaného dokumentu (vypracováno 1. 9. 2026),
 * proto je napevno tady a ne v administraci — jde o právní text, který se
 * mění jen výjimečně. Při změně (např. nové posouzení) uprav i datum.
 *
 * Odkaz na stránku je v patičce (layout.tsx), jak zákon vyžaduje.
 */
import React from 'react'

export const metadata = {
  title: 'Prohlášení o přístupnosti',
}

/** Nadpis sekce — stejný styl jako na ostatních textových stránkách. */
function Nadpis({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 font-nadpisy text-[22px] font-bold">{children}</h2>
}

export default function ProhlaseniOPristupnostiStranka() {
  return (
    <main className="mx-auto w-full max-w-[800px] flex-1 px-7 pb-[90px] pt-14 text-base leading-relaxed">
      <h1 className="mb-6 font-nadpisy text-4xl font-extrabold">Prohlášení o přístupnosti</h1>

      <p className="mb-4">
        Mateřská škola 1. U Jezérka se zavazuje k přístupnosti svých internetových stránek
        v souladu se zákonem č. 99/2019 Sb., o přístupnosti internetových stránek a mobilních
        aplikací a o změně zákona č. 365/2000 Sb., o informačních systémech veřejné správy
        a o změně některých dalších zákonů, ve znění pozdějších předpisů, které provádějí
        směrnici Evropského parlamentu a Rady (EU) 2016/2102.
      </p>
      <p>
        Toto prohlášení o přístupnosti se vztahuje na internetové stránky{' '}
        <strong>www.msujezerkaratiskovice.cz</strong>.
      </p>

      <Nadpis>Stav souladu</Nadpis>
      <p className="mb-4">
        Uvedené internetové stránky jsou <strong>částečně v souladu</strong> se zákonem
        č. 99/2019 Sb. z důvodu nedostatečně přístupného obsahu nebo výjimek uvedených níže:
      </p>
      <p>
        <strong>Fotogalerie na externí platformě (Rajče.net):</strong> Školka pro prezentaci
        fotografií z akcí využívá externí službu Rajče.net. Tato platforma třetí strany nesplňuje
        plně standardy přístupnosti (zejména chybí textové popisy jednotlivých fotografií pro
        čtečky obrazovky a ovládací prvky galerie nejsou plně uzpůsobeny pro asistivní
        technologie). Zajištění plné přístupnosti u tisíců průběžně nahrávaných fotografií dětí
        a úprava cizí platformy by pro naši organizaci představovala nepřiměřenou zátěž ve smyslu
        § 7 zákona č. 99/2019 Sb. Pokud by zrakově znevýhodněná osoba potřebovala získat
        informace o obsahu konkrétního alba, poskytneme jí slovní popis na vyžádání přes uvedené
        kontakty.
      </p>

      <Nadpis>Vypracování tohoto prohlášení o přístupnosti</Nadpis>
      <p className="mb-4">Toto prohlášení bylo vypracováno dne 1. 9. 2026.</p>
      <p>
        Prohlášení bylo vypracováno na základě vlastního posouzení provedeného mateřskou školou
        za použití metodického pokynu Ministerstva vnitra ČR a standardu WCAG 2.1.
      </p>

      <Nadpis>Zpětná vazba a kontaktní údaje</Nadpis>
      <p className="mb-4">
        Naším cílem je, aby byl web přístupný všem uživatelům bez rozdílu. Pokud narazíte na
        jakýkoliv problém s přístupností našich stránek nebo potřebujete informace
        z nepřístupných dokumentů v jiné formě, kontaktujte nás prosím:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6">
        <li>
          E-mail:{' '}
          <a href="mailto:msujezerka@seznam.cz" className="text-primary underline">
            msujezerka@seznam.cz
          </a>
        </li>
        <li>
          Telefon:{' '}
          <a href="tel:+420604625021" className="text-primary underline">
            604 625 021
          </a>
        </li>
        <li>Adresa: MŠ 1. U Jezérka 670, Ratíškovice 696 02</li>
      </ul>
      <p>
        Vaše podněty zpracujeme a případné nedostatky se pokusíme v co nejkratší době odstranit.
      </p>

      <Nadpis>Postupy pro prosazování práva</Nadpis>
      <p className="mb-4">
        V případě, že na vaši žádost či upozornění neodpovíme nebo neodpovíme uspokojivě, máte
        právo obrátit se na příslušný orgán pro prosazování práva, kterým je:
      </p>
      <address className="not-italic">
        <strong>Digitální a informační agentura</strong>
        <br />
        Na Vítězné pláni 1719/4
        <br />
        140 00 Praha 4
        <br />
        E-mail:{' '}
        <a href="mailto:pristupnost@dia.gov.cz" className="text-primary underline">
          pristupnost@dia.gov.cz
        </a>
      </address>
    </main>
  )
}
