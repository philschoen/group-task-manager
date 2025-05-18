// app/routes/_index.tsx
import { Link } from "@remix-run/react";
import { FaTasks, FaUsers, FaPlus, FaArrowRight, FaChartBar } from "react-icons/fa";

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Streamline Your Team's Productivity
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Collaborate, track tasks, and achieve goals together with our intuitive team management platform.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            to="/teams/new"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create Team
          </Link>
          <Link
            to="/teams"
            className="flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Browse Teams <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTasks className="text-blue-600 text-3xl mb-4" />,
                title: "Task Management",
                description: "Create, assign, and track tasks with multiple statuses and priorities."
              },
              {
                icon: <FaUsers className="text-green-600 text-3xl mb-4" />,
                title: "Team Collaboration",
                description: "Invite members, set roles, and work together seamlessly."
              },
              {
                icon: <FaChartBar className="text-purple-600 text-3xl mb-4" />,
                title: "Progress Tracking",
                description: "Visualize your team's progress with intuitive dashboards."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to boost your team's efficiency?</h2>
          <p className="text-xl mb-8">Join thousands of teams already managing their work with our platform.</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}