import { Badge } from "@/components/ui/badge";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low";
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const variants = {
    critical: "bg-critical text-critical-foreground",
    high: "bg-high text-high-foreground",
    medium: "bg-medium text-medium-foreground",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Badge className={`${variants[severity]} uppercase text-xs font-semibold px-3 py-1`}>
      {severity}
    </Badge>
  );
};
