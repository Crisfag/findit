// netlify/functions/analyze-image.js
// Analyse une image avec Claude Vision et retourne des termes de recherche

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: 'Clé API Anthropic non configurée' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { imageBase64, mediaType } = body;

    if (!imageBase64) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: 'Image manquante' })
      };
    }

    // Appel à Claude Vision
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: imageBase64,
                }
              },
              {
                type: 'text',
                text: `Tu es un expert en identification de produits pour une application de shopping mondiale appelée Find It.

Analyse cette image et identifie le ou les produits visibles.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "searchQuery": "requête de recherche optimale en français pour trouver ce produit sur Google Shopping",
  "productName": "nom du produit identifié",
  "category": "une de ces catégories: fashion, tools, deco, games, books, garden, pets, kids, sports, beauty, electro",
  "description": "description courte et précise du produit en 1-2 phrases",
  "keyFeatures": ["caractéristique 1", "caractéristique 2", "caractéristique 3"],
  "estimatedPrice": "fourchette de prix estimée en euros",
  "colors": ["couleur principale"],
  "confidence": 95
}

Règles importantes:
- searchQuery doit être très précis pour trouver exactement ce produit (marque + modèle si visible, matière, couleur, style)
- Si tu vois une marque visible, inclus-la dans searchQuery
- confidence est ton niveau de certitude de 0 à 100
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erreur API Anthropic');
    }

    const rawText = data.content[0]?.text || '';

    // Parse JSON de la réponse Claude
    let analysis;
    try {
      // Nettoie les éventuels backticks markdown
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      // Fallback si le JSON est mal formé
      analysis = {
        searchQuery: 'article similaire',
        productName: 'Produit identifié',
        category: 'all',
        description: 'Produit analysé par IA',
        keyFeatures: [],
        estimatedPrice: 'Prix non estimé',
        colors: [],
        confidence: 50
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        analysis,
        rawResponse: rawText
      })
    };

  } catch (err) {
    console.error('analyze-image error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur analyse: ' + err.message })
    };
  }
};
