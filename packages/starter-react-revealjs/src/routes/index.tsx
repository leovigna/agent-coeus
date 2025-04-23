import { createFileRoute } from "@tanstack/react-router";

// import { Presentation } from "@/components/Presentation.js";
import { RevealSlides } from "@/components/Reveal.js";
import { ThemeToggle } from "@/components/ui/theme-toggle.js";

export const Route = createFileRoute("/")({
    component: Component,
});

function Component() {
    return (
        <div className="w-full h-screen overflow-hidden relative">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <RevealSlides embedded={true} scrollSnap="mandatory" margin={0.01} plugins={[]}>
                {/* 1. Title Slide */}
                <section className="flex flex-col items-center justify-center text-center p-8">
                    <h1 className="text-5xl font-bold mb-4">Google Slides Style</h1>
                    <p className="text-2xl text-muted-foreground">Tailwind CSS Implementation</p>
                    <p className="text-xl mt-8">By Starter Monorepo Team</p>
                </section>

                {/* 2. Section Header */}
                <section className="flex flex-col items-center justify-center p-8">
                    <h2 className="text-4xl font-bold">Section Header</h2>
                </section>

                {/* 3. Title and Content */}
                <section className="p-8">
                    <h2 className="text-3xl font-bold mb-6">Title and Content</h2>
                    <div className="text-xl">
                        <p className="mb-4">This is a standard content slide with a title and body text.</p>
                        <p>You can include multiple paragraphs or any other content here.</p>
                    </div>
                </section>

                {/* 4. Title and Two Columns */}
                <section className="p-8">
                    <h2 className="text-3xl font-bold mb-6">Two Column Layout</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-xl">
                            <p>This is the content for the left column. You can put text, lists, or other elements here.</p>
                        </div>
                        <div className="text-xl">
                            <p>This is the content for the right column. The two columns are equally sized and separated by a gap.</p>
                        </div>
                    </div>
                </section>

                {/* 5. Title and Bullets */}
                <section className="p-8">
                    <h2 className="text-3xl font-bold mb-6">Bullet Points</h2>
                    <ul className="text-xl space-y-4 list-disc list-inside text-left">
                        <li>First level bullet point</li>
                        <li>
                            Second level bullet point
                            <ul className="pl-8 mt-2 space-y-2 list-circle text-lg">
                                <li>Sub-bullet point</li>
                                <li>Another sub-bullet point</li>
                            </ul>
                        </li>
                        <li>Third level bullet point</li>
                        <li>Fourth level bullet point</li>
                    </ul>
                </section>

                {/* 6. Title and Image */}
                <section className="p-8">
                    <h2 className="text-3xl font-bold mb-6">Image Slide</h2>
                    <div className="flex justify-center">
                        <img src="https://placehold.co/600x400" alt="Placeholder" className="max-h-[300px] object-contain" />
                    </div>
                    <p className="text-center text-muted-foreground mt-2">Image caption goes here</p>
                </section>

                {/* 7. Title, Image and Text */}
                <section className="p-8">
                    <h2 className="text-3xl font-bold mb-6">Image and Text</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex items-center justify-center">
                            <img src="https://placehold.co/400x300" alt="Placeholder" className="max-w-full max-h-[250px] object-contain" />
                        </div>
                        <div className="text-xl">
                            <ul className="space-y-4 list-disc list-inside text-left">
                                <li>Point about the image</li>
                                <li>Another relevant point</li>
                                <li>Final observation about the content</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 8. Quote Slide */}
                <section className="flex flex-col items-center justify-center p-8">
                    <blockquote className="text-2xl italic text-center max-w-2xl">
                        "This is a famous quote that takes center stage on this slide. It's styled to stand out from regular content."
                    </blockquote>
                    <p className="text-right w-full max-w-2xl mt-4 text-muted-foreground">— Attribution</p>
                </section>
            </RevealSlides>
        </div>
    );
}
