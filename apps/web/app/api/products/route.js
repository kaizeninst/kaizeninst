// apps/web/app/api/products/route.js
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams.toString(); // forward ทุก query param
    const backendUrl = `${process.env.API_BASE_URL}/api/products${qs ? `?${qs}` : ""}`;

    const res = await fetch(backendUrl, { cache: "no-store" });
    if (!res.ok) return Response.json({ error: "Backend error" }, { status: res.status });

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Proxy /api/products error:", err);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
