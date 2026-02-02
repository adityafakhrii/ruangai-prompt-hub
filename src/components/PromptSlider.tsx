import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import PromptCard from "./PromptCard";

// Support both full prompts and preview prompts from the view
interface Prompt {
    id: string;
    title: string;
    category: string;
    full_prompt?: string;           // Full prompt (from detail or legacy)
    prompt_preview?: string;        // Truncated preview (from prompts_preview view)
    image_url: string | null;
    creator_name?: string;
    additional_info?: string | null;
    copy_count?: number;
    profiles?: { email: string | null } | null;
    status?: 'pending' | 'verified' | 'rejected';
    average_rating?: number;
    review_count?: number;
}

interface PromptSliderProps {
    title: string;
    prompts: Prompt[];
    onCopy: (prompt: Prompt) => void;  // Changed to pass prompt object
    onCardClick: (prompt: Prompt) => void;
    onViewAll?: () => void;
    viewAllLabel?: string;
    bookmarkedIds?: Set<string>;
    onToggleBookmark?: (id: string) => void;
}

const PromptSlider = ({
    title,
    prompts,
    onCopy,
    onCardClick,
    onViewAll,
    viewAllLabel = "Lihat semua",
    bookmarkedIds,
    onToggleBookmark
}: PromptSliderProps) => {
    return (
        <section className="w-full py-8">
            <div className="container mx-auto px-4">
                <Carousel opts={{ align: "start", slidesToScroll: 1, dragFree: true }} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3 md:gap-0">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
                        <div className="flex items-center justify-between w-full md:w-auto md:gap-4">
                            <div className="flex items-center gap-2">
                                <CarouselPrevious className="static translate-y-0 h-8 w-8 md:h-9 md:w-9 border-muted-foreground/20 hover:bg-muted" />
                                <CarouselNext className="static translate-y-0 h-8 w-8 md:h-9 md:w-9 border-muted-foreground/20 hover:bg-muted" />
                            </div>
                            {onViewAll && (
                                <Button
                                    variant="ghost"
                                    onClick={onViewAll}
                                    className="text-primary hover:text-primary/80 text-sm md:text-base px-2 md:px-4"
                                >
                                    {viewAllLabel}
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <CarouselContent>
                            {prompts.map((prompt, index) => (
                                <CarouselItem key={prompt.id} className="sm:basis-1/2 lg:basis-1/3">
                                    <PromptCard
                                        id={prompt.id}
                                        title={prompt.title}
                                        category={prompt.category}
                                        fullPrompt={prompt.prompt_preview || prompt.full_prompt || ''}
                                        imageUrl={prompt.image_url || ''}
                                        additionalInfo={prompt.additional_info || undefined}
                                        copyCount={prompt.copy_count}
                                        creatorEmail={prompt.profiles?.email || null}
                                        status={prompt.status}
                                        onCopy={() => onCopy(prompt)}
                                        onClick={() => onCardClick(prompt)}
                                        priority={index < 3}
                                        isBookmarked={bookmarkedIds?.has(prompt.id)}
                                        onToggleBookmark={onToggleBookmark ? (e) => onToggleBookmark(prompt.id) : undefined}
                                        averageRating={prompt.average_rating}
                                        reviewCount={prompt.review_count}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default PromptSlider;
