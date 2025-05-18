// app/components/TaskModal.tsx
import { Form } from "@remix-run/react";
import { useState } from "react";

// Add a prop for users to assign tasks
export function TaskModal({
  teamId,
  onClose,
  task,
  users = [],
}: {
  teamId: string;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    dueDate?: string | null;
    assignedToId?: string | null;
  };
  users?: { id: string; name?: string | null; email: string }[];
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "TODO");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [assignedToId, setAssignedToId] = useState(
    task?.assignedToId ? String(task.assignedToId) : ""
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {task ? "Edit Task" : "Create New Task"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="teamId" value={teamId} />
            <input
              type="hidden"
              name="_action"
              value={task ? "updateTask" : "createTask"}
            />
            {task && <input type="hidden" name="taskId" value={task.id} />}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-2 flex gap-2">
                {[
                  {
                    value: "TODO",
                    label: "To Do",
                    color: "bg-gray-200",
                    selected: "bg-blue-600 text-white border-blue-600",
                  },
                  {
                    value: "IN_PROGRESS",
                    label: "In Progress",
                    color: "bg-yellow-200",
                    selected: "bg-yellow-500 text-white border-yellow-500",
                  },
                  {
                    value: "DONE",
                    label: "Done",
                    color: "bg-green-200",
                    selected: "bg-green-600 text-white border-green-600",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 px-3 py-2 text-center rounded-md cursor-pointer border transition
                      ${
                        status === option.value
                          ? option.selected + " shadow"
                          : option.color + " border-gray-300 text-gray-700 hover:bg-opacity-80"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={() => setStatus(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="assignedToId"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To
              </label>
              <select
                id="assignedToId"
                name="assignedToId"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ? `${user.name} (${user.email})` : user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {task ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}