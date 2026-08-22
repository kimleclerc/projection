import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  POIDS_NON, softmax, priorScores, indexerCalibration, poidsDe,
  scoresDepuisReponses, choisirProchaine, resultatPret,
  type Calibration,
} from '../lib/vibe-engine';
import { CARDS, cardText } from '../lib/vibe-cards';
import '../styles/vibe-match.css';

type PartyId = 'pq' | 'plq' | 'pcq' | 'caq' | 'qs';
type Answer = 'yes' | 'no' | 'skip';
type DeclaredPreference = PartyId | 'undecided' | 'prefer-not';
type SetupMode = 'start' | 'riding' | 'postal';
type Screen = 'setup' | 'game' | 'results';
type SubmissionStatus = 'idle' | 'sending' | 'sent' | 'error';

interface Party {
  id: PartyId;
  shortName: string;
  color: string;
  voteMean: number;
}

interface Riding {
  id: string;
  name: string;
  /** Page de la circonscription, déjà localisée (les segments diffèrent par langue). */
  href: string;
  region: string;
  urbanRural: string;
  voteMean: Record<PartyId, number>;
}

interface Props {
  parties: Party[];
  ridings: Riding[];
  locale: 'fr' | 'en' | 'es';
  campaignVersion: string;
  /** Poids mesurés, publiés par export_vibe_match_calibration.py. */
  calibration: Calibration;
}

interface SavedProfile {
  answers: Record<string, Answer>;
  ridingId: string;
  updatedAt: string;
  campaignVersion?: string;
  feedback?: string;
  declaredPreference?: DeclaredPreference;
}

interface CalibrationRecord {
  answers: Record<string, Answer>;
  ridingId: string;
  locale: Props['locale'];
  feedback: string;
  declaredPreference: DeclaredPreference;
  predictedParty: PartyId;
  campaignVersion: string;
  capturedAt: string;
}

const PARTY_NAMES: Record<PartyId, string> = {
  pq: 'Parti québécois',
  plq: 'Parti libéral du Québec',
  pcq: 'Parti conservateur du Québec',
  caq: 'Coalition Avenir Québec',
  qs: 'Québec solidaire',
};

const PARTY_NAMES_EN: Record<PartyId, string> = {
  pq: 'Parti Québécois',
  plq: 'Quebec Liberal Party',
  pcq: 'Conservative Party of Quebec',
  caq: 'Coalition Avenir Québec',
  qs: 'Québec solidaire',
};

const PARTY_NAMES_ES: Record<PartyId, string> = {
  pq: 'Partido Quebequés',
  plq: 'Partido Liberal de Quebec',
  pcq: 'Partido Conservador de Quebec',
  caq: 'Coalición Futuro Quebec',
  qs: 'Quebec Solidario',
};

const PARTY_IDS: PartyId[] = ['pq', 'plq', 'pcq', 'caq', 'qs'];
/** Doit rester aligné sur `resultatPret` du moteur. */
const REVEAL_MIN = 7;
const DECLARED_PARTY_ORDER: PartyId[] = ['caq', 'plq', 'pq', 'pcq', 'qs'];

const COPY = {
  fr: {
    close: 'Fermer le jeu', title: 'Ton match électoral, selon ta vibe.', subtitle: 'Glisse. Réponds vite. On essaie de te deviner.',
    riding: 'Ta circonscription', resumeResult: 'Revoir mon match d’aujourd’hui', resumeGame: 'Continuer mon match', changed: 'Les données de la campagne ont peut-être changé.',
    knowRiding: 'Je connais ma circonscription', findPostal: 'La trouver avec mon code postal', pass: 'Passer', back: '← Retour', postal: 'Code postal',
    postalPrivacy: 'Utilisé seulement pour trouver la circonscription. Il n’est ni enregistré ni ajouté à ton profil.', find: 'Trouver', searching: 'Recherche…',
    notFound: 'On ne trouve pas ce code. Tu peux choisir ta circonscription dans la liste.', lookupError: 'La recherche ne répond pas. Tu peux choisir ta circonscription dans la liste.',
    chooseList: 'Choisir dans la liste', found: 'On a trouvé ta circonscription', ambiguous: 'Ce code touche plus d’une circonscription', startArrow: 'Commencer →',
    chooseRiding: 'Choisir ma circonscription', select: 'Sélectionner…', start: 'Commencer', cardsSeen: 'cartes vues', no: 'NON', yes: 'OUI', answerCard: 'Répondre à la carte',
    answersBefore: 'réponses avant les matchs', reveal: 'Voir mes matchs', resultTitle: 'Ton meilleur match aujourd’hui', hearts: 'cœurs sur 5 pour',
    localProjection: 'Voir la projection', quebecProjection: 'Voir la projection du Québec', share: 'Partager mon résultat', continueCards: 'Continuer les cartes', wholeProjection: 'Voir toute la projection du Québec',
    return: 'Une campagne, ça bouge. Reviens dans quelques jours pour voir si ton match a changé.', guessed: 'On t’a bien deviné?', exact: 'En plein ça', closeEnough: 'Pas loin', wrong: 'Dans le champ',
    noted: 'Noté. On remettra notre intuition à l’épreuve pendant la campagne.', declaredQuestion: 'Si tu votais aujourd’hui, quel parti choisirais-tu?',
    declaredWhy: 'Cette réponse sert à comparer notre intuition à ton choix réel du moment.', undecided: 'Je ne sais pas encore', preferNot: 'Je préfère ne pas répondre',
    savedLocal: 'Enregistré seulement sur cet appareil. Rien n’est envoyé sans ton accord.',
    sent: 'Merci — tes réponses ont été reçues.',
    sendError: 'L’envoi n’a pas fonctionné. Rien de plus n’a été enregistré.',
  },
  en: {
    close: 'Close the game', title: 'Your election match, based on your vibe.', subtitle: 'Swipe. Answer fast. We’ll try to read you.',
    riding: 'Your riding', resumeResult: 'See today’s match again', resumeGame: 'Continue my match', changed: 'The campaign data may have changed.',
    knowRiding: 'I know my riding', findPostal: 'Find it with my postal code', pass: 'Skip', back: '← Back', postal: 'Postal code',
    postalPrivacy: 'Used only to find your riding. It is not saved or added to your profile.', find: 'Find it', searching: 'Searching…',
    notFound: 'We could not find that code. You can choose your riding from the list.', lookupError: 'The lookup is unavailable. You can choose your riding from the list.',
    chooseList: 'Choose from the list', found: 'We found your riding', ambiguous: 'This code overlaps more than one riding', startArrow: 'Start →',
    chooseRiding: 'Choose my riding', select: 'Select…', start: 'Start', cardsSeen: 'cards seen', no: 'NO', yes: 'YES', answerCard: 'Answer the card',
    answersBefore: 'answers before your matches', reveal: 'See my matches', resultTitle: 'Your best match today', hearts: 'hearts out of 5 for',
    localProjection: 'See the projection', quebecProjection: 'See the Quebec projection', share: 'Share my result', continueCards: 'Keep swiping', wholeProjection: 'See the full Quebec projection',
    return: 'Campaigns move. Come back in a few days to see whether your match has changed.', guessed: 'Did we read you right?', exact: 'Nailed it', closeEnough: 'Not far off', wrong: 'Way off',
    noted: 'Noted. We’ll put our intuition to the test again during the campaign.', declaredQuestion: 'If you voted today, which party would you choose?',
    declaredWhy: 'This lets us compare our intuition with your actual choice right now.', undecided: 'I’m not sure yet', preferNot: 'I prefer not to answer',
    savedLocal: 'Saved only on this device. Nothing is sent without your permission.',
    sent: 'Thank you — your answers were received.',
    sendError: 'The submission did not work. Nothing else was saved.',
  },
  es: {
    close: 'Cerrar el juego', title: 'Tu match electoral, según tu vibra.', subtitle: 'Desliza. Responde rápido. Intentaremos adivinarte.',
    riding: 'Tu circunscripción', resumeResult: 'Volver a ver mi match de hoy', resumeGame: 'Continuar mi match', changed: 'Los datos de la campaña pueden haber cambiado.',
    knowRiding: 'Conozco mi circunscripción', findPostal: 'Encontrarla con mi código postal', pass: 'Saltar', back: '← Volver', postal: 'Código postal',
    postalPrivacy: 'Se usa únicamente para encontrar tu circunscripción. No se guarda ni se añade a tu perfil.', find: 'Buscar', searching: 'Buscando…',
    notFound: 'No encontramos ese código. Puedes elegir tu circunscripción en la lista.', lookupError: 'La búsqueda no responde. Puedes elegir tu circunscripción en la lista.',
    chooseList: 'Elegir en la lista', found: 'Encontramos tu circunscripción', ambiguous: 'Este código abarca más de una circunscripción', startArrow: 'Empezar →',
    chooseRiding: 'Elegir mi circunscripción', select: 'Seleccionar…', start: 'Empezar', cardsSeen: 'cartas vistas', no: 'NO', yes: 'SÍ', answerCard: 'Responder a la carta',
    answersBefore: 'respuestas antes de tus matches', reveal: 'Ver mis matches', resultTitle: 'Tu mejor match hoy', hearts: 'corazones de 5 para',
    localProjection: 'Ver la proyección', quebecProjection: 'Ver la proyección de Quebec (FR)', share: 'Compartir mi resultado', continueCards: 'Seguir con las cartas', wholeProjection: 'Ver toda la proyección de Quebec (FR)',
    return: 'Las campañas cambian. Vuelve en unos días para ver si tu match cambió.', guessed: '¿Te adivinamos bien?', exact: 'Exactamente', closeEnough: 'Casi', wrong: 'Para nada',
    noted: 'Anotado. Volveremos a poner a prueba nuestra intuición durante la campaña.', declaredQuestion: 'Si votaras hoy, ¿qué partido elegirías?',
    declaredWhy: 'Esto nos permite comparar nuestra intuición con tu elección real de hoy.', undecided: 'Aún no lo sé', preferNot: 'Prefiero no responder',
    savedLocal: 'Guardado únicamente en este dispositivo. Nada se envía sin tu permiso.',
    sent: 'Gracias: recibimos tus respuestas.',
    sendError: 'El envío no funcionó. No se guardó nada más.',
  },
} as const;

function HeartRow({ filled, label, phrase = 'cœurs sur 5 pour' }: { filled: number; label: string; phrase?: string }) {
  return (
    <span class="vibe-hearts" aria-label={`${filled} ${phrase} ${label}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <svg class={index < filled ? 'is-filled' : ''} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.2-4.5-9.6-8.5C.5 9.3 2.1 5.5 5.6 4.6 8 4 10.2 5.1 12 7.2 13.8 5.1 16 4 18.4 4.6c3.5.9 5.1 4.7 3.2 7.9C19.2 16.5 12 21 12 21Z" />
        </svg>
      ))}
    </span>
  );
}

export default function VibeMatch({ parties, ridings, locale, campaignVersion, calibration }: Props) {
  // Index des poids mesurés. Une carte absente vaut zéro : c'est ce qui
  // permet aux cartes d'ambiance d'exister sans fausser le score.
  const poids = useMemo(() => indexerCalibration(calibration), [calibration]);
  const premiereCarte = CARDS[0];
  const isEnglish = locale === 'en';
  const isSpanish = locale === 'es';
  const t = isEnglish ? COPY.en : isSpanish ? COPY.es : COPY.fr;
  const partyNames = isEnglish ? PARTY_NAMES_EN : isSpanish ? PARTY_NAMES_ES : PARTY_NAMES;
  const projectionBase = isEnglish ? '/en/canada/quebec/' : isSpanish ? '/es/canada/quebec/' : '/fr/canada/quebec/';
  const profileStorageKey = locale === 'fr' ? 'vote-scope-match-profile-v1' : `vote-scope-match-profile-v1-${locale}`;
  const [screen, setScreen] = useState<Screen>('setup');
  const [setupMode, setSetupMode] = useState<SetupMode>('start');
  const [selectedRidingId, setSelectedRidingId] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [postalMatches, setPostalMatches] = useState<Riding[]>([]);
  const [postalStatus, setPostalStatus] = useState<'idle' | 'loading' | 'not-found' | 'error'>('idle');
  const [scores, setScores] = useState<Record<PartyId, number>>(() => priorScores(calibration, locale));
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentId, setCurrentId] = useState(premiereCarte.id);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState('');
  const [declaredPreference, setDeclaredPreference] = useState<DeclaredPreference | ''>('');
  const [shareStatus, setShareStatus] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null);
  const pointerStart = useRef(0);
  const submissionInFlight = useRef(false);

  const selectedRiding = useMemo(
    () => ridings.find((riding) => riding.id === selectedRidingId),
    [ridings, selectedRidingId],
  );
  const probabilities = useMemo(() => softmax(scores), [scores]);
  const current = CARDS.find((carte) => carte.id === currentId) ?? premiereCarte;
  const answeredCount = Object.values(answers).filter((answer) => answer !== 'skip').length;
  const seenCount = Object.keys(answers).length;
  const orderedProbabilities = [...PARTY_IDS].sort((a, b) => probabilities[b] - probabilities[a]);
  const resultUnlocked = resultatPret(answers, probabilities);
  const savedAnsweredCount = savedProfile
    ? Object.values(savedProfile.answers).filter((answer) => answer !== 'skip').length
    : 0;

  function begin(riding?: Riding) {
    const firstScores = priorScores(calibration, locale, riding);
    setSelectedRidingId(riding?.id ?? '');
    setScores(firstScores);
    setAnswers({});
    setCurrentId('canada');
    setScreen('game');
  }

  function resumeProfile() {
    if (!savedProfile) return;
    const riding = ridings.find((item) => item.id === savedProfile.ridingId);
    const refreshedScores = scoresDepuisReponses(
      priorScores(calibration, locale, riding), savedProfile.answers, CARDS, poids);
    setSelectedRidingId(riding?.id ?? '');
    setAnswers(savedProfile.answers);
    setScores(refreshedScores);
    setFeedback(savedProfile.feedback ?? '');
    setDeclaredPreference(savedProfile.declaredPreference ?? '');
    const next = choisirProchaine(CARDS, savedProfile.answers, refreshedScores, poids);
    if (next) setCurrentId(next.id);
    setScreen(savedAnsweredCount >= REVEAL_MIN ? 'results' : 'game');
  }

  async function inferPostalRiding() {
    const normalized = postalCode.toUpperCase().replace(/\s/g, '');
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)) return;
    setPostalStatus('loading');
    setPostalMatches([]);
    try {
      const response = await fetch(`/postal/${normalized.slice(0, 2)}.json`);
      if (!response.ok) {
        setPostalStatus(response.status === 404 ? 'not-found' : 'error');
        return;
      }
      const lookup = await response.json() as Record<string, string | string[]>;
      const result = lookup[normalized];
      if (!result) {
        setPostalStatus('not-found');
        return;
      }
      const ids = Array.isArray(result) ? result : [result];
      const matches = ids
        .map((id) => ridings.find((riding) => riding.id === id))
        .filter((riding): riding is Riding => Boolean(riding));
      if (!matches.length) {
        setPostalStatus('not-found');
        return;
      }
      setPostalMatches(matches);
      setPostalStatus('idle');
      setPostalCode('');
    } catch {
      setPostalStatus('error');
    }
  }

  function beginPostalMatch(riding: Riding) {
    setPostalCode('');
    setPostalMatches([]);
    begin(riding);
  }

  // Le sélecteur vit dans le moteur : cartes d'ambiance forcées en ouverture,
  // puis tirage parmi les trois meilleures plutôt qu'un maximum strict.
  function pickNext(nextScores: Record<PartyId, number>, nextAnswers: Record<string, Answer>) {
    return choisirProchaine(CARDS, nextAnswers, nextScores, poids);
  }

  function answerCard(answer: Answer) {
    if (exit || answers[current.id]) return;
    setExit(answer);
    const nextScores = { ...scores };
    if (answer !== 'skip') {
      const direction = answer === 'yes' ? 1 : POIDS_NON;
      const w = poidsDe(poids, current);
      PARTY_IDS.forEach((id) => { nextScores[id] += w[id] * direction; });
    }
    const nextAnswers = { ...answers, [current.id]: answer };
    window.setTimeout(() => {
      setScores(nextScores);
      setAnswers(nextAnswers);
      const next = pickNext(nextScores, nextAnswers);
      if (next) setCurrentId(next.id);
      else setScreen('results');
      setDragX(0);
      setExit(null);
    }, 210);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (screen !== 'game') return;
      if (event.key === 'ArrowLeft') answerCard('no');
      if (event.key === 'ArrowRight') answerCard('yes');
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') answerCard('skip');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentId, scores, answers, exit]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(profileStorageKey);
      if (saved) setSavedProfile(JSON.parse(saved) as SavedProfile);
    } catch {
      setSavedProfile(null);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    const profile: SavedProfile = {
      answers,
      ridingId: selectedRidingId,
      updatedAt: new Date().toISOString(),
      campaignVersion,
      feedback: feedback || undefined,
      declaredPreference: declaredPreference || undefined,
    };
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    setSavedProfile(profile);
  }, [answers, selectedRidingId, campaignVersion, feedback, declaredPreference, profileStorageKey]);

  function chooseFeedback(choice: string) {
    setFeedback(choice);
    setSubmissionStatus('idle');
    if (choice === t.exact) setDeclaredPreference('');
  }

  function saveDeclaredPreference(preference: DeclaredPreference) {
    setDeclaredPreference(preference);
    setSubmissionStatus('idle');
    const capturedAt = new Date().toISOString();
    const record: CalibrationRecord = {
      answers,
      ridingId: selectedRidingId,
      locale,
      feedback,
      declaredPreference: preference,
      predictedParty: orderedProbabilities[0],
      campaignVersion,
      capturedAt,
    };
    try {
      const key = 'vote-scope-match-calibration-v1';
      const existing = JSON.parse(window.localStorage.getItem(key) ?? '[]') as CalibrationRecord[];
      const day = capturedAt.slice(0, 10);
      const withoutSameMoment = existing.filter((item) => !(
        item.campaignVersion === campaignVersion
        && item.ridingId === selectedRidingId
        && item.capturedAt.slice(0, 10) === day
      ));
      window.localStorage.setItem(key, JSON.stringify([...withoutSameMoment, record].slice(-20)));
    } catch {
      // The result remains usable when storage is unavailable.
    }
    void submitCalibration(preference);
  }

  async function submitCalibration(preference: DeclaredPreference) {
    const purposeId = import.meta.env.PUBLIC_ZARAZ_VIBE_PURPOSE_ID?.trim();
    const zarazConsent = (window as Window & {
      zaraz?: { consent?: { APIReady?: boolean; get?: (id: string) => boolean | undefined } };
    }).zaraz?.consent;
    const collectionEnabled = import.meta.env.PUBLIC_VIBE_CALIBRATION_ENABLED === 'true';
    if (!collectionEnabled || !purposeId || !zarazConsent?.APIReady || zarazConsent.get?.(purposeId) !== true) return;
    if (submissionInFlight.current || submissionStatus === 'sent') return;
    submissionInFlight.current = true;
    setSubmissionStatus('sending');
    try {
      const response = await fetch('/api/v1/vibe-calibration', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          consentVersion: 'calibration-v1',
          campaignVersion,
          locale,
          ridingId: selectedRidingId || undefined,
          predictedParty: orderedProbabilities[0],
          declaredPreference: preference,
          feedback,
          answers,
        }),
      });
      if (!response.ok) throw new Error('submission_failed');
      setSubmissionStatus('sent');
    } catch {
      setSubmissionStatus('error');
    } finally {
      submissionInFlight.current = false;
    }
  }

  function pointerDown(event: PointerEvent) {
    if (exit) return;
    pointerStart.current = event.clientX;
    setDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (!dragging) return;
    setDragX(event.clientX - pointerStart.current);
  }

  function pointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 82) answerCard('yes');
    else if (dragX < -82) answerCard('no');
    else setDragX(0);
  }

  const ranked = orderedProbabilities.map((id, index) => {
    const party = parties.find((item) => item.id === id)!;
    const topConfidence = probabilities[orderedProbabilities[0]];
    const hearts = index === 0
      ? (topConfidence >= 0.58 ? 5 : 4)
      : Math.max(1, Math.min(4, Math.round((probabilities[id] / topConfidence) * 4)));
    return { ...party, name: partyNames[id], hearts };
  });

  async function shareResult() {
    setShareStatus(isEnglish ? 'Creating the image…' : isSpanish ? 'Creando la imagen…' : 'Création de l’image…');
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#f5f1e8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(540, 700);
    context.rotate(-Math.PI / 5.5);
    context.globalAlpha = 0.045;
    context.fillStyle = '#171512';
    context.textAlign = 'center';
    context.font = '800 150px Arial, sans-serif';
    context.fillText('VOTE-SCOPE', 0, 0);
    context.restore();

    context.fillStyle = '#171512';
    context.textAlign = 'left';
    context.font = '600 74px Georgia, serif';
    context.fillText('Vote-Scope', 76, 112);
    context.fillStyle = '#b8242b';
    context.fillRect(76, 142, 116, 9);
    context.font = '750 58px Arial, sans-serif';
    context.fillStyle = '#171512';
    context.fillText(isEnglish ? 'Your best match' : isSpanish ? 'Tu mejor match' : 'Ton meilleur match', 76, 245);
    context.fillText(isEnglish ? 'today' : isSpanish ? 'hoy' : "aujourd’hui", 76, 312);

    ranked.slice(0, 3).forEach((party, index) => {
      const y = 400 + index * 230;
      const isTop = index === 0;
      context.fillStyle = isTop ? '#fffdf6' : 'rgba(255,253,246,.72)';
      context.strokeStyle = '#d8d0c2';
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(76, y, 928, 184, 24);
      context.fill();
      context.stroke();

      context.fillStyle = isTop ? '#b8242b' : '#171512';
      context.beginPath();
      context.arc(125, y + 92, 28, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#fff';
      context.textAlign = 'center';
      context.font = '800 30px Arial, sans-serif';
      context.fillText(String(index + 1), 125, y + 103);

      context.fillStyle = party.color;
      context.beginPath();
      context.roundRect(178, y + 30, 124, 124, 18);
      context.fill();
      context.fillStyle = '#fff';
      context.font = '850 29px Arial, sans-serif';
      context.fillText(party.shortName, 240, y + 103);

      context.textAlign = 'left';
      context.fillStyle = '#171512';
      context.font = `${isTop ? 700 : 650} ${isTop ? 37 : 32}px Arial, sans-serif`;
      context.fillText(party.name, 342, y + 76, 590);
      context.font = '46px Arial, sans-serif';
      const hearts = Array.from({ length: 5 }, (_, heart) => heart < party.hearts ? '♥' : '♡').join(' ');
      context.fillStyle = '#b8242b';
      context.fillText(hearts, 342, y + 138);
    });

    context.fillStyle = '#143858';
    context.font = '650 34px Arial, sans-serif';
    context.fillText(isEnglish ? 'Campaigns move.' : isSpanish ? 'Las campañas cambian.' : 'Une campagne, ça bouge.', 76, 1142);
    context.fillStyle = '#544e47';
    context.font = '30px Arial, sans-serif';
    context.fillText(isEnglish ? 'Come back to see if your match changed.' : isSpanish ? 'Vuelve para ver si tu match cambió.' : 'Reviens voir si ton match a changé.', 76, 1192);
    context.fillStyle = '#171512';
    context.font = '600 28px Arial, sans-serif';
    context.fillText('vote-scope.com', 76, 1281);
    context.textAlign = 'right';
    context.fillStyle = '#70695f';
    context.font = '25px Arial, sans-serif';
    context.fillText(new Intl.DateTimeFormat(isEnglish ? 'en-CA' : isSpanish ? 'es-CA' : 'fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()), 1004, 1281);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
    if (!blob) {
      setShareStatus(isEnglish ? 'Could not create the image.' : isSpanish ? 'No se pudo crear la imagen.' : 'Impossible de créer l’image.');
      return;
    }
    const file = new File([blob], 'mon-match-vote-scope.png', { type: 'image/png' });
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: isEnglish ? 'My Vote-Scope match' : isSpanish ? 'Mi match Vote-Scope' : 'Mon match Vote-Scope',
          text: isEnglish ? 'Here is my best election match today.' : isSpanish ? 'Este es mi mejor match electoral de hoy.' : 'Voici mon meilleur match électoral aujourd’hui.',
          files: [file],
        });
        setShareStatus(isEnglish ? 'Image shared.' : isSpanish ? 'Imagen compartida.' : 'Image partagée.');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setShareStatus(isEnglish ? 'Image downloaded.' : isSpanish ? 'Imagen descargada.' : 'Image téléchargée.');
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') setShareStatus(isEnglish ? 'Sharing did not work.' : isSpanish ? 'No se pudo compartir.' : 'Le partage n’a pas fonctionné.');
      else setShareStatus('');
    }
  }

  return (
    <main class="vibe-shell">
      <header class="vibe-topbar">
        <a class="vibe-logo" href={isEnglish ? '/en' : isSpanish ? '/es' : '/fr'}>Vote-Scope</a>
        {screen !== 'setup' && (
          <button class="vibe-top-action" type="button" aria-label={t.close} onClick={() => { setSetupMode('start'); setScreen('setup'); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>
        )}
      </header>

      {screen === 'setup' && (
        <section class="vibe-setup">
          <div class="vibe-setup-copy">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <div class="vibe-setup-panel">
            {setupMode === 'start' && (
              <>
                <h2>{t.riding}</h2>
                {savedProfile && (
                  <button class="vibe-resume" type="button" onClick={resumeProfile}>
                    {savedAnsweredCount >= REVEAL_MIN ? t.resumeResult : t.resumeGame}
                    <span>{savedAnsweredCount >= REVEAL_MIN ? t.changed : (isEnglish ? `${savedAnsweredCount} saved answer${savedAnsweredCount === 1 ? '' : 's'}.` : isSpanish ? `${savedAnsweredCount} respuesta${savedAnsweredCount === 1 ? '' : 's'} guardada${savedAnsweredCount === 1 ? '' : 's'}.` : `${savedAnsweredCount} réponse${savedAnsweredCount > 1 ? 's' : ''} enregistrée${savedAnsweredCount > 1 ? 's' : ''}.`)}</span>
                  </button>
                )}
                <button class="vibe-primary" type="button" onClick={() => setSetupMode('riding')}>{t.knowRiding}</button>
                <button class="vibe-secondary" type="button" onClick={() => setSetupMode('postal')}>{t.findPostal}</button>
                <button class="vibe-text-button" type="button" onClick={() => begin()}>{t.pass}</button>
              </>
            )}

            {setupMode === 'postal' && (
              <>
                <button class="vibe-back" type="button" onClick={() => setSetupMode('start')}>{t.back}</button>
                <label for="postal-code">{t.postal}</label>
                <input
                  id="postal-code"
                  inputMode="text"
                  autocomplete="postal-code"
                  maxlength={7}
                  placeholder="H2X 1Y4"
                  value={postalCode}
                  onInput={(event) => {
                    setPostalCode((event.currentTarget as HTMLInputElement).value);
                    setPostalMatches([]);
                    setPostalStatus('idle');
                  }}
                />
                <p class="vibe-privacy">{t.postalPrivacy}</p>
                <button class="vibe-primary" type="button" disabled={postalStatus === 'loading' || !/^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/.test(postalCode)} onClick={inferPostalRiding}>
                  {postalStatus === 'loading' ? t.searching : t.find}
                </button>
                {postalStatus === 'not-found' && <p class="vibe-postal-message" role="alert">{t.notFound}</p>}
                {postalStatus === 'error' && <p class="vibe-postal-message" role="alert">{t.lookupError}</p>}
                {(postalStatus === 'not-found' || postalStatus === 'error') && (
                  <button class="vibe-secondary" type="button" onClick={() => setSetupMode('riding')}>{t.chooseList}</button>
                )}
                {postalMatches.length > 0 && (
                  <div class="vibe-postal-results" role="status">
                    <strong>{postalMatches.length === 1 ? t.found : t.ambiguous}</strong>
                    {postalMatches.map((riding) => (
                      <button type="button" onClick={() => beginPostalMatch(riding)}>
                        <span>{riding.name}</span>
                        <small>{t.startArrow}</small>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {setupMode === 'riding' && (
              <>
                <button class="vibe-back" type="button" onClick={() => setSetupMode('start')}>{t.back}</button>
                <label for="riding">{t.chooseRiding}</label>
                <select id="riding" value={selectedRidingId} onChange={(event) => setSelectedRidingId((event.currentTarget as HTMLSelectElement).value)}>
                  <option value="">{t.select}</option>
                  {ridings.map((riding) => <option value={riding.id}>{riding.name}</option>)}
                </select>
                <button class="vibe-primary" type="button" disabled={!selectedRiding} onClick={() => selectedRiding && begin(selectedRiding)}>{t.start}</button>
              </>
            )}
          </div>
        </section>
      )}

      {screen === 'game' && (
        <section class="vibe-game" aria-live="polite">
          <div class="vibe-progress" aria-label={`${seenCount} ${t.cardsSeen}`}>
            {Array.from({ length: 12 }, (_, index) => <span class={index < Math.min(seenCount, 12) ? 'is-done' : ''} />)}
          </div>

          <div class="vibe-deck">
            <div class="vibe-card vibe-card-back vibe-card-back-two" aria-hidden="true" />
            <div class="vibe-card vibe-card-back" aria-hidden="true" />
            <article
              class={`vibe-card vibe-card-front tone-${current.tone} ${dragging ? 'is-dragging' : ''} ${exit ? `is-exit-${exit}` : ''}`}
              style={{ transform: exit ? undefined : `translateX(${dragX}px) rotate(${dragX / 22}deg)` }}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
            >
              <span class={`vibe-stamp vibe-stamp-no ${dragX < -24 ? 'is-visible' : ''}`}>{t.no}</span>
              <span class={`vibe-stamp vibe-stamp-yes ${dragX > 24 ? 'is-visible' : ''}`}>{t.yes}</span>
              <h1>{cardText(current, locale)}</h1>
              <div class="vibe-card-directions" aria-hidden="true"><span>← {t.no}</span><span>{t.yes} →</span></div>
            </article>
          </div>

          <div class="vibe-actions" aria-label={t.answerCard}>
            <button class="vibe-choice vibe-choice-no" type="button" aria-label={t.no} onClick={() => answerCard('no')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
            </button>
            <button class="vibe-skip" type="button" onClick={() => answerCard('skip')}>{t.pass}</button>
            <button class="vibe-choice vibe-choice-yes" type="button" aria-label={t.yes} onClick={() => answerCard('yes')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.2-4.5-9.6-8.5C.5 9.3 2.1 5.5 5.6 4.6 8 4 10.2 5.1 12 7.2 13.8 5.1 16 4 18.4 4.6c3.5.9 5.1 4.7 3.2 7.9C19.2 16.5 12 21 12 21Z" /></svg>
            </button>
          </div>

          <div class="vibe-result-slot">
            {resultUnlocked ? (
              <button class="vibe-reveal" type="button" onClick={() => setScreen('results')}>{t.reveal}</button>
            ) : (
              <span>{Math.max(0, REVEAL_MIN - answeredCount)} {t.answersBefore}</span>
            )}
          </div>
        </section>
      )}

      {screen === 'results' && (
        <section class="vibe-results">
          <h1>{t.resultTitle}</h1>
          <ol class="vibe-ranking">
            {ranked.map((party, index) => (
              <li class={index === 0 ? 'is-top' : ''}>
                <span class="vibe-rank">{index + 1}</span>
                <span class="vibe-party-mark" style={{ background: party.color }}>{party.shortName}</span>
                <span class="vibe-party-copy">
                  <strong>{party.name}</strong>
                  <HeartRow filled={party.hearts} label={party.name} phrase={t.hearts} />
                </span>
              </li>
            ))}
          </ol>

          <div class="vibe-result-actions">
            {selectedRiding ? (
              <a class="vibe-primary" href={selectedRiding.href}>
                {t.localProjection} — {selectedRiding.name}
              </a>
            ) : (
              <a class="vibe-primary" href={projectionBase}>{t.quebecProjection}</a>
            )}
            <button class="vibe-share" type="button" onClick={shareResult}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.6 6.6-4.1M8.7 13.4l6.6 4.1" /></svg>
              {t.share}
            </button>
            {shareStatus && <span class="vibe-share-status" role="status">{shareStatus}</span>}
            <button class="vibe-secondary" type="button" onClick={() => setScreen('game')}>{t.continueCards}</button>
            {selectedRiding && <a class="vibe-candidate-link" href={projectionBase}>{t.wholeProjection}</a>}
          </div>

          <aside class="vibe-return-message">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6.1 8a7 7 0 0 1 11.5-1.5L20 9M4 15l2.4 2.5A7 7 0 0 0 18 16" /></svg>
            <p>{t.return}</p>
          </aside>

          <div class="vibe-feedback">
            <h2>{t.guessed}</h2>
            <div>
              {[t.exact, t.closeEnough, t.wrong].map((choice) => (
                <button class={feedback === choice ? 'is-selected' : ''} type="button" onClick={() => chooseFeedback(choice)}>{choice}</button>
              ))}
            </div>
            {feedback === t.exact && <p>{t.noted}</p>}
            {(feedback === t.closeEnough || feedback === t.wrong) && (
              <div class="vibe-calibration">
                <h3>{t.declaredQuestion}</h3>
                <p>{t.declaredWhy}</p>
                <div class="vibe-party-options">
                  {DECLARED_PARTY_ORDER.map((partyId) => (
                    <button
                      class={declaredPreference === partyId ? 'is-selected' : ''}
                      type="button"
                      onClick={() => saveDeclaredPreference(partyId)}
                    >
                      <span style={{ background: parties.find((party) => party.id === partyId)?.color }} />
                      {partyNames[partyId]}
                    </button>
                  ))}
                  <button class={declaredPreference === 'undecided' ? 'is-selected' : ''} type="button" onClick={() => saveDeclaredPreference('undecided')}>{t.undecided}</button>
                  <button class={declaredPreference === 'prefer-not' ? 'is-selected' : ''} type="button" onClick={() => saveDeclaredPreference('prefer-not')}>{t.preferNot}</button>
                </div>
                {declaredPreference && (
                  <div class="vibe-calibration-choice">
                    {submissionStatus !== 'sent' && <p class="vibe-calibration-saved">{t.savedLocal}</p>}
                    {submissionStatus === 'sent' && <p class="vibe-submit-status is-success" role="status">{t.sent}</p>}
                    {submissionStatus === 'error' && <p class="vibe-submit-status is-error" role="status">{t.sendError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
