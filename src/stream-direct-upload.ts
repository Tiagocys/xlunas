export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Só POST autorizado (poderá adicionar JWT depois)
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // 1) chama API do Cloudflare Stream para criar URL de upload único
      const api = `https://api.cloudflare.com/client/v4/accounts/${env.STREAM_ACCOUNT_ID}/stream/direct_upload`;

      const body = JSON.stringify({
        requireSignedURLs: true,      // impede hotlink
        maxDurationSeconds: 3600      // 1 h máx por vídeo
      });

      const cfResp = await fetch(api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STREAM_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (!cfResp.ok) {
        const err = await cfResp.text();
        console.error('CF Stream error', err);
        return new Response('Upstream error', { status: 502 });
      }

      const { result } = await cfResp.json(); // { uploadURL, uid }
      return Response.json(result, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    } catch (e) {
      console.error(e);
      return new Response('Internal Error', { status: 500 });
    }
  }
};

interface Env {
  STREAM_ACCOUNT_ID: string;
  STREAM_API_TOKEN: string;
}
