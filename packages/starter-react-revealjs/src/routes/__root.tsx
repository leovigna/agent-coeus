import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                title: "Vite + React + TS",
            },
            {
                name: "description",
                content: "Starter React Application with Vite, React, Typescript",
            },
        ],
        links: [
            {
                rel: "icon",
                href: "/vite.svg",
            },
        ],
        scripts: [],
    }),
    component: Component,
});

function Component() {
    return (
        <>
            <HeadContent />
            <Outlet />
        </>
    );
}
