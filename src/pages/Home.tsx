import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8056';

// Define the Task type based on the backend TaskResponse schema
interface Task {
  id: number;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null; // ISO string from backend datetime
  is_done: boolean | null;
}

// Type for creating a task (title is required in UI, others optional)
interface TaskCreatePayload {
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  is_done?: boolean | null;
}

// Type for updating a task (all fields optional)
interface TaskUpdatePayload {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  is_done?: boolean | null;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<string>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddTaskForm, setShowAddTaskForm] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (e: any) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: TaskCreatePayload = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        priority: newTaskPriority,
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null, // Convert to ISO string for backend
        is_done: false,
      };

      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newTask: Task = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setShowAddTaskForm(false);
    } catch (e: any) {
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (e: any) {
      setError("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleTaskDone = useCallback(async (id: number, currentStatus: boolean | null) => {
    setLoading(true);
    setError(null);
    const newStatus = !currentStatus;
    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, is_done: newStatus } : task
      )
    );

    try {
      const payload: TaskUpdatePayload = { is_done: newStatus };
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'PUT', // Assuming PUT for updating existing resource
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // If backend returns the updated object, we could use it:
      // const updatedTask: Task = await response.json();
      // setTasks(prevTasks => prevTasks.map(task => task.id === id ? updatedTask : task));
    } catch (e: any) {
      setError("Failed to update task status. Please try again.");
      // Revert optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, is_done: currentStatus } : task
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTasks = useMemo(() => {
    let sortedTasks = [...tasks].sort((a, b) => {
      // Sort by `is_done` (completed tasks at bottom)
      if (a.is_done !== b.is_done) {
        return (a.is_done ? 1 : -1) - (b.is_done ? 1 : -1);
      }

      // Sort by due date (earlier dates first, nulls last)
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      if (dateA !== dateB) return dateA - dateB;

      // Sort by priority (High > Medium > Low)
      const priorityOrder: { [key: string]: number } = { 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority?.toLowerCase() || 'medium'] || 0) - (priorityOrder[a.priority?.toLowerCase() || 'medium'] || 0);
    });

    if (filter === 'active') {
      sortedTasks = sortedTasks.filter(task => !task.is_done);
    } else if (filter === 'completed') {
      sortedTasks = sortedTasks.filter(task => task.is_done);
    }
    return sortedTasks;
  }, [tasks, filter]);

  // Determine priority color classes
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500';
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-purple-800 to-indigo-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 transform transition-all duration-300">
        {/* Header and Filter Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-purple-700 pb-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4 sm:mb-0">
            My Todo List
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                filter === 'all'
                  ? 'bg-blue-500 shadow-lg text-white'
                  : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                filter === 'active'
                  ? 'bg-blue-500 shadow-lg text-white'
                  : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                filter === 'completed'
                  ? 'bg-blue-500 shadow-lg text-white'
                  : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Add Task Button/Form Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddTaskForm(!showAddTaskForm)}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            {showAddTaskForm ? 'Cancel Add Task' : 'Add New Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTaskForm && (
          <form onSubmit={handleAddTask} className="bg-purple-700 bg-opacity-50 p-6 rounded-2xl shadow-inner mb-6 space-y-4 transition-all duration-300 ease-in-out">
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-purple-900 border border-purple-600 text-white placeholder-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-purple-900 border border-purple-600 text-white placeholder-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-y transition-all duration-200"
              rows={2}
            ></textarea>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full sm:w-1/2 p-3 rounded-lg bg-purple-900 border border-purple-600 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right-center pr-8"
                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em'}}
              >
                <option value="low" className="bg-purple-900 text-green-300">Low Priority</option>
                <option value="medium" className="bg-purple-900 text-yellow-300">Medium Priority</option>
                <option value="high" className="bg-purple-900 text-red-300">High Priority</option>
              </select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full sm:w-1/2 p-3 rounded-lg bg-purple-900 border border-purple-600 text-white placeholder-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-md shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        )}

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400"></div>
            <p className="ml-4 text-blue-300">Loading tasks...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-xl text-center shadow-lg">
            <p>{error}</p>
            <button onClick={fetchTasks} className="mt-2 text-red-200 underline hover:text-red-100">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="bg-purple-700 bg-opacity-50 p-8 rounded-2xl text-center shadow-lg">
            <p className="text-xl text-purple-300 font-semibold mb-4">No tasks found!</p>
            <p className="text-purple-400">Time to add some new tasks to get things done.</p>
            <button
              onClick={() => setShowAddTaskForm(true)}
              className="mt-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white py-3 px-6 rounded-full font-bold shadow-md hover:from-blue-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              Add Your First Task
            </button>
          </div>
        )}

        {/* Task List */}
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-purple-700 bg-opacity-50 p-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                task.is_done ? 'opacity-70 line-through text-purple-300' : 'text-white'
              }`}
            >
              <div className="flex items-center w-full sm:w-auto mb-3 sm:mb-0 flex-grow">
                <input
                  type="checkbox"
                  checked={!!task.is_done}
                  onChange={() => handleToggleTaskDone(task.id, task.is_done)}
                  className="form-checkbox h-6 w-6 text-blue-500 bg-purple-900 border-purple-500 rounded-md focus:ring-blue-400 cursor-pointer transition duration-200"
                />
                <div className="ml-4 flex-grow">
                  <span className="block text-xl font-semibold break-words">
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-sm text-purple-200 mt-1 break-words">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs mt-2 space-x-2">
                    {task.priority && (
                      <span className={`px-2 py-1 rounded-full border ${getPriorityColor(task.priority)} font-medium`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="px-2 py-1 rounded-full border border-purple-500 bg-purple-600/30 text-purple-200 font-medium">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-3 sm:mt-0 ml-auto sm:ml-0">
                <Link
                  to={`/tasks/${task.id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 p-2 rounded-full hover:bg-purple-600"
                  aria-label={`View details for ${task.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.646 3.646a.5.5 0 01.07-.02l3.546-3.547a1 1 0 011.396 1.396L11.396 9.396a.5.5 0 01-.02.07l-3.547 3.546a1 1 0 01-1.396-1.396l3.547-3.547z" />
                    <path fillRule="evenodd" d="M2 12a2 2 0 012-2h4a1 1 0 010 2H4v2h2a1 1 0 010 2H4v2h2a1 1 0 010 2H4a2 2 0 01-2-2v-8zm8-6a2 2 0 012-2h4a1 1 0 010 2h-4v2h2a1 1 0 010 2h-2v2h2a1 1 0 010 2h-2v2h2a1 1 0 010 2h-4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 rounded-full hover:bg-purple-600"
                  aria-label={`Delete task ${task.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Example links for other pages */}
        <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-purple-700">
          <Link to="/login" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">Login</Link>
          <Link to="/register" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">Register</Link>
          <Link to="/profile" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">Profile</Link>
          <Link to="/about" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">About</Link>
        </div>
      </div>
    </div>
  );
}