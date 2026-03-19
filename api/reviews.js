// api/reviews.js
// Vercel Serverless Function — busca avaliações do Google Places API
// A chave GOOGLE_API_KEY fica segura como variável de ambiente na Vercel

export default async function handler(req, res) {
  // Permite requisições do próprio site (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({ error: 'Configuração ausente no servidor.' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&language=pt-BR&reviews_sort=newest&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(502).json({ error: 'Erro ao consultar Google Places.', detail: data.status });
    }

    const { rating, user_ratings_total, reviews } = data.result;

    // Retorna apenas o necessário (nunca expõe a chave)
    return res.status(200).json({
      rating,
      total: user_ratings_total,
      reviews: (reviews || []).map(r => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
        photo: r.profile_photo_url,
      }))
    });

  } catch (err) {
    return res.status(500).json({ error: 'Falha na requisição.', detail: err.message });
  }
}
