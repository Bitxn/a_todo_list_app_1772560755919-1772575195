import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8056';

interface Task {
  id: number;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null; // ISO string from backend
  is_done: boolean | null;
}

const formatDateTimeForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Taskdetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!id) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Task = await response.json();
      setTask(data);
      setFormData(data);
    } catch (e) {
      setError(`Failed to load task: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };

  const handleSave = async () => {
    if (!formData || !id) return;

    setIsSaving(true);
    setError(null);

    const dataToSave = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    };

    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'PUT', // Assuming PUT for update
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask: Task = await response.json();
      setTask(updatedTask);
      setFormData(updatedTask);
      navigate('/'); // Go back to home or task list
    } catch (e) {
      setError(`Failed to save task: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      navigate('/'); // Redirect to home after deletion
    } catch (e) {
      setError(`Failed to delete task: ${e instanceof Error ? e.message : String(e)}`);
      setLoading(false);
    }
  };

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-200"></div>
        <p className="ml-4 text-xl">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 to-red-800 text-white p-4">
        <div className="bg-red-700 p-6 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-400 rounded-lg text-white font-semibold transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Task Not Found</h2>
          <p className="text-gray-300">The task you are looking for does not exist or has been deleted.</p>
          <Link
            to="/"
            className="mt-8 inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-bold text-lg shadow-lg transform hover:scale-105 transition duration-300"
          >
            Go to Todo List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
          Task Details
        </h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 shadow-sm"
              placeholder="Task Title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 shadow-sm"
              placeholder="Detailed description of the task..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-gray-700 text-sm font-semibold mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'pending'}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 shadow-sm appearance-none bg-white pr-8"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-gray-700 text-sm font-semibold mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 shadow-sm appearance-none bg-white pr-8"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="due_date" className="block text-gray-700 text-sm font-semibold mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formatDateTimeForInput(formData.due_date)}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 shadow-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_done"
              name="is_done"
              checked={formData.is_done || false}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm cursor-pointer"
            />
            <label htmlFor="is_done" className="ml-3 block text-gray-700 text-sm font-semibold">
              Mark as Done
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold text-lg rounded-full shadow-lg hover:from-blue-700 hover:to-purple-800 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition duration-300"
          >
            Delete Task
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium text-md inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Todo List
          </Link>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}