// app/components/Navbar.tsx
import { Link, useRouteLoaderData } from '@remix-run/react';
import { FaHome, FaTasks, FaUsers, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

type User = {
  name?: string;
  email?: string;
};

type RootLoaderData = {
  user?: User;
};

export default function Navbar() {
  const data = useRouteLoaderData<RootLoaderData>('root');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo/Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">TeamTask</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/teams" icon={<FaUsers className="mr-1" />} text="Teams" />
              <NavLink to="/tasks" icon={<FaTasks className="mr-1" />} text="Tasks" />
            </div>
          </div>

          {/* Right side - Auth/Actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {data?.user ? (
              <>
                {/* <span className="text-gray-500 text-sm">
                  Hi, {data.user.name || data.user.email}
                </span> */}
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <AuthLink
                  to="/auth?mode=login"
                  icon={<FaSignInAlt className="mr-1" />}
                  text="Login"
                />
                <AuthLink
                  to="/auth?mode=signup"
                  icon={<FaUserPlus className="mr-1" />}
                  text="Sign Up"
                  primary
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Reusable NavLink component
function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
    >
      {icon}
      {text}
    </Link>
  );
}

// Special styled AuthLink component
function AuthLink({ to, icon, text, primary = false }: {
  to: string;
  icon: React.ReactNode;
  text: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}