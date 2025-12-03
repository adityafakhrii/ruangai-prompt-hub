import { Card } from "@/components/ui/card";

const SkeletonCard = () => {
    return (
        <Card className="bg-card border border-border rounded-xl overflow-hidden animate-pulse h-full flex flex-col">
            {/* Image skeleton */}
            <div className="aspect-video w-full bg-muted" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
                {/* Badge skeleton (hidden in PromptCard when loading, but good to reserve space) */}
                {/* <div className="h-6 w-20 bg-muted rounded-full" /> */}

                {/* Title skeleton */}
                <div className="h-6 w-3/4 bg-muted rounded mb-1" />
                <div className="h-4 w-1/3 bg-muted rounded" />

                {/* Text skeleton */}
                <div className="space-y-2 pt-2 flex-1">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                </div>

                {/* Buttons skeleton */}
                <div className="flex items-center gap-2 pt-4 mt-auto">
                    <div className="h-9 flex-1 bg-muted rounded-lg" />
                    <div className="h-9 w-9 bg-muted rounded-lg" />
                    <div className="h-9 w-9 bg-muted rounded-lg" />
                </div>
            </div>
        </Card>
    );
};

export default SkeletonCard;
