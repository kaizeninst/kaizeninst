export async function GET(req) {
  try {
    const qs = new URL(req.url).searchParams.toString();
    const url = `${process.env.API_BASE_URL}/api/products${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return Response.json({ error: "Backend error" }, { status: res.status });
    return Response.json(await res.json());
  } catch (err) {
    console.error("Proxy /api/products error:", err);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
