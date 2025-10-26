// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  console.log("Nouvelle requête reçue sur /api/scoring avec méthode :", req.method);

  try {
    if (req.method !== "POST") {
      console.warn("Méthode non autorisée :", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Lecture manuelle du body complet
    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    console.log("RAW BODY reçu (début) ===>", rawBody.slice(0, 200));

    // Nettoyage des caractères de contrôle illégaux
    const safeBody = rawBody.replace(/[\u0000-\u001F]+/g, "");
    let data = {};
    try {
      data = JSON.parse(safeBody);
    } catch (err) {
      console.error("Erreur JSON.parse malgré nettoyage :", err);
      return res.status(400).json({ error: "Invalid JSON content" });
    }

    console.log("PARSED BODY (clés) ===>", Object.keys(data));

    // Nettoyage du texte
    const clean = (text) =>
      text?.replace(/[^\w\s]/gi, "").toLowerCase() || "";

    const titre = clean(data.titre);
    const description = clean(data.description);
    const date = data.date || "";

    // Calcul du score
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

    console.log("Score calculé :", score);

    return res.status(200).json({
      score,
      mots_clefs_trouves: mots.filter((mot) =>
        motsClefs.includes(mot.toLowerCase())
      ),
      nb_mots_total: nbMotsTotal,
      date
    });
  } catch (error) {
    console.error("Erreur API scoring :", error);
    return res.status(500).json({ error: error.message });
  }
}
