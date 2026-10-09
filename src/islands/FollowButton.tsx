/**
 * Bouton « Suivre cette course » des fiches de circonscription. Enregistre la
 * course et ce que le lecteur voit aujourd'hui dans SON navigateur ; la page
 * « Mes courses » compare ensuite avec les calculs suivants. Sans JavaScript ou
 * sans stockage (navigation privée), le bouton ne s'affiche pas.
 */
import { useEffect, useState } from 'preact/hooks';
import { readFollows, writeFollows, followKey, MY_RACES_URL, type Follow, type Lang, type Snap } from '../lib/follow';

interface Props {
  lang: Lang;
  j: string;
  id: string;
  slug: string;
  name: Record<Lang, string>;
  snap: Snap;
}

const T = {
  fr: { follow: 'Suivre cette course', following: 'Course suivie', list: 'Mes courses', note: 'Enregistré dans ce navigateur seulement.' },
  en: { follow: 'Follow this race', following: 'Following', list: 'My races', note: 'Saved in this browser only.' },
  es: { follow: 'Seguir esta contienda', following: 'Contienda seguida', list: 'Mis contiendas', note: 'Guardado solo en este navegador.' },
};

export default function FollowButton({ lang, j, id, slug, name, snap }: Props) {
  const t = T[lang];
  const key = followKey(j, id);
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem('vs:probe', '1');
      window.localStorage.removeItem('vs:probe');
    } catch {
      return; // pas de stockage : pas de bouton
    }
    setOn(readFollows().some((f) => followKey(f.j, f.id) === key));
    setReady(true);
  }, [key]);

  if (!ready) return null;

  const toggle = () => {
    const list = readFollows().filter((f) => followKey(f.j, f.id) !== key);
    if (!on) {
      const item: Follow = { j, id, slug, name, at: new Date().toISOString().slice(0, 10), seen: snap, prev: null };
      list.push(item);
    }
    if (writeFollows(list)) setOn(!on);
  };

  return (
    <p class="follow-row">
      <button type="button" class={on ? 'vs-btn' : 'vs-btn-secondary'} aria-pressed={on} onClick={toggle}>
        {on ? t.following : t.follow}
      </button>
      {on && <a class="vs-link" href={MY_RACES_URL[lang]}>{t.list}</a>}
      <span class="vs-meta">{t.note}</span>
    </p>
  );
}
