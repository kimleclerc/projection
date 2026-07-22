import { useEffect, useState } from 'preact/hooks';

/* urlState — état d'îlot synchronisé avec la query string (permaliens).
 *
 * SSG-safe : au build il n'y a pas de `window`, l'état initial est toujours la
 * valeur par défaut et l'URL n'est lue qu'au mount (les îlots hydratent
 * client-side via client:visible). On écrit avec history.replaceState pour ne
 * pas polluer l'historique, et l'état par défaut retire le paramètre pour
 * garder une URL propre.
 */

/** Lit un paramètre de la query string (null côté serveur ou si absent). */
export function readUrlParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}

/** Écrit un paramètre via history.replaceState ; `null` le retire. */
export function setUrlParam(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  history.replaceState(history.state, '', url.toString());
}

/** useState miroité dans `?key=`. `isValid` filtre les valeurs venues de
 * l'URL (id inconnu, valeur forgée…) ; une valeur invalide est ignorée. */
export function useUrlParam<T extends string = string>(
  key: string,
  defaultValue: T,
  isValid?: (v: string) => boolean,
): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // Lecture unique au mount ; ensuite l'îlot est la source de vérité.
  useEffect(() => {
    const fromUrl = readUrlParam(key);
    if (fromUrl !== null && fromUrl !== defaultValue && (!isValid || isValid(fromUrl))) {
      setValue(fromUrl as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (v: T) => {
    setValue(v);
    setUrlParam(key, v === defaultValue ? null : v);
  };

  return [value, set];
}
