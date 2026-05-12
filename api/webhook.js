import { put, get } from "@vercel/blob";

const FILE_NAME = "meta-data.json";

export async function GET() {
  try {
    const result = await get(FILE_NAME, {
      access: "public"
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return Response.json(
        {
          ok: false,
          message: "Ainda não existe nenhum dado salvo. Rode o cenário no Make primeiro."
        },
        { status: 404 }
      );
    }

    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Erro ao buscar os dados salvos no Blob.",
        error: String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const payload = {
      ...body,
      received_at: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo"
      }),
      received_at_iso: new Date().toISOString()
    };

    const blob = await put(FILE_NAME, JSON.stringify(payload, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0
    });

    return Response.json({
      ok: true,
      message: "Dados recebidos e salvos com sucesso.",
      blob_url: blob.url,
      data: payload
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Erro ao receber ou salvar os dados.",
        error: String(error)
      },
      { status: 500 }
    );
  }
}
