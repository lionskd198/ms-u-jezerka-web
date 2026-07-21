/**
 * =============================================================================
 * ACCESS CONTROL — sdílené funkce pro řízení přístupu
 * =============================================================================
 *
 * Jak access control v Payloadu funguje:
 * ---------------------------------------
 * Každá kolekce (i každé pole) může mít funkce `access.create`, `access.read`,
 * `access.update` a `access.delete`. Payload je zavolá při KAŽDÉM požadavku
 * (přes admin, REST API i GraphQL) a podle výsledku operaci povolí, nebo zamítne.
 *
 * Funkce dostane objekt s `req` (požadavek), kde `req.user` je přihlášený
 * uživatel (nebo `null`, když nikdo přihlášený není). Vrátit může:
 *   - `true`  → operace povolena
 *   - `false` → operace zamítnuta
 *   - "query" objekt → povoleno jen pro dokumenty odpovídající podmínce
 *     (např. jen publikované články — viz kolekce Aktuality)
 *
 * Tyhle funkce si definujeme na jednom místě, aby se neopakovaly v každé
 * kolekci a bylo na první pohled vidět, kdo co smí.
 */
import type { Access, FieldAccess } from 'payload'

/**
 * Povolí operaci jen ADMINOVI.
 * Používáme např. pro správu uživatelů — editor nesmí zakládat účty.
 */
export const jeAdmin: Access = ({ req }) => req.user?.role === 'admin'

/**
 * Totéž co `jeAdmin`, ale pro jednotlivé POLE (field-level access).
 * Payload rozlišuje typ `Access` (kolekce) a `FieldAccess` (pole) —
 * proto existují dvě varianty. Používáme u pole `role`, aby si editor
 * nemohl sám povýšit roli na admina.
 */
export const jeAdminPole: FieldAccess = ({ req }) => req.user?.role === 'admin'

/**
 * Povolí operaci každému PŘIHLÁŠENÉMU uživateli (admin i editor).
 * Používáme pro tvorbu a úpravy obsahu — aktuality, dokumenty, média.
 * Dvojitá negace `!!` převede objekt/null na true/false.
 */
export const jePrihlasen: Access = ({ req }) => !!req.user

/**
 * Povolí ČTENÍ úplně každému — i nepřihlášeným návštěvníkům webu.
 * Používáme pro veřejný obsah (dokumenty, obrázky, kontakty…),
 * aby si ho web mohl načíst a rodiče zobrazit.
 */
export const verejneCteni: Access = () => true

/**
 * Admin smí vše, ostatní uživatelé smí upravovat jen SVŮJ vlastní záznam.
 * Používáme v kolekci Users — editor si může změnit svoje heslo nebo jméno,
 * ale nemůže sahat na účty ostatních.
 *
 * Vrácený objekt `{ id: { equals: ... } }` je tzv. query constraint:
 * Payload operaci povolí jen pro dokumenty, které podmínce vyhovují.
 */
export const jeAdminNeboSam: Access = ({ req }) => {
  if (req.user?.role === 'admin') {
    return true
  }
  if (req.user) {
    return { id: { equals: req.user.id } }
  }
  return false
}
