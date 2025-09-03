// apps/web/app/api-demo/page.js
const base = process.env.NEXT_PUBLIC_API_BASE;

async function getData() {
  const res = await fetch(`${base}/api/hello`, {
    cache: "no-store",
  }); // ผ่าน rewrite
  if (!res.ok) throw new Error("Failed to fetch API");
  return res.json();
}

export default async function ApiDemoPage() {
  const data = await getData();
  return (
    <main style={{ padding: 20 }}>
      <h1>API Demo</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
