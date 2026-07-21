/**
 * Kontaktní formulář „Napište nám" (dle návrhu).
 *
 * `'use client'` = tohle je klientská komponenta — běží v prohlížeči,
 * protože potřebuje reagovat na odeslání formuláře. (Všechny ostatní
 * komponenty webu jsou serverové a JavaScript do prohlížeče neposílají.)
 *
 * Web zatím nemá vlastní odesílání e-mailů, takže formulář po odeslání
 * otevře e-mailový program návštěvníka s předvyplněnou zprávou (mailto:).
 * Až budeš chtít skutečné odesílání, dá se napojit např. Payload plugin
 * `@payloadcms/plugin-form-builder` nebo služba typu Resend.
 */
'use client'

import React from 'react'

export function KontaktniFormular({ email }: { email: string }) {
  const odeslat = (event: React.FormEvent<HTMLFormElement>) => {
    // Zabráníme výchozímu odeslání (které by jen obnovilo stránku)…
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const jmeno = data.get('jmeno')?.toString() ?? ''
    const zprava = data.get('zprava')?.toString() ?? ''
    // …a místo toho otevřeme e-mailový program s předvyplněným obsahem.
    const predmet = encodeURIComponent(`Zpráva z webu — ${jmeno}`)
    const telo = encodeURIComponent(zprava)
    window.location.href = `mailto:${email}?subject=${predmet}&body=${telo}`
  }

  const stylPole =
    'rounded-karta border border-black/15 px-4 py-3 text-[15px] font-telo outline-none focus:border-primary'

  return (
    <form
      onSubmit={odeslat}
      className="flex max-w-[560px] flex-col gap-3.5 rounded-karta bg-panel p-7 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <input name="jmeno" placeholder="Jméno" required className={stylPole} />
      <input name="odesilatel" type="email" placeholder="E-mail" required className={stylPole} />
      <textarea name="zprava" placeholder="Zpráva" rows={4} required className={`${stylPole} resize-y`} />
      <button
        type="submit"
        className="self-start rounded-karta bg-primary px-[26px] py-3 text-[15px] font-bold text-white transition-[filter] hover:brightness-110"
      >
        Odeslat
      </button>
    </form>
  )
}
