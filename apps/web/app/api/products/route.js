export async function GET() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/products`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Proxy /api/products error:", err);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
