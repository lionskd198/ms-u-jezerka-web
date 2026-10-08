/**
 * =============================================================================
 * ROZESLÁNÍ AKTUALITY RODIČŮM E-MAILEM
 * =============================================================================
 *
 * Volá se z hooku kolekce Aktuality ve chvíli, kdy editor článek publikuje
 * a zvolil „Rozeslat e-mailem" (všem / vybraným třídám).
 *
 * Každý rodič dostane VLASTNÍ e-mail (ne jeden hromadný s adresami v kopii) —
 * nikdo tak nevidí adresy ostatních rodičů.
 *
 * Odesílá se přes SMTP nastavené v payload.config.ts (Seznam). Běží až po
 * uložení článku na pozadí, aby editor nečekal desítky vteřin na „Uloženo";
 * výsledek se pak zapíše zpět k článku do pole „Výsledek rozeslání".
 */
import type { BasePayload, Where } from 'payload'

import type { Aktualita } from '../payload-types'

/** Pauza mezi e-maily — ať SMTP server nedostane desítky zpráv naráz. */
const PAUZA_MEZI_EMAILY_MS = 400

const pockej = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const escapujHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Z JSON obsahu editoru vytáhne čistý text (zkrácený) jako ukázku do e-mailu. */
const ukazkaTextu = (obsah: Aktualita['obsah'], maxDelka = 400): string => {
  const texty: string[] = []
  const projdi = (uzel: unknown) => {
    if (!uzel || typeof uzel !== 'object') return
    const u = uzel as { text?: string; children?: unknown[] }
    if (typeof u.text === 'string') texty.push(u.text)
    u.children?.forEach(projdi)
  }
  projdi(obsah?.root)
  const cely = texty.join(' ').replace(/\s+/g, ' ').trim()
  return cely.length > maxDelka ? `${cely.slice(0, maxDelka - 1)}…` : cely
}

/** ID tříd z pole vztahů (to může obsahovat čísla i rozbalené objekty). */
const idTrid = (tridy: Aktualita['rozeslatTridam']): number[] =>
  (tridy ?? []).map((trida) => (typeof trida === 'object' ? trida.id : trida))

/** Najde e-maily rodičů podle volby u aktuality (všem / vybraným třídám). */
export const najdiPrijemce = async (
  payload: BasePayload,
  aktualita: Pick<Aktualita, 'rozeslani' | 'rozeslatTridam'>,
): Promise<string[]> => {
  const podminky: Where[] = [{ odebira: { equals: true } }]

  if (aktualita.rozeslani === 'tride') {
    const tridy = idTrid(aktualita.rozeslatTridam)
    if (tridy.length === 0) return []
    podminky.push({ tridy: { in: tridy } })
  }

  const rodice = await payload.find({
    collection: 'rodice',
    where: { and: podminky },
    limit: 2000,
    depth: 0,
  })

  // Stejná adresa nesmí dostat e-mail dvakrát.
  return Array.from(new Set(rodice.docs.map((rodic) => rodic.email.trim().toLowerCase())))
}

/** Předmět + tělo e-mailu (HTML i čistý text pro klienty bez HTML). */
export const sestavEmail = (
  aktualita: Pick<Aktualita, 'nazev' | 'slug' | 'obsah' | 'typ' | 'datumAkce'>,
  nastaveni: { adresaWebu: string; nazevSkoly: string; emailSkoly?: string | null },
) => {
  const odkaz = `${nastaveni.adresaWebu}/aktuality/${aktualita.slug}`
  const ukazka = ukazkaTextu(aktualita.obsah)
  const termin =
    aktualita.typ === 'akce' && aktualita.datumAkce
      ? new Date(aktualita.datumAkce).toLocaleString('cs-CZ', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Prague',
        })
      : null
  const odhlaseni = nastaveni.emailSkoly
    ? `Nechcete tyto e-maily dostávat? Napište nám na ${nastaveni.emailSkoly}.`
    : 'Nechcete tyto e-maily dostávat? Dejte nám prosím vědět ve školce.'

  const text = [
    aktualita.nazev,
    termin ? `Koná se: ${termin}` : null,
    ukazka || null,
    `Celou aktualitu najdete zde: ${odkaz}`,
    `— ${nastaveni.nazevSkoly}`,
    odhlaseni,
  ]
    .filter(Boolean)
    .join('\n\n')

  const html = `<!doctype html>
<html lang="cs">
  <body style="margin:0;padding:24px;background:#f6f3ea;font-family:Arial,Helvetica,sans-serif;color:#23303d;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#1f7a8c;">${escapujHtml(nastaveni.nazevSkoly)}</p>
      <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;">${escapujHtml(aktualita.nazev)}</h1>
      ${termin ? `<p style="margin:0 0 14px;font-weight:bold;">Koná se: ${escapujHtml(termin)}</p>` : ''}
      ${ukazka ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapujHtml(ukazka)}</p>` : ''}
      <p style="margin:0 0 24px;">
        <a href="${odkaz}" style="display:inline-block;background:#1f7a8c;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:12px;">Zobrazit celou aktualitu</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7785;">${escapujHtml(odhlaseni)}</p>
    </div>
  </body>
</html>`

  return { subject: `${nastaveni.nazevSkoly}: ${aktualita.nazev}`, text, html }
}

/**
 * Pošle aktualitu všem nalezeným příjemcům (každému zvlášť) a vrátí větu
 * s výsledkem pro editora. Chyba u jedné adresy rozesílku nezastaví.
 */
export const rozeslatAktualitu = async (
  payload: BasePayload,
  aktualita: Aktualita,
): Promise<string> => {
  if (!process.env.SMTP_HOST) {
    return 'Neodesláno — na serveru není nastavené odesílání e-mailů (SMTP).'
  }

  const prijemci = await najdiPrijemce(payload, aktualita)
  if (prijemci.length === 0) {
    return 'Neodesláno — pro zvolené třídy není v adresáři Rodiče žádná adresa.'
  }

  const kontakty = await payload.findGlobal({ slug: 'kontakty' })
  const email = sestavEmail(aktualita, {
    adresaWebu: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    nazevSkoly: kontakty.nazevSkoly || 'Mateřská škola',
    emailSkoly: kontakty.email,
  })

  let odeslano = 0
  const chyby: string[] = []

  for (const adresa of prijemci) {
    try {
      await payload.sendEmail({
        to: adresa,
        ...(kontakty.email && { replyTo: kontakty.email }),
        ...email,
      })
      odeslano += 1
    } catch (chyba) {
      chyby.push(adresa)
      payload.logger.error({ err: chyba, msg: `Rozeslání aktuality: e-mail na ${adresa} selhal` })
    }
    await pockej(PAUZA_MEZI_EMAILY_MS)
  }

  const cas = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })
  return chyby.length === 0
    ? `Odesláno ${odeslano} z ${prijemci.length} adres (${cas}).`
    : `Odesláno ${odeslano} z ${prijemci.length} adres (${cas}). Nepodařilo se: ${chyby.join(', ')}`
}
