// apps/web/app/api/categories/route.js
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const res = await fetch(`${process.env.API_BASE_URL}/api/categories${qs ? `?${qs}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ error: "Backend error" }, { status: res.status });
    return Response.json(await res.json());
  } catch (err) {
    console.error("Proxy /api/categories error:", err);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
