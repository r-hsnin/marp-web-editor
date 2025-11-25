import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PaginationToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

export const PaginationToggle: React.FC<PaginationToggleProps> = ({
    enabled,
    onToggle,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className={cn(
                        "h-7 w-7 transition-all",
                        enabled
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
                    )}
                >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="sr-only">Toggle pagination</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {enabled ? "Hide page numbers" : "Show page numbers"}
            </TooltipContent>
        </Tooltip>
    );
};
