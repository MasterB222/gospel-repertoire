import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card className="p-4">
      <Icon size={18} className="mb-2 text-accent-ink" />
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
