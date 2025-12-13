import type { FC } from 'react';

export interface SlidePlan {
  plan: {
    title: string;
    summary: string;
  }[];
}

interface SlidePlanViewProps {
  data: SlidePlan;
}

export const SlidePlanView: FC<SlidePlanViewProps> = ({ data }) => {
  if (!data || !data.plan || !Array.isArray(data.plan)) {
    return <div className="text-red-500">Invalid slide plan data</div>;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-background/50">
      <h3 className="font-bold mb-2 text-lg">Presentation Plan</h3>
      <ul className="space-y-3">
        {data.plan.map((item, index) => (
          <li
            key={`${index}-${item.title}`}
            className="p-3 border-l-4 border-primary bg-muted/50 rounded-r-lg"
          >
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
