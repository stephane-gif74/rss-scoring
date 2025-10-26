// API de scoring pour articles RSS
// Déploiement : Vercel (gratuit)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Nettoyage automatique
  const clean = (str) => (str || '').replace(/[\r\n\t]/g, ' ').replace(/"/g, "'").substring(0, 5000);
  
  const titre = clean(req.body.titre);
  const description = clean(req.body.description);
  const date = req.body.date || '';
  
  const titreL = titre.toLowerCase();
  const descL = description.toLowerCase();

  const mots = {
    eleve: ["management","manager","leader","leadership","équipe","team","collaborateur","décision","délégation","autonomie","feedback","coaching","mentorat","développement","posture","influence","communication","intelligence émotionnelle","empathie","conflit","motivation","engagement","reconnaissance","style"],
    moyen: ["transformation","changement","innovation","agilité","digital","numérique","télétravail","remote","recrutement","talent","formation","performance","efficacité","productivité","collaboration","quiet quitting","burnout"],
    faible: ["culture","valeurs","organisation","stratégie","confiance","génération"]
  };

  function compter(texte, liste) {
    let count = 0;
    liste.forEach(mot => { if (texte.includes(mot)) count++; });
    return count;
  }

  let score = 0;
  const tE = compter(titreL, mots.eleve);
  const tM = compter(titreL, mots.moyen);
  const tF = compter(titreL, mots.faible);
  
  score += tE * 20 + tM * 15 + tF * 10;
  if ((tE + tM + tF) >= 2) score += 15;

  const dE = compter(descL, mots.eleve);
  const dM = compter(descL, mots.moyen);
  const dF = compter(descL, mots.faible);
  
  score += Math.min(dE, 3) * 8 + Math.min(dM, 3) * 5 + Math.min(dF, 3) * 3;

  if (date) {
    const diffJours = (new Date() - new Date(date)) / 86400000;
    if (diffJours <= 3) score += 10;
    else if (diffJours <= 7) score += 5;
  }

  score = Math.min(score, 100);

  return res.status(200).json({ score, mots_clefs: "", nb_mots_total: tE + tM + tF + dE + dM + dF });
}
```

4. **Commit**

Vercel redéploie auto en 30 sec.

**Dans Make M17**, simplifie :

**Variable 1 :**
```
{{14.article_titre}}
```

**Variable 2 :**
```
{{14.article_description}}
```

**Variable 3 :**
```
{{14.article_date}}
