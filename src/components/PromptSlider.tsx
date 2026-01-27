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
}

interface PromptSliderProps {
    title: string;
    prompts: Prompt[];
    onCopy: (prompt: Prompt) => void;  // Changed to pass prompt object
    onCardClick: (prompt: Prompt) => void;
    onViewAll?: () => void;
    viewAllLabel?: string;
}

const PromptSlider = ({
    title,
    prompts,
    onCopy,
    onCardClick,
    onViewAll,
    viewAllLabel = "Lihat semua"
}: PromptSliderProps) => {
    return (
        <section className="w-full py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                    {onViewAll && (
                        <Button
                            variant="ghost"
                            onClick={onViewAll}
                            className="text-primary hover:text-primary/80"
                        >
                            {viewAllLabel}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Carousel opts={{ align: "start", slidesToScroll: 1, dragFree: true }}>
                    <div className="relative">
                        <CarouselPrevious className="hidden sm:flex left-2 z-10" />
                        <CarouselNext className="hidden sm:flex right-2 z-10" />
                        <CarouselContent>
                            {prompts.map((prompt, index) => (
                                <CarouselItem key={prompt.id} className="sm:basis-1/2 lg:basis-1/3">
                                    <PromptCard
                                        id={parseInt(prompt.id)}
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
