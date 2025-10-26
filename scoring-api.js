// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { titre = '', description = '', date = '' } = req.body;
  
  const titreL = titre.toLowerCase();
  const descL = description.toLowerCase();

  // Mots-clés par pondération
  const mots = {
    eleve: [
      "management", "manager", "leader", "leadership",
      "équipe", "team", "collaborateur", "collaborateurs",
      "décision", "délégation", "autonomie", "responsabilisation",
      "vision", "direction", "alignement",
      "management situationnel", "management agile",
      "feedback", "coaching", "mentorat", "développement",
      "posture", "posture managériale", "légitimité", "crédibilité",
      "influence", "pouvoir", "autorité",
      "exemplarité", "modèle", "rôle modèle",
      "proximité", "management de proximité",
      "servant leadership", "leader serviteur",
      "communication", "écoute active", "assertivité",
      "intelligence émotionnelle", "empathie", "émotions",
      "conflit", "médiation", "négociation",
      "motivation", "engagement", "reconnaissance",
      "gestion du temps", "priorisation", "organisation",
      "prise de décision", "résolution de problèmes",
      "bienveillance", "care", "résilience", "adaptabilité",
      "entretien", "entretien annuel", "entretien professionnel",
      "évaluation", "appréciation", "recadrage", "confrontation",
      "animation", "facilitation",
      "style", "styles de management",
      "directif", "participatif", "délégatif", "persuasif",
      "micromanagement", "macromanagement"
    ],
    moyen: [
      "transformation", "changement", "conduite du changement",
      "innovation", "agilité", "adaptation",
      "digital", "numérique", "ia", "intelligence artificielle",
      "disruption", "évolution", "mutation",
      "télétravail", "hybride", "remote", "flex office",
      "rse", "responsabilité", "impact",
      "réorganisation", "restructuration", "pivot",
      "expérimentation", "test and learn", "itération",
      "incertitude", "complexité", "ambiguïté", "vuca",
      "recrutement", "talent", "onboarding",
      "fidélisation", "rétention", "turnover",
      "formation", "apprentissage", "upskilling",
      "carrière", "mobilité", "évolution professionnelle",
      "qvct", "qualité de vie", "bien-être",
      "diversité", "inclusion", "égalité",
      "compétences", "skills", "compétence",
      "potentiel", "haut potentiel", "talent management",
      "succession", "plan de succession",
      "parcours", "trajectoire",
      "marque employeur", "employee experience",
      "performance", "efficacité", "productivité",
      "objectifs", "okr", "kpi", "résultats",
      "amélioration continue", "optimisation",
      "excellence", "qualité",
      "collaboration", "coopération", "transversalité",
      "réunion", "meeting", "rituels",
      "suivi", "monitoring", "pilotage",
      "indicateur", "mesure", "efficience",
      "quiet quitting", "grande démission", "resignation",
      "bore-out", "brown-out", "burnout",
      "désengagement", "démotivation",
      "présentéisme", "absentéisme",
      "erreur", "échec", "apprentissage par l'échec",
      "droit à l'erreur", "safe to fail",
      "retour d'expérience", "rex", "post-mortem"
    ],
    faible: [
      "culture", "valeurs", "culture d'entreprise",
      "organisation", "structure", "hiérarchie",
      "processus", "méthode", "méthodologie",
      "gouvernance", "stratégie",
      "confiance", "transparence", "sécurité psychologique",
      "sens", "purpose", "raison d'être",
      "appartenance", "cohésion", "rituel", "cérémonie",
      "génération", "générationnel", "millennial", "gen z", "senior",
      "intergénérationnel", "multigénérationnel",
      "âge", "junior", "expérience"
    ]
  };

  function compter(texte, liste) {
    let count = 0;
    let found = [];
    liste.forEach(mot => {
      if (texte.includes(mot)) {
        count++;
        found.push(mot);
      }
    });
    return { count, found };
  }

  let score = 0;

  // Titre
  const tE = compter(titreL, mots.eleve);
  const tM = compter(titreL, mots.moyen);
  const tF = compter(titreL, mots.faible);
  
  score += tE.count * 20 + tM.count * 15 + tF.count * 10;
  
  const totalT = tE.count + tM.count + tF.count;
  if (totalT >= 2) score += 15;

  // Description
  const dE = compter(descL, mots.eleve);
  const dM = compter(descL, mots.moyen);
  const dF = compter(descL, mots.faible);
  
  score += Math.min(dE.count, 3) * 8;
  score += Math.min(dM.count, 3) * 5;
  score += Math.min(dF.count, 3) * 3;

  // Fraîcheur
  if (date) {
    const articleDate = new Date(date);
    const now = new Date();
    const diffJours = (now - articleDate) / (1000 * 60 * 60 * 24);
    if (diffJours <= 3) score += 10;
    else if (diffJours <= 7) score += 5;
  }

  score = Math.min(score, 100);

  return res.status(200).json({
    score,
    mots_clefs: tE.found.concat(tM.found, tF.found).slice(0, 10).join(", "),
    nb_mots_total: totalT + dE.count + dM.count + dF.count
  });
}
