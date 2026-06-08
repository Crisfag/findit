export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API Anthropic non configurée' });

  const { imageBase64, mediaType } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'Image manquante' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-5', max_tokens: 1024,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Analyse cette image et identifie le produit. Réponds UNIQUEMENT en JSON: {"searchQuery":"requête Google Shopping optimisée","productName":"nom du produit","category":"fashion|tools|deco|games|books|garden|pets|kids|sports|beauty|electro","description":"description courte","keyFeatures":["..."],"estimatedPrice":"fourchette en euros","colors":["couleur"],"confidence":95}` }
        ]}]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const rawText = data.content[0]?.text || '';
    let analysis;
    try {
      analysis = JSON.parse(rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
    } catch(e) {
      analysis = { searchQuery:'article similaire', productName:'Produit identifié', category:'all', description:'Produit analysé', keyFeatures:[], estimatedPrice:'Non estimé', colors:[], confidence:50 };
    }
    return res.status(200).json({ success: true, analysis });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
