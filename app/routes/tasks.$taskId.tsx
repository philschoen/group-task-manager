// app/routes/tasks.$taskId.tsx
import { redirect, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useNavigate } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCheck,
  FaUser,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import { useState } from "react";
import { TaskModal } from "~/components/TaskModal";


export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      team: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task) throw new Response("Task not found", { status: 404 });

  // Verify user has access to this task
  const canAccess = await prisma.teamMember.findFirst({
    where: {
      teamId: task.teamId,
      userId: userId,
    },
  });

  if (!canAccess) throw new Response("Unauthorized", { status: 403 });

  return { task };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const status = formData.get("status")?.toString();
    await prisma.task.update({
      where: { id: params.taskId },
      data: { status },
    });
    return redirect(`/tasks/${params.taskId}`);
  }

  if (intent === "delete") {
    await prisma.task.delete({ where: { id: params.taskId } });
    return redirect("/tasks");
  }

  if (intent === "addComment") {
    const content = formData.get("content")?.toString();
    if (!content) return null;
    // Add comment logic here if needed
    return redirect(`/tasks/${params.taskId}`);
  }

  return null;
}

export default function TaskDetailModal() {
  const { task } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={() => navigate("..")}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Header */}
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold flex-1 truncate">{task.title}</h1>
        </div>
        {/* Status */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            task.status === "DONE"
              ? "bg-green-100 text-green-800"
              : task.status === "IN_PROGRESS"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
        {/* Description */}
        {task.description && (
          <div className="prose max-w-none mb-6 mt-4">
            <p>{task.description}</p>
          </div>
        )}
        {/* Status update form */}
        <Form method="post" className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <div className="flex space-x-2">
            <select
              name="status"
              defaultValue={task.status}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <button
              type="submit"
              name="intent"
              value="updateStatus"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <FaCheck className="mr-1" />
              {isSubmitting ? "Saving..." : "Update"}
            </button>
          </div>
        </Form>
        {/* Task metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <FaUser className="mt-1 mr-2 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Assigned to</p>
              <p className="font-medium">
                {task.assignedTo?.name || task.assignedTo?.email || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <FaUser className="mt-1 mr-2 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Created by</p>
              <p className="font-medium">
                {task.createdBy?.name || task.createdBy?.email}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <FaCalendarAlt className="mt-1 mr-2 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Due date</p>
              <p className="font-medium">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No due date"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <FaTag className="mt-1 mr-2 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Team</p>
              <Link
                to={`/teams/${task.team.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {task.team.name}
              </Link>
            </div>
          </div>
        </div>
        {/* Edit/Delete buttons */}
        <div className="flex space-x-2 mt-6">
          <button
            className="text-gray-500 hover:text-blue-600"
            title="Edit task"
            onClick={() => setShowEditModal(true)}
          >
            <FaEdit />
          </button>
          <Form method="post">
            <button
              type="submit"
              name="intent"
              value="delete"
              className="text-gray-500 hover:text-red-600"
              title="Delete task"
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this task?")) {
                  e.preventDefault();
                }
              }}
            >
              <FaTrash />
            </button>
          </Form>
        </div>
        {showEditModal && (
          <TaskModal
            teamId={task.team.id}
            onClose={() => setShowEditModal(false)}
            task={{
              id: task.id,
              title: task.title,
              description: task.description ?? undefined,
              status: task.status,
              dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
              assignedToId: task.assignedTo?.id ?? "",
            }}
            users={[]}
          />
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  let message = "Unknown error";
  if (error instanceof Error && error.message) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    message = (error as any).message;
  }
  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{message}</pre>
    </div>
  );
}