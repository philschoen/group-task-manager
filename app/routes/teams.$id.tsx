// app/routes/teams.$teamId._index.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { useState, useEffect } from "react";
import { TaskModal } from "~/components/TaskModal";
import { TaskList } from "~/components/TaskList";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      tasks: true,
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });

  if (team) {
    return Response.json({ team, currentUserId: userId });
  } else {
    throw new Response("Team not found", { status: 404 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "createTask") {
    const title = formData.get("title")?.toString().trim();
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });
    const teamId = formData.get("teamId")?.toString();
    const description = formData.get("description")?.toString() || undefined;
    const status = formData.get("status")?.toString() || "TODO";
    const dueDate = formData.get("dueDate")?.toString() || undefined;
    const assignedToId = formData.get("assignedToId")?.toString() || undefined;

    await prisma.task.create({
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        team: { connect: { id: teamId } },
        createdBy: { connect: { id: userId } },
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      },
    });

    return Response.json({ taskCreated: true });
  }

  if (actionType === "updateTask") {
    const taskId = formData.get("taskId")?.toString();
    const title = formData.get("title")?.toString().trim();
    if (!taskId || !title) return Response.json({ error: "Task ID and title required" }, { status: 400 });

    const description = formData.get("description")?.toString() || undefined;
    const status = formData.get("status")?.toString() || "TODO";
    const dueDate = formData.get("dueDate")?.toString() || undefined;
    const assignedToId = formData.get("assignedToId")?.toString() || undefined;

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedToId
          ? { connect: { id: assignedToId } }
          : { disconnect: true },
      },
    });

    return Response.json({ taskUpdated: true });
  }

  return null;
}

export default function TeamDetailPage() {
  const { team, currentUserId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Find current user's role
  const currentUserRole =
    team.members?.find((m: any) => m.user.id === currentUserId)?.role;

  useEffect(() => {
    if (actionData?.taskCreated || actionData?.taskUpdated) {
      setShowTaskModal(false);
      setEditingTask(null);
    }
  }, [actionData]);

  function handleEditTask(task: any) {
    setEditingTask(task);
    setShowTaskModal(true);
  }

  function handleCloseModal() {
    setShowTaskModal(false);
    setEditingTask(null);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto">
      {/* Main Content - Left Side */}
      <div className="flex-1">
        {/* Team Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="mt-2 text-gray-600">{team.description}</p>
            )}
          </div>
          {currentUserRole === "ADMIN" && (
            <Form method="post">
              <button
                name="_action"
                value="deleteTeam"
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                onClick={(e) => {
                  if (!confirm("Delete this team permanently?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete Team
              </button>
            </Form>
          )}
        </div>

        {/* Task Creation Form */}
        <button
          onClick={() => setShowTaskModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
        >
          Create New Task
        </button>

        {showTaskModal && (
          <TaskModal
            teamId={team.id}
            onClose={handleCloseModal}
            task={editingTask}
            users={team.members.map((m: any) => m.user)}
          />
        )}
        {/* Task List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <TaskList tasks={team.tasks} onEditTask={handleEditTask} />
        </div>
      </div>

      {/* Members Sidebar - Right Side */}
      <div className="md:w-80 space-y-6">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="p-6 text-red-600">
      <h2>Team Error</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useRouteError();
  if (isRouteErrorResponse(caught)) {
    return (
      <div className="p-6 text-yellow-600">
        <h2>{caught.status} {caught.statusText}</h2>
        <p>{caught.data?.message || "An error occurred."}</p>
      </div>
    );
  }
  throw caught;
}