// app/api/admin/auth/logout/route.js
export async function POST(req) {
  try {
    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return Response.json({ error: "Missing API_BASE_URL env" }, { status: 500 });
    }

    const headersIn = Object.fromEntries(req.headers);

    const r = await fetch(`${apiBase}/api/auth/logout`, {
      method: "POST",
      headers: {
        cookie: headersIn["cookie"],
        authorization: headersIn["authorization"],
      },
      cache: "no-store",
    });

    const raw = await r.text();

    const headersOut = new Headers();
    headersOut.set(
      "content-type",
      r.headers.get("content-type") || "application/json; charset=utf-8"
    );
    r.headers.forEach((v, k) => {
      if (k.toLowerCase() === "set-cookie") headersOut.append("set-cookie", v);
    });

    return new Response(raw && raw.trim() ? raw : JSON.stringify({ ok: true }), {
      status: r.status,
      headers: headersOut,
    });
  } catch (err) {
    console.error("Proxy POST /api/admin/auth/logout error:", err);
    return Response.json({ error: "Auth logout proxy failed" }, { status: 500 });
  }
}
