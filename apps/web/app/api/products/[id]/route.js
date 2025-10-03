export async function GET(_req, { params }) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/products/${params.id}`, {
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ error: "Backend error" }, { status: res.status });
    return Response.json(await res.json());
  } catch (err) {
    console.error("Proxy /api/products/[id] error:", err);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
