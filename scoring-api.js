// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  try {
    // Vérifie la méthode HTTP
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Lecture manuelle du body (Vercel ne le parse pas automatiquement)
    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    // Parse du JSON reçu
    const data = JSON.parse(rawBody || "{}");

    // Nettoyage du texte
    const clean = (text) =>
      text?.replace(/[^\w\s]/gi, "").toLowerCase() || "";

    const titre = clean(data.titre);
    const description = clean(data.description);
    const date = data.date || "";

    // Calcul
    const mots = `${titre} ${description}`.split(/\s+/).filter(Boolean);
    const nbMotsTotal = mots.length;

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

    const score =
      mots.filter((mot) => motsClefs.includes(mot.toLowerCase())).length * 10;

    // Réponse finale
    return res.status(200).json({
      score,
      mots_clefs_trouves: mots.filter((mot) =>
        motsClefs.includes(mot.toLowerCase())
      ),
      nb_mots_total: nbMotsTotal,
      date,
    });
  } catch (error) {
    console.error("Erreur API scoring :", error);
    return res.status(500).json({ error: error.message });
  }
}
