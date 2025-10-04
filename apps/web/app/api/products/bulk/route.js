// app/api/products/bulk/route.js

// Proxy POST /api/products/bulk  ->  ${API_BASE_URL}/api/products/bulk
// Body: { ids: number[] }

export async function POST(req) {
  try {
    const body = await req.json(); // expect: { ids: [...] }
    const apiBase = process.env.API_BASE_URL;

    if (!apiBase) {
      return Response.json({ error: "Missing API_BASE_URL env" }, { status: 500 });
    }

    // basic validation
    if (!body || !Array.isArray(body.ids)) {
      return Response.json({ error: "Body must be { ids: number[] }" }, { status: 400 });
    }

    const backendRes = await fetch(`${apiBase}/api/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // forward only the fields we need to be safe
      body: JSON.stringify({ ids: body.ids }),
      cache: "no-store",
    });

    // pass-through backend status and json
    const data = await backendRes.json().catch(() => ({}));
    return Response.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Proxy /api/products/bulk error:", err);
    return Response.json({ error: "Failed to fetch bulk products" }, { status: 500 });
  }
}
