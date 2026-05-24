import type { TransitProperties } from "@/data";

interface TransitTooltipProps {
  properties: TransitProperties;
}

export default function TransitTooltip({ properties }: TransitTooltipProps) {
  return (
    <div className="flex flex-col gap-0.5 font-sans text-xs">
      <span className="font-semibold">{properties.name}</span>
      {properties.description && (
        <span className="text-muted-foreground">{properties.description}</span>
      )}
    </div>
  );
}
