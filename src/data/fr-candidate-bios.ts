// Bios courtes et factuelles des candidats majeurs à la présidentielle 2027.
// Faits établis (parti, fonctions, candidatures passées) + date de déclaration.
// Les candidats absents d'ici retombent sur la prose data-driven du lib.
// Ne PAS inventer : n'ajouter une bio que sur des faits vérifiables.

export const CANDIDATE_BIOS: Record<string, { fr: string; en: string; es: string }> = {
  rn_le_pen: {
    fr: "Députée et figure du Rassemblement national, Marine Le Pen a été finaliste du second tour de la présidentielle en 2017 (face à Emmanuel Macron) et en 2022. Elle a officiellement déclaré sa candidature pour 2027 le 7 juillet 2026, à l'issue d'une décision de la cour d'appel.",
    en: "A member of parliament and figure of the National Rally, Marine Le Pen reached the presidential runoff in 2017 (against Emmanuel Macron) and 2022. She officially declared her 2027 candidacy on 7 July 2026, following a court of appeal ruling.",
    es: "Diputada y figura de la Agrupación Nacional, Marine Le Pen llegó a la segunda vuelta presidencial en 2017 (frente a Emmanuel Macron) y en 2022. Declaró oficialmente su candidatura para 2027 el 7 de julio de 2026, tras una decisión del tribunal de apelación.",
  },
  centre_philippe: {
    fr: "Ancien Premier ministre (2017-2020) et fondateur du parti Horizons, Édouard Philippe est maire du Havre. Il figure parmi les premiers grands candidats déclarés pour 2027 (septembre 2024) et occupe l'espace central de l'échiquier.",
    en: "A former prime minister (2017-2020) and founder of the Horizons party, Édouard Philippe is mayor of Le Havre. He was among the first major declared candidates for 2027 (September 2024), occupying the political centre.",
    es: "Ex primer ministro (2017-2020) y fundador del partido Horizons, Édouard Philippe es alcalde de El Havre. Fue uno de los primeros grandes candidatos declarados para 2027 (septiembre de 2024) y ocupa el espacio central del tablero.",
  },
  left_melenchon: {
    fr: "Fondateur de La France insoumise, Jean-Luc Mélenchon a été candidat à la présidentielle en 2012, 2017 et 2022, frôlant le second tour lors de cette dernière. Il a déclaré sa candidature pour 2027 en mai 2026.",
    en: "Founder of La France Insoumise, Jean-Luc Mélenchon ran for president in 2012, 2017 and 2022, narrowly missing the runoff in the latter. He declared his 2027 candidacy in May 2026.",
    es: "Fundador de La Francia Insumisa, Jean-Luc Mélenchon fue candidato presidencial en 2012, 2017 y 2022, quedándose a las puertas de la segunda vuelta en esta última. Declaró su candidatura para 2027 en mayo de 2026.",
  },
  centre_attal: {
    fr: "Ancien Premier ministre et figure de Renaissance, Gabriel Attal incarne l'aile macroniste après le retrait d'Emmanuel Macron. Il a déclaré sa candidature pour 2027 en mai 2026.",
    en: "A former prime minister and Renaissance figure, Gabriel Attal represents the Macronist wing after Emmanuel Macron's departure. He declared his 2027 candidacy in May 2026.",
    es: "Ex primer ministro y figura de Renaissance, Gabriel Attal encarna el ala macronista tras la retirada de Emmanuel Macron. Declaró su candidatura para 2027 en mayo de 2026.",
  },
  lr_retailleau: {
    fr: "Sénateur et figure des Républicains, Bruno Retailleau a porté la ligne de la droite conservatrice depuis le ministère de l'Intérieur. Il a été désigné candidat pour 2027 par les adhérents LR en avril 2026.",
    en: "A senator and Republican figure, Bruno Retailleau championed the conservative right from the interior ministry. He was designated the party's 2027 candidate by LR members in April 2026.",
    es: "Senador y figura de Los Republicanos, Bruno Retailleau defendió la línea de la derecha conservadora desde el Ministerio del Interior. Fue designado candidato para 2027 por los afiliados de LR en abril de 2026.",
  },
  right_bertrand: {
    fr: "Président de la région Hauts-de-France et ancien ministre, Xavier Bertrand se présente sur une ligne de droite gaulliste, en dehors de l'appareil des Républicains. Il a déclaré sa candidature très tôt, en février 2024.",
    en: "President of the Hauts-de-France region and a former minister, Xavier Bertrand runs on a Gaullist right-wing platform, outside the Republican apparatus. He declared his candidacy early, in February 2024.",
    es: "Presidente de la región de Altos de Francia y ex ministro, Xavier Bertrand se presenta con una línea de derecha gaullista, fuera del aparato de Los Republicanos. Declaró su candidatura muy pronto, en febrero de 2024.",
  },
  sovereignist_dupont_aignan: {
    fr: "Fondateur de Debout la France, Nicolas Dupont-Aignan défend une ligne souverainiste. Candidat en 2012, 2017 et 2022, il a de nouveau déclaré sa candidature en mars 2025.",
    en: "Founder of Debout la France, Nicolas Dupont-Aignan advances a sovereignist platform. A candidate in 2012, 2017 and 2022, he again declared his candidacy in March 2025.",
    es: "Fundador de Debout la France, Nicolas Dupont-Aignan defiende una línea soberanista. Candidato en 2012, 2017 y 2022, volvió a declarar su candidatura en marzo de 2025.",
  },
  far_left_arthaud: {
    fr: "Porte-parole de Lutte ouvrière, Nathalie Arthaud porte une candidature d'extrême gauche, communiste et révolutionnaire, comme en 2012, 2017 et 2022. Elle a déclaré sa candidature en décembre 2025.",
    en: "Spokesperson for Lutte Ouvrière, Nathalie Arthaud carries a far-left, communist and revolutionary candidacy, as in 2012, 2017 and 2022. She declared her candidacy in December 2025.",
    es: "Portavoz de Lucha Obrera, Nathalie Arthaud lleva una candidatura de extrema izquierda, comunista y revolucionaria, como en 2012, 2017 y 2022. Declaró su candidatura en diciembre de 2025.",
  },
  rn_bardella: {
    fr: "Président du Rassemblement national et député européen, Jordan Bardella est la figure montante du parti. Il fait figure de candidat potentiel selon l'issue de la situation judiciaire de Marine Le Pen.",
    en: "President of the National Rally and a member of the European Parliament, Jordan Bardella is the party's rising figure. He is a potential candidate depending on the outcome of Marine Le Pen's legal situation.",
    es: "Presidente de la Agrupación Nacional y eurodiputado, Jordan Bardella es la figura ascendente del partido. Es un candidato potencial según el desenlace de la situación judicial de Marine Le Pen.",
  },
  left_glucksmann: {
    fr: "Cofondateur de Place publique et député européen, Raphaël Glucksmann incarne une gauche social-démocrate et pro-européenne, arrivée en tête aux européennes de 2024 à gauche.",
    en: "Co-founder of Place Publique and a member of the European Parliament, Raphaël Glucksmann represents a social-democratic, pro-European left that topped the left in the 2024 European elections.",
    es: "Cofundador de Place Publique y eurodiputado, Raphaël Glucksmann encarna una izquierda socialdemócrata y proeuropea, que encabezó a la izquierda en las europeas de 2024.",
  },
};
