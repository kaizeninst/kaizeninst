// apps/web/app/api/categories/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // ดึงพารามิเตอร์ที่จำเป็น (รองรับ page/limit/search/status/parent_id)
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "100";
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const parent_id = searchParams.get("parent_id") ?? "null";

  const qs = new URLSearchParams({ page, limit, parent_id });
  if (status) qs.set("status", status);
  if (search) qs.set("search", search);

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/categories?${qs.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: res.status });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Proxy /api/categories error:", err);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
