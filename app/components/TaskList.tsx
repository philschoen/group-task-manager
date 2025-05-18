import React from "react";
import { FaEdit } from "react-icons/fa";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | string;
};

const statusStyles: Record<string, string> = {
  TODO: "bg-gray-200 text-gray-800 border border-gray-300",
  IN_PROGRESS: "bg-yellow-200 text-yellow-900 border border-yellow-400",
  DONE: "bg-green-200 text-green-900 border border-green-400",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function TaskList({
  tasks,
  onEditTask,
}: {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 flex items-center gap-2">
        No tasks yet
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {tasks.map((task) => (
        <li key={task.id} className="py-3 flex items-center">
          <span className="flex-1">{task.title}</span>
          <span
            className={`px-2 py-1 text-xs rounded font-semibold ml-2 ${
              statusStyles[task.status] || "bg-gray-100"
            }`}
          >
            {statusLabels[task.status] || task.status}
          </span>
          {onEditTask && (
            <button
              className="ml-3 text-blue-600 hover:text-blue-800"
              title="Edit Task"
              aria-label={`Edit task: ${task.title}`}
              onClick={() => onEditTask(task)}
            >
              <FaEdit />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}