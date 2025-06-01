import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link, json, redirect } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";

import { prisma } from '~/utils/db.server'


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request); // Throws/redirects if not logged in

  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: { members: true },
    });
    return teams;
  } catch (error) {
    console.error("Database not accessible:", error);
    throw new Response("Database not accessible", { status: 500 });
  }
};


export default function TeamsPage() {
  const teams = useLoaderData<typeof loader>();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Teams</h1>
        <Link
          to="/teams/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + New Team
        </Link>
      </div>

      <ul className="space-y-3">
        {teams.map((team: { id: string; name: string }) => (
          <li key={team.id} className="border p-4 rounded-lg hover:bg-gray-400">
            <Link to={`/teams/${team.id}`} className="block">
              <h3 className="font-medium">{team.name}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}