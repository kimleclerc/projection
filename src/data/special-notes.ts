/**
 * Traductions FR/ES des textes des élections spéciales américaines (web_data/*-special),
 * rédigés en anglais par le moteur. Clé = texte anglais exact. Un texte absent d'ici
 * reste en anglais : le contrôle de langue du build le signalera.
 */
type T = { fr: string; es: string };

export const SPECIAL_NOTES: Record<string, T> = {
  // CA-1
  'Special election to fill the CA-1 House vacancy after Rep. Doug LaMalfa left Congress.': {
    fr: 'Partielle pour pourvoir le siège CA-1 à la Chambre, laissé vacant par le départ du représentant Doug LaMalfa.',
    es: 'Elección especial para cubrir la vacante de CA-1 en la Cámara tras la salida del representante Doug LaMalfa.' },
  'The district remains structurally Republican-leaning, but the June 2 special is a crowded all-party primary.': {
    fr: 'Le district penche structurellement vers les républicains, mais la partielle du 2 juin est une primaire ouverte à tous les partis, avec beaucoup de candidats.',
    es: 'El distrito sigue inclinándose estructuralmente hacia los republicanos, pero la especial del 2 de junio es una primaria abierta a todos los partidos con muchos candidatos.' },
  'Republican district baseline': { fr: 'Base républicaine du district', es: 'Base republicana del distrito' },
  'Recent federal results make a Republican first-place finish the default unless the Democratic field consolidates unusually well.': {
    fr: 'Les résultats fédéraux récents font d’une première place républicaine le scénario par défaut, à moins que le camp démocrate ne se rassemble de façon inhabituelle.',
    es: 'Los resultados federales recientes hacen del primer puesto republicano el escenario por defecto, salvo que el campo demócrata se agrupe de forma inusual.' },
  'Certified five-candidate all-party primary': { fr: 'Primaire certifiée ouverte à tous les partis, cinq candidats', es: 'Primaria certificada abierta a todos los partidos, cinco candidatos' },
  'The official ballot has two Democrats, two Republicans and one no-party-preference candidate. The main uncertainty is whether Gallagher can clear 50% or faces a top-two runoff.': {
    fr: 'Le bulletin officiel compte deux démocrates, deux républicains et un candidat sans affiliation. La principale incertitude : Gallagher passera-t-il la barre des 50 %, ou y aura-t-il un second tour entre les deux premiers?',
    es: 'La papeleta oficial tiene dos demócratas, dos republicanos y un candidato sin partido. La gran incógnita es si Gallagher supera el 50 % o va a una segunda vuelta entre los dos primeros.' },
  'Runoff conditional outlook': { fr: 'Perspectives en cas de second tour', es: 'Perspectiva en caso de segunda vuelta' },
  'If the expected Gallagher-McGuire pairing materializes, the August runoff still starts from a Republican-leaning district prior.': {
    fr: 'Si le duel attendu Gallagher-McGuire se confirme, le second tour d’août part quand même d’un district qui penche vers les républicains.',
    es: 'Si se confirma el duelo previsto Gallagher-McGuire, la segunda vuelta de agosto parte igualmente de un distrito que se inclina hacia los republicanos.' },
  'No public district polling average': { fr: 'Aucune moyenne de sondages publics dans le district', es: 'Ningún promedio de encuestas públicas en el distrito' },
  'This page is fundamentals-only unless public district polling appears before June 2.': {
    fr: 'Cette page repose uniquement sur les fondamentaux, sauf si des sondages publics paraissent avant le 2 juin.',
    es: 'Esta página se basa solo en los fundamentos, salvo que aparezcan encuestas públicas antes del 2 de junio.' },
  'California Secretary of State certified candidate list for CD-1': { fr: 'Secrétariat d’État de la Californie : liste certifiée des candidats, CD-1', es: 'Secretaría de Estado de California: lista certificada de candidatos, CD-1' },
  'Ballotpedia special election overview': { fr: 'Ballotpedia : présentation de la partielle', es: 'Ballotpedia: resumen de la elección especial' },
  'Wikipedia tracking page for the special election': { fr: 'Wikipédia : page de suivi de la partielle', es: 'Wikipedia: página de seguimiento de la elección especial' },
  'No public district polling average is used here. This is a fundamentals-only special-primary projection built from district baseline, candidate-field structure and 50,000 Monte Carlo simulations.': {
    fr: 'Aucune moyenne de sondages publics n’est utilisée ici. Cette projection de primaire partielle repose uniquement sur les fondamentaux : base du district, structure du champ de candidats et 50 000 simulations Monte-Carlo.',
    es: 'Aquí no se usa ningún promedio de encuestas públicas. Este pronóstico de primaria especial se basa solo en los fundamentos: base del distrito, estructura del campo de candidatos y 50 000 simulaciones de Montecarlo.' },
  // CA-14
  certified: { fr: 'certifié', es: 'certificado' },
  'unofficial — 323 of 323 precincts partially reporting; certification due 2026-09-25': {
    fr: 'non officiel — 323 bureaux sur 323 en partie dépouillés ; certification attendue le 25 septembre 2026',
    es: 'no oficial — 323 de 323 precintos con escrutinio parcial; certificación prevista el 25 de septiembre de 2026' },
  'California Secretary of State — CD-14 special election results': { fr: 'Secrétariat d’État de la Californie — résultats de la partielle, CD-14', es: 'Secretaría de Estado de California — resultados de la elección especial, CD-14' },
  'Special election to fill the CA-14 House vacancy after Rep. Eric Swalwell resigned.': {
    fr: 'Partielle pour pourvoir le siège CA-14 à la Chambre, après la démission du représentant Eric Swalwell.',
    es: 'Elección especial para cubrir la vacante de CA-14 en la Cámara tras la dimisión del representante Eric Swalwell.' },
  'The district starts as a strongly Democratic seat; the live uncertainty is mostly candidate order in the top-two primary.': {
    fr: 'Le district est solidement démocrate ; l’incertitude porte surtout sur l’ordre d’arrivée des candidats dans la primaire des deux premiers.',
    es: 'El distrito es firmemente demócrata; la incertidumbre está sobre todo en el orden de los candidatos en la primaria de los dos primeros.' },
  'Strong Democratic district baseline': { fr: 'Base démocrate solide du district', es: 'Base demócrata sólida del distrito' },
  'CA-14 voted about 68D-32R in the 2024 House result and is Solid Democratic in the current House model.': {
    fr: 'CA-14 a voté environ 68 D – 32 R à la Chambre en 2024 et figure comme sûr démocrate dans le modèle actuel de la Chambre.',
    es: 'CA-14 votó cerca de 68 D – 32 R en la Cámara en 2024 y figura como seguro demócrata en el modelo actual de la Cámara.' },
  'Top-two primary first': { fr: 'D’abord la primaire des deux premiers', es: 'Primero, la primaria de los dos primeros' },
  'The June 16 round can elect a majority winner outright, but the default expectation is a top-two runoff on August 18.': {
    fr: 'Le tour du 16 juin peut élire directement un candidat majoritaire, mais on s’attend par défaut à un second tour entre les deux premiers le 18 août.',
    es: 'La ronda del 16 de junio puede elegir directamente a un ganador con mayoría, pero lo previsto es una segunda vuelta entre los dos primeros el 18 de agosto.' },
  'Certified candidate slate': { fr: 'Liste certifiée des candidats', es: 'Lista certificada de candidatos' },
  'The model uses the April 29 certified list: six Democrats, four Republicans and one no-party-preference candidate.': {
    fr: 'Le modèle utilise la liste certifiée du 29 avril : six démocrates, quatre républicains et un candidat sans affiliation.',
    es: 'El modelo usa la lista certificada del 29 de abril: seis demócratas, cuatro republicanos y un candidato sin partido.' },
  'This is a fundamentals-only desk until public CA-14 special-election polling appears.': {
    fr: 'Cette page repose uniquement sur les fondamentaux tant qu’aucun sondage public ne paraît sur la partielle de CA-14.',
    es: 'Esta página se basa solo en los fundamentos hasta que aparezcan encuestas públicas sobre la elección especial de CA-14.' },
  'California Secretary of State certified candidate list for CD-14': { fr: 'Secrétariat d’État de la Californie : liste certifiée des candidats, CD-14', es: 'Secretaría de Estado de California: lista certificada de candidatos, CD-14' },
  'FEC CA-14 special election filing information': { fr: 'FEC : déclarations de candidature pour la partielle de CA-14', es: 'FEC: registros de candidatura para la elección especial de CA-14' },
  'Wikipedia tracking page for the CA-14 special election': { fr: 'Wikipédia : page de suivi de la partielle de CA-14', es: 'Wikipedia: página de seguimiento de la elección especial de CA-14' },
  "Result: Aisha Wahab won the August 18 special general with 51,692 votes (53.1%) to Melissa Hernandez's 45,670 (46.9%), and was sworn in on September 2. She had led the certified June 16 primary with 42.8% to Hernandez's 16.8%. The forecast below is the June primary projection, kept unchanged: it put Wahab first with 70.3% probability, which held, but understated her share (23.5% mean against 42.8% actual) and expected Wendy Huang rather than Hernandez as the likelier runner-up. No forecast was ever published for the August general. No public district polling average was used: this was a fundamentals-only special-primary projection built from district baseline, candidate-field structure and 50,000 Monte Carlo simulations.": {
    fr: 'Résultat : Aisha Wahab a remporté la partielle du 18 août avec 51 692 voix (53,1 %) contre 45 670 (46,9 %) pour Melissa Hernandez, et a été assermentée le 2 septembre. Elle était déjà en tête de la primaire certifiée du 16 juin avec 42,8 %, contre 16,8 % pour Hernandez. La projection ci-dessous est celle de la primaire de juin, laissée telle quelle : elle plaçait Wahab première avec 70,3 % de probabilité, ce qui s’est vérifié, mais sous-estimait sa part (23,5 % en moyenne contre 42,8 % en réalité) et voyait Wendy Huang plutôt que Hernandez en deuxième place. Aucune projection n’a été publiée pour le tour d’août. Aucune moyenne de sondages publics n’a été utilisée : c’était une projection fondée uniquement sur la base du district, la structure du champ de candidats et 50 000 simulations Monte-Carlo.',
    es: 'Resultado: Aisha Wahab ganó la elección especial del 18 de agosto con 51 692 votos (53,1 %) frente a 45 670 (46,9 %) de Melissa Hernandez, y juró el cargo el 2 de septiembre. Ya había encabezado la primaria certificada del 16 de junio con el 42,8 %, frente al 16,8 % de Hernandez. El pronóstico de abajo es el de la primaria de junio, sin cambios: situaba a Wahab primera con un 70,3 % de probabilidad, lo que se cumplió, pero subestimaba su porcentaje (23,5 % de media frente al 42,8 % real) y esperaba a Wendy Huang, no a Hernandez, en segundo lugar. No se publicó ningún pronóstico para la vuelta de agosto. No se usó ningún promedio de encuestas públicas: era un pronóstico basado solo en la base del distrito, la estructura del campo de candidatos y 50 000 simulaciones de Montecarlo.' },
  // FL-20 et TX-23
  'The seat became vacant after Rep. Sheila Cherfilus-McCormick resigned. The special-election date has not yet been set.': {
    fr: 'Le siège est vacant depuis la démission de la représentante Sheila Cherfilus-McCormick. La date de la partielle n’est pas encore fixée.',
    es: 'El escaño quedó vacante tras la dimisión de la representante Sheila Cherfilus-McCormick. Aún no se ha fijado la fecha de la elección especial.' },
  'The seat became vacant after Rep. Tony Gonzales resigned. The special-election date has not yet been set.': {
    fr: 'Le siège est vacant depuis la démission du représentant Tony Gonzales. La date de la partielle n’est pas encore fixée.',
    es: 'El escaño quedó vacante tras la dimisión del representante Tony Gonzales. Aún no se ha fijado la fecha de la elección especial.' },
  'The projection is party-level and remains provisional until the election calendar and candidate field are official.': {
    fr: 'La projection porte sur le parti gagnant et reste provisoire tant que la date et les candidats ne sont pas officiels.',
    es: 'El pronóstico se refiere al partido ganador y sigue siendo provisional hasta que la fecha y los candidatos sean oficiales.' },
  '119th Congress district': { fr: 'District du 119ᵉ Congrès', es: 'Distrito del 119.º Congreso' },
  'The anchor uses the district that elected the departing member, not a later general-election redistricting plan.': {
    fr: 'Le point de départ est le district qui avait élu l’élu sortant, et non une carte redécoupée pour une élection générale ultérieure.',
    es: 'El punto de partida es el distrito que eligió al representante saliente, no un mapa redibujado para una elección general posterior.' },
  'Candidate field pending': { fr: 'Candidats encore inconnus', es: 'Candidatos aún por conocer' },
  'Candidate-specific effects are not applied before official qualification.': {
    fr: 'Aucun effet propre aux candidats n’est appliqué avant la qualification officielle.',
    es: 'No se aplica ningún efecto propio de los candidatos antes de su inscripción oficial.' },
  'Special-election uncertainty': { fr: 'Incertitude propre aux partielles', es: 'Incertidumbre propia de las elecciones especiales' },
  'The distribution is deliberately wider than a normal general-election projection because date, turnout and nominees remain unknown.': {
    fr: 'La fourchette est volontairement plus large que pour une élection générale, car la date, la participation et les candidats restent inconnus.',
    es: 'La horquilla es deliberadamente más amplia que en una elección general, porque la fecha, la participación y los candidatos siguen siendo desconocidos.' },
  'A writ may never come': { fr: 'La partielle pourrait ne jamais être convoquée', es: 'Puede que la elección nunca se convoque' },
  'This projection assumes a special election is eventually called. No writ had been issued for either seat five months after the vacancy, and leaving a seat vacant until the regular general is a live outcome — not an oversight to be projected away.': {
    fr: 'Cette projection suppose qu’une partielle finira par être convoquée. Cinq mois après la vacance, aucune ne l’avait été pour l’un ou l’autre siège, et laisser un siège vacant jusqu’à l’élection générale est une issue bien réelle, pas un oubli qu’on pourrait ignorer.',
    es: 'Este pronóstico supone que la elección especial acabará convocándose. Cinco meses después de la vacante no se había convocado para ninguno de los dos escaños, y dejar un escaño vacante hasta la elección general es un desenlace real, no un descuido que se pueda ignorar.' },
  'If no writ is issued, the seat is not filled by a special election at all: it stays vacant until the regular general of November 3, 2026, whose winner is sworn in January 2027. That contest runs on the 2026 map and is covered by the House projection, not by this desk.': {
    fr: 'Si aucune partielle n’est convoquée, le siège reste vacant jusqu’à l’élection générale du 3 novembre 2026, dont le gagnant sera assermenté en janvier 2027. Cette course se joue sur la carte de 2026 et figure dans la projection de la Chambre, pas sur cette page.',
    es: 'Si no se convoca la elección especial, el escaño queda vacante hasta la elección general del 3 de noviembre de 2026, cuyo ganador jurará el cargo en enero de 2027. Esa contienda se disputa con el mapa de 2026 y figura en el pronóstico de la Cámara, no en esta página.' },
  'U.S. House Clerk — current vacancies': { fr: 'Greffier de la Chambre des représentants — sièges vacants', es: 'Secretaría de la Cámara de Representantes — escaños vacantes' },
  'A provisional party-control projection for a vacant seat before the writ, date and candidate field are known. It anchors to the 119th Congress district result and widens uncertainty for special-election turnout and candidate effects. It assumes a special election is eventually called — see pending.no_writ_fallback for what governs the seat if none is.': {
    fr: 'Projection provisoire du parti qui remportera un siège vacant, avant que la convocation, la date et les candidats soient connus. Elle part du résultat du district au 119ᵉ Congrès et élargit l’incertitude pour la participation et les effets de candidats. Elle suppose qu’une partielle finira par être convoquée ; voir plus haut ce qui s’applique si aucune ne l’est.',
    es: 'Pronóstico provisional del partido que ganará un escaño vacante, antes de conocer la convocatoria, la fecha y los candidatos. Parte del resultado del distrito en el 119.º Congreso y amplía la incertidumbre por la participación y los efectos de los candidatos. Supone que la elección especial acabará convocándose; más arriba se explica qué ocurre si no.' },
  // GA-13
  "Georgia Secretary of State — official August 25 runoff results": { fr: 'Secrétariat d’État de la Géorgie — résultats officiels du second tour du 25 août', es: 'Secretaría de Estado de Georgia — resultados oficiales de la segunda vuelta del 25 de agosto' },
  'official — 6 of 6 localities reporting': { fr: 'officiel — 6 localités sur 6 dépouillées', es: 'oficial — 6 de 6 localidades escrutadas' },
  'Special runoff to complete the term of Rep. David Scott, who died on April 22, 2026.': {
    fr: 'Second tour d’une partielle pour terminer le mandat du représentant David Scott, mort le 22 avril 2026.',
    es: 'Segunda vuelta de una elección especial para completar el mandato del representante David Scott, fallecido el 22 de abril de 2026.' },
  'Both finalists are Democrats; district partisanship confirms party control but does not decide the same-party runoff.': {
    fr: 'Les deux finalistes sont démocrates : l’orientation du district garantit le parti gagnant, mais ne départage pas deux candidats du même parti.',
    es: 'Los dos finalistas son demócratas: la orientación del distrito asegura el partido ganador, pero no decide entre dos candidatos del mismo partido.' },
  'Certified first-round structure': { fr: 'Résultats certifiés du premier tour', es: 'Resultados certificados de la primera vuelta' },
  "Scott led Blair 46.0% to 37.4% on July 28; that observed vote is the model's main anchor.": {
    fr: 'Scott devançait Blair 46,0 % à 37,4 % le 28 juillet ; ce vote réel est le principal point d’appui du modèle.',
    es: 'Scott aventajaba a Blair 46,0 % a 37,4 % el 28 de julio; ese voto real es el principal punto de apoyo del modelo.' },
  'Runoff retention': { fr: 'Fidélité au second tour', es: 'Fidelidad en la segunda vuelta' },
  'Each finalist retains most, but not all, of the first-round coalition under correlated low-turnout uncertainty.': {
    fr: 'Chaque finaliste conserve l’essentiel, mais pas la totalité, de ses électeurs du premier tour, avec une incertitude commune liée à la faible participation.',
    es: 'Cada finalista conserva la mayor parte, pero no la totalidad, de sus votantes de la primera vuelta, con una incertidumbre común ligada a la baja participación.' },
  'Eliminated-voter uncertainty': { fr: 'Incertitude sur les électeurs des candidats éliminés', es: 'Incertidumbre sobre los votantes de los candidatos eliminados' },
  'Carlos Moore and Republican voters may transfer to either finalist or abstain; no deterministic transfer is imposed.': {
    fr: 'Les électeurs de Carlos Moore et les électeurs républicains peuvent se reporter sur l’un ou l’autre finaliste, ou s’abstenir ; aucun report fixe n’est imposé.',
    es: 'Los votantes de Carlos Moore y los republicanos pueden pasar a cualquiera de los finalistas o abstenerse; no se impone ninguna transferencia fija.' },
  'No public district poll': { fr: 'Aucun sondage public dans le district', es: 'Ninguna encuesta pública en el distrito' },
  'No public GA-13 runoff polling average is used.': { fr: 'Aucune moyenne de sondages publics sur le second tour de GA-13 n’est utilisée.', es: 'No se usa ningún promedio de encuestas públicas sobre la segunda vuelta de GA-13.' },
  'Georgia Secretary of State — official July 28 results': { fr: 'Secrétariat d’État de la Géorgie — résultats officiels du 28 juillet', es: 'Secretaría de Estado de Georgia — resultados oficiales del 28 de julio' },
  'Georgia Secretary of State — special-election call': { fr: 'Secrétariat d’État de la Géorgie — convocation de la partielle', es: 'Secretaría de Estado de Georgia — convocatoria de la elección especial' },
  'Federal Election Commission — GA-13 calendar': { fr: 'Commission électorale fédérale — calendrier de GA-13', es: 'Comisión Federal Electoral — calendario de GA-13' },
  "Result: Everton Blair won the August 25 runoff with 9,895 votes (53.95%) to Marcye Scott's 8,447 (46.05%), on the Georgia Secretary of State's official count. This projection had Scott as an 85.9% favorite by a mean margin of 7.9 points; she lost by 7.9 points, below the model's 5th percentile. The forecast below is kept unchanged as the record of a miss. It was a fundamentals-only head-to-head projection anchored to the July 28 first-round result, with stochastic runoff retention, transfer and turnout assumptions across 50,000 simulations.": {
    fr: 'Résultat : Everton Blair a remporté le second tour du 25 août avec 9 895 voix (53,95 %) contre 8 447 (46,05 %) pour Marcye Scott, selon le décompte officiel du Secrétariat d’État de la Géorgie. Notre projection donnait Scott favorite à 85,9 %, avec une marge moyenne de 7,9 points ; elle a perdu par 7,9 points, sous le 5ᵉ centile du modèle. La projection ci-dessous est laissée telle quelle, comme trace d’une erreur. Elle reposait uniquement sur les fondamentaux, à partir du premier tour du 28 juillet, avec des hypothèses aléatoires de fidélité, de report et de participation sur 50 000 simulations.',
    es: 'Resultado: Everton Blair ganó la segunda vuelta del 25 de agosto con 9895 votos (53,95 %) frente a 8447 (46,05 %) de Marcye Scott, según el recuento oficial de la Secretaría de Estado de Georgia. Nuestro pronóstico daba a Scott como favorita al 85,9 %, con un margen medio de 7,9 puntos; perdió por 7,9 puntos, por debajo del percentil 5 del modelo. El pronóstico de abajo se mantiene sin cambios, como registro de un error. Se basaba solo en los fundamentos, a partir de la primera vuelta del 28 de julio, con supuestos aleatorios de fidelidad, transferencia y participación en 50 000 simulaciones.' },
  // GA-14
  'District-level presidential context used as a prior in a fundamentals-only runoff model.': {
    fr: 'Résultat présidentiel du district, utilisé comme point de départ d’un modèle de second tour fondé uniquement sur les fondamentaux.',
    es: 'Resultado presidencial del distrito, usado como punto de partida de un modelo de segunda vuelta basado solo en los fundamentos.' },
  'Other Republican vote to Fuller': { fr: 'Report des autres voix républicaines sur Fuller', es: 'Transferencia del resto del voto republicano a Fuller' },
  'Modeled as a noisy consolidation rate, not as a certainty.': { fr: 'Modélisé comme un taux de ralliement incertain, pas comme une certitude.', es: 'Modelado como una tasa de agrupamiento incierta, no como una certeza.' },
  'Other non-Republican vote to Harris': { fr: 'Report des autres voix non républicaines sur Harris', es: 'Transferencia del resto del voto no republicano a Harris' },
  'Captures modest but incomplete consolidation on the Democratic side.': { fr: 'Traduit un ralliement modeste et incomplet du côté démocrate.', es: 'Refleja un agrupamiento modesto e incompleto del lado demócrata.' },
  'Runoff turnout tilt': { fr: 'Écart de participation au second tour', es: 'Desequilibrio de participación en la segunda vuelta' },
  'Allows for a small Republican turnout edge in a low-turnout runoff.': { fr: 'Prévoit un léger avantage républicain de participation dans un second tour peu fréquenté.', es: 'Contempla una ligera ventaja republicana de participación en una segunda vuelta con poca afluencia.' },
  'District prior': { fr: 'Point de départ du district', es: 'Punto de partida del distrito' },
  "Anchored to the district's recent presidential lean rather than national polling.": { fr: 'Ancré sur l’orientation présidentielle récente du district plutôt que sur les sondages nationaux.', es: 'Anclado en la orientación presidencial reciente del distrito, no en las encuestas nacionales.' },
  'Georgia Secretary of State / state elections results': { fr: 'Secrétariat d’État de la Géorgie — résultats électoraux', es: 'Secretaría de Estado de Georgia — resultados electorales' },
  'Associated Press race preview': { fr: 'Associated Press — présentation de la course', es: 'Associated Press — presentación de la contienda' },
  'No public runoff polling was used. This page is a fundamentals-only special-election projection built from first-round results, district partisanship, runoff transfer assumptions and 50,000 Monte Carlo simulations.': {
    fr: 'Aucun sondage public sur le second tour n’a été utilisé. Cette projection repose uniquement sur les fondamentaux : résultats du premier tour, orientation du district, hypothèses de report et 50 000 simulations Monte-Carlo.',
    es: 'No se usó ninguna encuesta pública sobre la segunda vuelta. Este pronóstico se basa solo en los fundamentos: resultados de la primera vuelta, orientación del distrito, supuestos de transferencia y 50 000 simulaciones de Montecarlo.' },
  // NJ-11
  'Special election to fill the NJ-11 House vacancy after Gov. Mikie Sherrill left Congress.': {
    fr: 'Partielle pour pourvoir le siège NJ-11 à la Chambre, laissé vacant par le départ de Mikie Sherrill, devenue gouverneure.',
    es: 'Elección especial para cubrir la vacante de NJ-11 en la Cámara tras la salida de Mikie Sherrill, ahora gobernadora.' },
  'District-level presidential context used as a prior in a fundamentals-only special election model.': {
    fr: 'Résultat présidentiel du district, utilisé comme point de départ d’un modèle de partielle fondé uniquement sur les fondamentaux.',
    es: 'Resultado presidencial del distrito, usado como punto de partida de un modelo de elección especial basado solo en los fundamentos.' },
  "Anchored to the district's recent House baseline, then widened for special-election uncertainty.": {
    fr: 'Ancré sur le résultat récent du district à la Chambre, puis élargi pour l’incertitude propre aux partielles.',
    es: 'Anclado en el resultado reciente del distrito en la Cámara y luego ampliado por la incertidumbre propia de las elecciones especiales.' },
  'Current district projection from the U.S. House model used as the main anchor unless district polling appears.': {
    fr: 'Projection actuelle du district dans le modèle de la Chambre, utilisée comme point d’appui principal tant qu’aucun sondage local ne paraît.',
    es: 'Pronóstico actual del distrito en el modelo de la Cámara, usado como principal punto de apoyo mientras no aparezcan encuestas locales.' },
  'District Democratic baseline': { fr: 'Base démocrate du district', es: 'Base demócrata del distrito' },
  'NJ-11 is still a Democratic-leaning district in recent federal results, even after allowing for a lower-turnout special.': {
    fr: 'NJ-11 penche encore vers les démocrates dans les résultats fédéraux récents, même en tenant compte de la faible participation d’une partielle.',
    es: 'NJ-11 sigue inclinándose hacia los demócratas en los resultados federales recientes, incluso teniendo en cuenta la baja participación de una elección especial.' },
  'Current House anchor': { fr: 'Point d’appui : la projection actuelle de la Chambre', es: 'Punto de apoyo: el pronóstico actual de la Cámara' },
  'The special starts from the current district-level House projection rather than a neutral 50-50 environment.': {
    fr: 'La partielle part de la projection actuelle du district à la Chambre, plutôt que d’un contexte neutre à 50-50.',
    es: 'La elección especial parte del pronóstico actual del distrito en la Cámara, no de un contexto neutral de 50-50.' },
  'Special-election turnout risk': { fr: 'Risque lié à la participation', es: 'Riesgo ligado a la participación' },
  "The model still leaves room for a modest Republican turnout edge, but no longer treats that edge as large enough to erase the district's Democratic lean.": {
    fr: 'Le modèle laisse place à un léger avantage républicain de participation, mais ne le juge plus assez grand pour effacer l’orientation démocrate du district.',
    es: 'El modelo deja margen para una ligera ventaja republicana en participación, pero ya no la considera suficiente para borrar la inclinación demócrata del distrito.' },
  'Candidate fit uncertainty': { fr: 'Incertitude sur l’adéquation des candidats', es: 'Incertidumbre sobre el encaje de los candidatos' },
  'Specials can still punish weak partisan fit or local mismatches, but candidate-specific noise is narrower than before because the previous setup overstated upset risk.': {
    fr: 'Une partielle peut encore sanctionner un candidat mal adapté au district, mais l’incertitude propre aux candidats est plus étroite qu’avant, car l’ancien réglage surestimait le risque de surprise.',
    es: 'Una elección especial aún puede castigar a un candidato que encaje mal en el distrito, pero la incertidumbre propia de los candidatos es menor que antes, porque el ajuste anterior sobrestimaba el riesgo de sorpresa.' },
  'This page is fundamentals-only unless a public district poll is added later.': {
    fr: 'Cette page repose uniquement sur les fondamentaux, sauf si un sondage public du district est ajouté plus tard.',
    es: 'Esta página se basa solo en los fundamentos, salvo que más adelante se añada una encuesta pública del distrito.' },
  'New Jersey Division of Elections': { fr: 'Division des élections du New Jersey', es: 'División de Elecciones de Nueva Jersey' },
  'No public district polling average is used here. This is a fundamentals-only special-election projection built from district partisanship, recent House results, special-election turnout assumptions and 50,000 Monte Carlo simulations.': {
    fr: 'Aucune moyenne de sondages publics n’est utilisée ici. Cette projection de partielle repose uniquement sur les fondamentaux : orientation du district, résultats récents à la Chambre, hypothèses de participation et 50 000 simulations Monte-Carlo.',
    es: 'Aquí no se usa ningún promedio de encuestas públicas. Este pronóstico de elección especial se basa solo en los fundamentos: orientación del distrito, resultados recientes en la Cámara, supuestos de participación y 50 000 simulaciones de Montecarlo.' },
};

const BADGES: Record<string, T> = {
  'Fundamentals-only': { fr: 'Fondé sur les fondamentaux', es: 'Basado en los fundamentos' },
  'Fundamentals-only · 50,000 simulations': { fr: 'Fondé sur les fondamentaux · 50 000 simulations', es: 'Basado en los fundamentos · 50 000 simulaciones' },
  'Provisional party-control model': { fr: 'Modèle provisoire du parti gagnant', es: 'Modelo provisional del partido ganador' },
};
const PARTY_WORDS: Record<string, T> = {
  Democrat: { fr: 'Démocrate', es: 'Demócrata' },
  Republican: { fr: 'Républicain', es: 'Republicano' },
  Independent: { fr: 'Indépendant', es: 'Independiente' },
  'No party preference': { fr: 'Sans affiliation', es: 'Sin partido' },
};
export function specialParty(text: string, locale: 'en' | 'fr' | 'es'): string {
  return locale === 'en' ? text : PARTY_WORDS[text]?.[locale] ?? text;
}

export function specialBadge(text: string, locale: 'en' | 'fr' | 'es'): string {
  return locale === 'en' ? text : BADGES[text]?.[locale] ?? text;
}

export function specialNote(text: string | undefined | null, locale: 'en' | 'fr' | 'es'): string {
  if (!text) return '';
  if (locale === 'en') return text.replace(' — see pending.no_writ_fallback for what governs the seat if none is.', '; the note above explains what happens if none is.');
  return SPECIAL_NOTES[text]?.[locale] ?? text;
}
