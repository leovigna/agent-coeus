import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import reactLogo from "../assets/react.svg";

import { Button } from "@/components/ui/button.js";
import { ThemeToggle } from "@/components/ui/theme-toggle.js";

import viteLogo from "/vite.svg";

export const Route = createFileRoute("/")({
    component: Component,
});

function Component() {
    const [count, setCount] = useState(1);
    const { data: todo } = useQuery({
        queryFn: async () => {
            const response = fetch(`https://jsonplaceholder.typicode.com/todos/${count}`);
            return ((await response).json()) as unknown as {
                userId: number;
                id: number;
                title: string;
                completed: boolean;
            };
        },
        queryKey: ["todos", count],
    });

    return (
        <div className="max-w-[1280px] mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="flex gap-8 justify-center">
                <a href="https://vite.dev" target="_blank" rel="noreferrer noopener">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer noopener">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1 className="text-5xl font-bold my-8">Vite + React</h1>
            <div className="p-8 mb-8">
                <Button
                    onClick={() => setCount(count => count + 1)}
                    className="mb-4"
                >
                    count is
                    {" "}
                    {count}
                </Button>
                <p className="mt-4">
                    Edit
                    {" "}
                    <code className="font-mono bg-muted px-1 py-0.5 rounded">src/App.tsx</code>
                    {" "}
                    and save to test HMR
                </p>
            </div>
            <p className="text-muted-foreground">
                Click on the Vite and React logos to learn more
            </p>
            <br />
            <p>
                Todo
                {" "}
                {count}
                <br />
                {todo ? JSON.stringify(todo) : "loading"}
            </p>
        </div>
    );
}
