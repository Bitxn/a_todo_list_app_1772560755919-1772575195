import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-10 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 mb-4 drop-shadow-lg">
            About My Awesome Todo App
          </h1>
          <p className="mt-4 text-xl text-gray-200 leading-relaxed font-light">
            Your ultimate companion for managing tasks and boosting productivity.
            This application is designed to help you organize your daily life,
            prioritize what matters, and achieve your goals with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="p-6 bg-white/5 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold text-teal-300 mb-3">Our Mission</h2>
            <p className="text-gray-300 text-lg">
              We believe in simplifying complex workflows. My Awesome Todo App
              provides a clean, intuitive interface to keep track of your tasks,
              from small daily chores to major projects, ensuring nothing falls
              through the cracks.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold text-teal-300 mb-3">Key Features</h2>
            <ul className="list-disc list-inside text-gray-300 text-lg space-y-2">
              <li>Effortless task creation and management</li>
              <li>Set priorities and due dates</li>
              <li>Mark tasks as complete</li>
              <li>Responsive design for any device</li>
              <li>Persistent data storage</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 p-6 bg-white/5 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-teal-300 mb-3 text-center">Technology Stack</h2>
          <p className="text-gray-300 text-lg text-center leading-relaxed">
            This application is built with modern web technologies:
            <span className="block mt-2 font-semibold text-blue-300">Frontend: React, TypeScript, Tailwind CSS</span>
            <span className="block font-semibold text-blue-300">Backend: FastAPI (Python), SQLAlchemy, SQLite</span>
            Providing a robust, scalable, and delightful user experience.
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-md mb-6">
            Ready to streamline your productivity?
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-xl font-medium rounded-full shadow-lg text-white
                       bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-offset-blue-900 focus:ring-blue-500 transform transition-all duration-300 hover:scale-105"
          >
            Go to My Tasks
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <p className="text-center text-gray-500 text-sm mt-12">
          &copy; {new Date().getFullYear()} My Awesome Todo App. All rights reserved.
        </p>
      </div>
    </div>
  );
}