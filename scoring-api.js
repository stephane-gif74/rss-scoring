// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Nettoyage du texte
      const clean = (text) =>
        text?.replace(/[^\w\s]/gi, "").toLowerCase() || "";

      const titre = clean(req.body.titre);
      const description = clean(req.body.description);
      const date = req.body.date || "";

      // Séparation des mots et comptage
      const mots = `${titre} ${description}`.split(/\s+/).filter(Boolean);
      const nbMotsTotal = mots.length;

      // Liste de mots-clés de scoring
      const motsClefs = [
        "management",
        "leadership",
        "culture",
        "innovation",
        "transformation",
        "stratégie",
        "performance",
        "intelligence",
        "collective"
      ];

      // Calcul du score : +10 points par mot-clé trouvé
      const score =
        mots.filter((mot) => motsClefs.includes(mot.toLowerCase())).length *
        10;

      // Réponse JSON
      return res.status(200).json({
        score,
        mots_clefs_trouves: mots.filter((mot) =>
          motsClefs.includes(mot.toLowerCase())
        ),
        nb_mots_total: nbMotsTotal,
        date,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // Toute autre méthode (GET, PUT, etc.) sera rejetée
    res.status(405).json({ error: "Method not allowed" });
  }
}
