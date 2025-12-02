import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import PromptCard from "./PromptCard";

interface Prompt {
    id: string;
    title: string;
    category: string;
    prompt_text: string;
    full_prompt: string;
    image_url: string | null;
    creator_name?: string;
}

interface PromptSliderProps {
    title: string;
    prompts: Prompt[];
    onCopy: (id: string, fullPrompt: string) => void;
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
    const [emblaRef] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        dragFree: true,
    });

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

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6">
                        {prompts.map((prompt) => (
                            <div key={prompt.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]">
                                <PromptCard
                                    id={parseInt(prompt.id)}
                                    title={prompt.title}
                                    category={prompt.category}
                                    prompt={prompt.prompt_text}
                                    fullPrompt={prompt.full_prompt}
                                    imageUrl={prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"}
                                    creatorName={prompt.creator_name}
                                    onCopy={() => onCopy(prompt.id, prompt.full_prompt)}
                                    onClick={() => onCardClick(prompt)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromptSlider;
