/**
 * =============================================================================
 * STRÁNKA: Dokumenty ( /dokumenty )
 * =============================================================================
 *
 * Zobrazuje všechny nahrané dokumenty seskupené podle kategorií — dle návrhu
 * jako řádky s ikonou dokumentu, názvem, metadaty (typ · velikost)
 * a odkazem „Stáhnout ↓".
 *
 * Pořadí i názvy kategorií bereme z konstanty KATEGORIE_DOKUMENTU
 * (definované u kolekce Dokumenty) — jediné místo pravdy.
 */
import { getPayload } from 'payload'
import React from 'react'

import { KATEGORIE_DOKUMENTU } from '@/collections/Dokumenty'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dokumenty',
}

/** Přepočet velikosti souboru z bajtů na čitelný text (např. „240 kB"). */
const velikostSouboru = (bajty: number | null | undefined): string => {
  if (!bajty) return ''
  if (bajty < 1024 * 1024) return `${Math.round(bajty / 1024)} kB`
  return `${(bajty / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Z MIME typu souboru odvodí zkratku pro zobrazení (PDF, DOCX…). */
const typSouboru = (mime: string | null | undefined): string => {
  if (!mime) return ''
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('wordprocessingml')) return 'DOCX'
  if (mime.includes('msword')) return 'DOC'
  if (mime.includes('spreadsheetml')) return 'XLSX'
  if (mime.includes('ms-excel')) return 'XLS'
  if (mime.startsWith('image/')) return 'Obrázek'
  return ''
}

export default async function DokumentyStranka() {
  const payload = await getPayload({ config })

  // Načteme všechny dokumenty najednou (řazené podle názvu)…
  const dokumenty = await payload.find({
    collection: 'dokumenty',
    sort: 'nazev',
    limit: 200,
  })

  // …a rozdělíme je do skupin podle kategorie.
  const skupiny = KATEGORIE_DOKUMENTU.map((kategorie) => ({
    ...kategorie,
    dokumenty: dokumenty.docs.filter((d) => d.kategorie === kategorie.value),
  })).filter((skupina) => skupina.dokumenty.length > 0) // prázdné kategorie nezobrazujeme

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-7 pb-[90px] pt-14">
      <h1 className="mb-2 font-nadpisy text-4xl font-extrabold">Dokumenty</h1>
      <p className="mb-9 text-base text-tlumena">
        Řády, formuláře a další materiály ke stažení.
      </p>

      {skupiny.length === 0 ? (
        <p className="text-tlumena">Zatím tu nejsou žádné dokumenty.</p>
      ) : (
        <div className="flex flex-col gap-9">
          {skupiny.map((skupina) => (
            <section key={skupina.value}>
              <h2 className="mb-3.5 font-nadpisy text-[19px] font-bold text-primary">
                {skupina.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {skupina.dokumenty.map((dokument) => (
                  <a
                    key={dokument.id}
                    href={dokument.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-karta border border-black/10 bg-panel px-5 py-4 transition-[border-color,box-shadow] hover:border-primary hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                  >
                    {/* Ikona dokumentu z návrhu: obdélník s „ohnutým rohem" */}
                    <span aria-hidden className="relative h-10 w-[34px] shrink-0 rounded bg-akcent2">
                      <span className="absolute right-0 top-0 h-0 w-0 border-b-[10px] border-r-[10px] border-b-transparent border-r-pozadi" />
                    </span>
                    <span className="flex-1 text-[15px] font-semibold">
                      {dokument.nazev}
                      {dokument.popis && (
                        <span className="block text-[13px] font-normal text-tlumena">
                          {dokument.popis}
                        </span>
                      )}
                    </span>
                    <span className="text-[13px] font-semibold text-tlumena">
                      {[typSouboru(dokument.mimeType), velikostSouboru(dokument.filesize)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <span className="text-sm font-bold text-primary">Stáhnout ↓</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
