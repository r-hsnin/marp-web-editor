import { CheckCircle, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ReviewInput {
  score: number;
  overview: string;
  good: string[];
  improvements: Array<{
    slideIndex: number;
    title: string;
    problem: string;
    suggestion: string;
  }>;
}

interface ReviewCardProps {
  input: ReviewInput | undefined;
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ input }: ReviewCardProps) {
  if (!input) {
    return (
      <Card className="w-full opacity-70">
        <CardContent className="py-4">
          <div className="animate-pulse text-xs">Loading review...</div>
        </CardContent>
      </Card>
    );
  }

  const { score, overview, good, improvements } = input;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>📊 レビュー結果</span>
          <StarRating score={score} />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <p className="text-muted-foreground">{overview}</p>

        {good.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 mb-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              良い点
            </div>
            <ul className="space-y-1">
              {good.map((item, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                <li key={i} className="text-xs pl-3 border-l-2 border-green-500/50">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              改善するとより良くなる点
            </div>
            <div className="space-y-2">
              {improvements.map((item, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                <div key={i} className="text-xs pl-3 border-l-2 border-amber-500/50 space-y-0.5">
                  <div className="font-medium">
                    スライド {item.slideIndex + 1}「{item.title}」
                  </div>
                  <div className="text-muted-foreground">{item.problem}</div>
                  <div className="text-foreground">→ {item.suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
