// app/api/quotes/route.js
export async function POST(req) {
  try {
    const body = await req.json();
    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return Response.json({ error: "Missing API_BASE_URL env" }, { status: 500 });
    }
    const res = await fetch(`${apiBase}/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy POST /api/quotes error:", err);
    return Response.json({ error: "Failed to submit quote" }, { status: 500 });
  }
}
