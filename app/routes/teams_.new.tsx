// app/routes/teams.new.tsx
import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { createTeamWithMembers } from "~/utils/teams.server";
import { useEffect, useState } from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  
  const teamData = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString(),
  };

  const memberEmails = formData.getAll("members")
    .map(m => m.toString().trim())
    .filter(email => email.includes("@")); // Simple email validation

  try {
    const { team, invalidEmails } = await createTeamWithMembers(userId, teamData, memberEmails);
    
    if (invalidEmails && invalidEmails.length > 0) {
      return Response.json({
        team,
        invalidEmails,
        success: true
      });
    }
    return redirect("/teams");

  } catch (error) {
    return data({
      error: "Failed to create team",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
};

export default function NewTeamPage() {
  const actionData = useActionData<typeof action>();
  const [showAlert, setShowAlert] = useState(false);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.invalidEmails?.length > 0) {
      setInvalidEmails(actionData.invalidEmails);
      setShowAlert(true);
    }
  }, [actionData]);

  return (
    <div className="max-w-md mx-auto p-6 relative">
      {/* Alert for invalid emails */}
      {showAlert && (
        <div className="absolute top-4 left-0 right-0 mx-auto max-w-md bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">Some members couldn't be added</p>
              <p>The following emails don't have accounts:</p>
              <ul className="list-disc pl-5">
                {invalidEmails.map(email => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => setShowAlert(false)}
              className="text-yellow-700 hover:text-yellow-900"
            >
              ×
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={() => window.location.href = "/teams"}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Create New Team</h1>
      
      <Form method="post" className="space-y-4">
        {/* Team name and description fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Team Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Members input */}
        <div>
          <label htmlFor="members" className="block text-sm font-medium mb-1">
            Add Members by Email
          </label>
          <textarea
            id="members"
            name="members"
            rows={4}
            className="w-full px-3 py-2 border rounded"
            placeholder="member@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter one email address per line. Only existing users can be added.
          </p>
        </div>

        {actionData?.error && (
          <div className="text-red-500 text-sm">
            {actionData.error}: {actionData.details}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Link
            to="/teams"
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Team
          </button>
        </div>
      </Form>
    </div>
  );
}