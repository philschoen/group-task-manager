import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

import styles from "./tailwind.css?url";
import Navbar from "./components/Navbar";
import { getUserFromSession } from "./utils/auth.server";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => [
  { title: "Group Task Manager" },
  { name: "description", content: "Collaborative task management for teams." },
  { name: "keywords", content: "tasks, teams, collaboration, project management" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
  <>
  <Navbar />
  <Outlet />;
  </>
  );
  
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  return Response.json({ user });
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <title>App Error!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-8 text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <pre className="whitespace-pre-wrap">{error.message}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
