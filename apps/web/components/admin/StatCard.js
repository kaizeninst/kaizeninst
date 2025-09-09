import { FileText, DollarSign, AlertTriangle, Users2 } from "lucide-react";

const iconMap = {
  file: FileText,
  dollar: DollarSign,
  alert: AlertTriangle,
  users: Users2,
};

export default function StatCard({ title, value, sub, icon }) {
  const Icon = iconMap[icon] || FileText;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-sm text-neutral-600">{title}</h3>
        <Icon size={16} className="text-neutral-400" />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
    </div>
  );
}
