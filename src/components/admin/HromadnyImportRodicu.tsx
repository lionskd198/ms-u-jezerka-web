'use client'
/**
 * Formulář nad výpisem Rodičů: vybrat třídu, vložit seznam e-mailů
 * (po řádcích, čárkách…) a jedním tlačítkem je všechny uložit.
 * Volá endpoint POST /api/rodice/hromadny-import (viz kolekce Rodice).
 */
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Trida = { id: number; nazev: string }
type Vysledek = { nove: number; pridanaTrida: number; bezZmeny: number; chyby: string[] }

export function HromadnyImportRodicu() {
  const router = useRouter()
  const [otevreno, setOtevreno] = useState(false)
  const [tridy, setTridy] = useState<Trida[]>([])
  const [trida, setTrida] = useState('')
  const [emaily, setEmaily] = useState('')
  const [odesila, setOdesila] = useState(false)
  const [vysledek, setVysledek] = useState<Vysledek | null>(null)
  const [chyba, setChyba] = useState('')

  useEffect(() => {
    if (!otevreno || tridy.length) return
    fetch('/api/tridy?limit=100&depth=0&sort=nazev', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setTridy(d.docs ?? []))
      .catch(() => setChyba('Nepodařilo se načíst třídy.'))
  }, [otevreno, tridy.length])

  const odeslat = async () => {
    setOdesila(true)
    setChyba('')
    setVysledek(null)
    try {
      const odpoved = await fetch('/api/rodice/hromadny-import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trida, emaily }),
      })
      const data = await odpoved.json()
      if (!odpoved.ok) throw new Error(data.chyba ?? 'Import selhal.')
      setVysledek(data)
      setEmaily('')
      router.refresh()
    } catch (err) {
      setChyba(err instanceof Error ? err.message : 'Import selhal.')
    } finally {
      setOdesila(false)
    }
  }

  if (!otevreno) {
    return (
      <div style={{ marginBottom: 20 }}>
        <button type="button" className="btn btn--style-secondary btn--size-small" onClick={() => setOtevreno(true)}>
          Hromadný import e-mailů
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        marginBottom: 24,
        padding: 20,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        display: 'grid',
        gap: 12,
        maxWidth: 640,
      }}
    >
      <strong>Hromadný import e-mailů do třídy</strong>
      <label style={{ display: 'grid', gap: 4 }}>
        Třída
        <select value={trida} onChange={(e) => setTrida(e.target.value)} style={{ padding: 8 }}>
          <option value="">— vyberte třídu —</option>
          {tridy.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nazev}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        E-maily (každý na nový řádek, duplicity se vynechají)
        <textarea
          value={emaily}
          onChange={(e) => setEmaily(e.target.value)}
          rows={10}
          style={{ padding: 8, fontFamily: 'monospace' }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          disabled={odesila || !trida || !emaily.trim()}
          onClick={odeslat}
        >
          {odesila ? 'Ukládám…' : 'Importovat'}
        </button>
        <button type="button" className="btn btn--style-secondary btn--size-small" onClick={() => setOtevreno(false)}>
          Zavřít
        </button>
      </div>
      {chyba && <div style={{ color: '#c0392b' }}>{chyba}</div>}
      {vysledek && (
        <div>
          Hotovo — nových rodičů: <b>{vysledek.nove}</b>, existujícím přidána třída:{' '}
          <b>{vysledek.pridanaTrida}</b>, už ve třídě byli: <b>{vysledek.bezZmeny}</b>
          {vysledek.chyby.length > 0 && (
            <ul style={{ color: '#c0392b' }}>
              {vysledek.chyby.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
