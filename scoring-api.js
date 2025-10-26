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

    // 🔍 LOGS POUR DIAGNOSTIC
    console.log("RAW BODY ===>", rawBody);

    // Parse du JSON reçu
    const data = JSON.parse(rawBody || "{}");

    // 🔍 LOGS POUR DIAGNOSTIC
    console.log("PARSED BODY ===>", data);

    // Nettoyage du texte
    const clean = (text) =>
      text?.replace(/[^\w\s]/gi, "").toLowerCase() || "";

    const titre = clean(data.titre);
    const description = clean(data.description);
    const date = data.date || "";

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
      "collective",
    ];

    // Calcul du score : +10 points par mot-clé trouvé
    const score =
      mots.filter((mot) => motsClefs.includes(mot.toLowerCase())).length * 10;

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
    console.error("❌ Erreur API scoring :", error);
    return res.status(500).json({ error: error.message });
  }
}
