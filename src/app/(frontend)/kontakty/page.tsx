/**
 * =============================================================================
 * STRÁNKA: Kontakty ( /kontakty )
 * =============================================================================
 *
 * Rozvržení dle návrhu: karta s adresou a provozem + místo pro mapu,
 * pod tím karty tříd, seznamy zaměstnanců a kontaktní formulář.
 *
 * Všechna data pocházejí z globalu "Kontakty" v Payloadu — když se změní
 * telefonní číslo nebo nastoupí nová paní učitelka, upraví se to
 * v administraci a web se aktualizuje sám.
 */
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { KontaktniFormular } from '../komponenty/KontaktniFormular'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kontakty',
}

export default async function KontaktyStranka() {
  const payload = await getPayload({ config })
  const kontakty = await payload.findGlobal({ slug: 'kontakty' })
  const tridy = await payload.find({ collection: 'tridy', sort: 'nazev', limit: 100, depth: 1 })

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Kontakty</h1>
      <p className="mb-9 text-base text-tlumena">
        Spojte se s námi nebo s učitelkami jednotlivých tříd.
      </p>

      {/* ===== Adresa a provoz + místo pro mapu ===== */}
      <div className="mb-11 grid gap-7 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-karta bg-panel p-7 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 font-nadpisy text-[19px] font-bold">Adresa a provoz</h2>
          <div className="text-[15px] leading-[1.9]">
            {kontakty.nazevSkoly}
            {kontakty.adresa && (
              <>
                <br />
                <span className="whitespace-pre-line">{kontakty.adresa}</span>
              </>
            )}
            {kontakty.telefony?.map((telefon) => (
              <React.Fragment key={telefon.id}>
                <br />
                {telefon.popisek}:{' '}
                <a href={`tel:${telefon.cislo.replace(/\s/g, '')}`} className="text-primary">
                  {telefon.cislo}
                </a>
              </React.Fragment>
            ))}
            {kontakty.email && (
              <>
                <br />
                E-mail:{' '}
                <a href={`mailto:${kontakty.email}`} className="text-primary underline">
                  {kontakty.email}
                </a>
              </>
            )}
            {kontakty.facebook && (
              <>
                <br />
                Facebook: {kontakty.facebook}
              </>
            )}
            {kontakty.provozniDoba && (
              <>
                <br />
                Provozní doba: {kontakty.provozniDoba}
              </>
            )}
          </div>
        </div>

        {/* Mapa — Google Maps embed nepotřebuje API klíč, stačí adresa
            v URL. Bere se přímo z pole "Adresa" v administraci (Kontakty),
            takže se automaticky aktualizuje, když adresu někdy změníš. */}
        {kontakty.adresa ? (
          <iframe
            title="Mapa — poloha školky"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${kontakty.nazevSkoly}, ${kontakty.adresa}`,
            )}&output=embed`}
            className="h-full min-h-[180px] w-full overflow-hidden rounded-karta border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-karta bg-[repeating-linear-gradient(45deg,var(--color-primary),var(--color-primary)_12px,var(--color-primary-tmava)_12px,var(--color-primary-tmava)_24px)]">
            <div className="rounded-lg bg-white/90 px-4 py-2.5 font-mono text-[13px] text-primary-tmava">
              zde vložit mapu
            </div>
          </div>
        )}
      </div>

      {/* ===== Třídy a učitelky (odkaz na vlastní stránku každé třídy) ===== */}
      {tridy.docs.length > 0 && (
        <>
          <h2 className="mb-4 font-nadpisy text-[22px] font-bold">Třídy a učitelky</h2>
          <div className="mb-11 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {tridy.docs.map((trida) => {
              const logo = typeof trida.logo === 'object' ? trida.logo : null
              return (
                <Link
                  key={trida.id}
                  href={`/tridy/${trida.slug}`}
                  className="block rounded-karta bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]"
                >
                  {logo?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo.sizes?.karta?.url ?? logo.url}
                      alt={logo.alt}
                      className="mb-3.5 h-16 w-auto max-w-[160px] rounded-karta object-contain"
                    />
                  ) : (
                    <span aria-hidden className="mb-3.5 block h-16 w-16 rounded-karta bg-akcent2" />
                  )}
                  <div className="mb-1 font-nadpisy text-lg font-bold">{trida.nazev}</div>
                  {trida.vek && (
                    <div className="mb-3 text-[13px] font-semibold text-tlumena">{trida.vek}</div>
                  )}
                  {trida.ucitelky && trida.ucitelky.length > 0 && (
                    <div className="text-sm leading-relaxed">
                      {trida.ucitelky.map((u) => u.jmeno).join(', ')}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* ===== Zaměstnanci ===== */}
      <h2 className="mb-4 font-nadpisy text-[22px] font-bold">Náš tým</h2>
      <div className="mb-11 grid gap-5 sm:grid-cols-2">
        <div className="rounded-karta bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 font-nadpisy text-lg font-bold text-primary">Pedagogický sbor</h3>
          {kontakty.vedouci && (
            <p className="mb-2 text-sm">
              <span className="font-bold">Vedoucí učitelka:</span> {kontakty.vedouci}
            </p>
          )}
          <ul className="space-y-1 text-sm">
            {kontakty.pedagogove?.map((pedagog) => <li key={pedagog.id}>{pedagog.jmeno}</li>)}
          </ul>
        </div>
        <div className="rounded-karta bg-panel p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 font-nadpisy text-lg font-bold text-primary">
            Provozní zaměstnanci
          </h3>
          <ul className="space-y-1 text-sm">
            {kontakty.provozniZamestnanci?.map((zamestnanec) => (
              <li key={zamestnanec.id}>{zamestnanec.jmeno}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Kontaktní formulář ===== */}
      <h2 className="mb-4 font-nadpisy text-[22px] font-bold">Napište nám</h2>
      <KontaktniFormular email={kontakty.email ?? ''} />
    </main>
  )
}
