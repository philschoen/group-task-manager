// app/routes/dashboard.tsx
import { json } from "@remix-run/node";
import { useLoaderData, Link, useRouteError, isRouteErrorResponse, Outlet } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { FaFilter, FaSearch, FaTasks, FaCheckCircle, FaSpinner, FaCalendarAlt } from "react-icons/fa";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { createdById: userId }
      ]
    },
    include: {
      team: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true } }
    },
    orderBy: { dueDate: 'asc' }
  });

  return { tasks }; // <-- Just return the data, not Response.json
}

export default function TaskDashboard() {
  const { tasks } = useLoaderData<typeof loader>();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  type Task = typeof tasks[number];

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  type Status = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  const statusCounts = tasks.reduce((acc: Record<Status, number>, task: Task) => {
    acc[task.status as Status] = (acc[task.status as Status] || 0) + 1;
    acc['ALL'] = (acc['ALL'] || 0) + 1;
    return acc;
  }, { ALL: 0, TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<Status, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaTasks className="mr-3 text-blue-600" /> My Tasks
        </h1>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-8 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All ({statusCounts['ALL'] || 0})</option>
              <option value="TODO">To Do ({statusCounts['TODO'] || 0})</option>
              <option value="IN_PROGRESS">In Progress ({statusCounts['IN_PROGRESS'] || 0})</option>
              <option value="DONE">Done ({statusCounts['DONE'] || 0})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {([
          { status: 'ALL', label: 'Total Tasks', color: 'bg-gray-100 text-gray-800' },
          { status: 'TODO', label: 'To Do', color: 'bg-red-100 text-red-800' },
          { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
          { status: 'DONE', label: 'Completed', color: 'bg-green-100 text-green-800' },
        ] as { status: Status; label: string; color: string }[]).map((stat) => (
          <div key={stat.status} className={`p-4 rounded-lg ${stat.color}`}>
            <div className="text-2xl font-bold">{statusCounts[stat.status] || 0}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tasks found matching your criteria
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task: Task) => (
              <li key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'DONE' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.team && (
                        <Link 
                          to={`/teams/${task.team.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {task.team.name}
                        </Link>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-medium truncate">
                      <Link to={`/tasks/${task.id}`} className="hover:text-blue-600">
                        {task.title}
                      </Link>
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center mr-4">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center">
                          <span className="inline-block h-4 w-4 rounded-full bg-gray-200 mr-1"></span>
                          {task.assignedTo.name || task.assignedTo.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
        <h2 className="text-xl font-bold mb-2">
          {error.status} {error.statusText}
        </h2>
        <p>{error.data?.message || "An error occurred while loading your tasks."}</p>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  let errorMessage = "Unknown error";
  if (error instanceof Error && error.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-red-50 border border-red-200 rounded text-red-800">
      <h2 className="text-xl font-bold mb-2">Unexpected Error</h2>
      <p>
        Sorry, something went wrong while loading your tasks.
      </p>
      <pre className="mt-4 whitespace-pre-wrap text-sm">
        {errorMessage}
      </pre>
      <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
    </div>
  );
}