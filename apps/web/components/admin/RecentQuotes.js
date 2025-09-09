import Link from "next/link";

const mock = [
  {
    code: "QT-1001",
    name: "John Doe",
    amount: "$2,499.99",
    badge: "Sent",
    badgeColor: "bg-neutral-200",
  },
  {
    code: "QT-1002",
    name: "Jane Smith",
    amount: "$1,899.99",
    badge: "Viewed",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    code: "QT-1003",
    name: "Bob Johnson",
    amount: "$4,999.99",
    badge: "Accepted",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    code: "QT-1004",
    name: "Alice Brown",
    amount: "$799.99",
    badge: "Draft",
    badgeColor: "bg-neutral-200",
  },
];

export default function RecentQuotes() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-800">Recent Quotes</h3>
        <Link href="/admin/quotes" className="text-xs text-neutral-500 hover:text-neutral-700">
          View all
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {mock.map((q) => (
          <li
            key={q.code}
            className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
          >
            <div>
              <div className="text-sm font-medium">{q.code}</div>
              <div className="text-xs text-neutral-500">{q.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`rounded px-2 py-0.5 text-xs ${q.badgeColor}`}>{q.badge}</div>
              <div className="text-sm font-semibold">{q.amount}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
