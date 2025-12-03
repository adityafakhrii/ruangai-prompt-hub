import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
                        {prompts.map((prompt) => (
                            <CarouselItem key={prompt.id} className="sm:basis-1/2 lg:basis-1/3">
                                <PromptCard
                                    id={parseInt(prompt.id)}
                                    title={prompt.title}
                                    category={prompt.category}
                                    prompt={prompt.prompt_text}
                                    fullPrompt={prompt.full_prompt}
                                    imageUrl={prompt.image_url}
                                    creatorName={prompt.creator_name}
                                    onCopy={() => onCopy(prompt.id, prompt.full_prompt)}
                                    onClick={() => onCardClick(prompt)}
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
