// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  console.log("🟢 Nouvelle requête reçue sur /api/scoring avec méthode :", req.method);

  try {
    // Vérifie la méthode HTTP
    if (req.method !== "POST") {
      console.warn("⚠️ Méthode non autorisée :", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Lecture manuelle du body (Vercel ne le parse pas automatiquement)
    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    console.log("📩 RAW BODY reçu ===>", rawBody || "(vide)");

    // Tentative de parsing JSON
    let data = {};
    try {
      data = JSON.parse(rawBody || "{}");
    } catch (parseErr) {
      console.error("❌ Erreur lors du JSON.parse :", parseErr);
      return res.status(400).json({ error: "Invalid JSON format", rawBody });
    }

    console.log("✅ PARSED BODY ===>", data);

    // Nettoyage du texte
    const clean = (text) =>
      text?.replace(/[^\w\s]/gi, "").toLowerCase() || "";

    const titre = clean(data.titre);
    const description = clean(data.description);
    const date = data.date || "";

    console.log("🧩 Données nettoyées :", { titre, description, date });

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

    // Calcul du score
    const score =
      mots.filter((mot) => motsClefs.includes(mot.toLowerCase())).length * 10;

    console.log("📊 Score calculé :", score);

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
