import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8056';

interface ProfileSettings {
  theme: 'light' | 'dark';
  defaultPriority: 'Low' | 'Medium' | 'High';
  receiveNotifications: boolean;
}

export default function Profile() {
  const [settings, setSettings] = useState<ProfileSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('profileSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      // Fallback if localStorage item is corrupted
      console.error("Failed to parse saved settings from localStorage:", error);
    }
    return {
      theme: 'light',
      defaultPriority: 'Medium',
      receiveNotifications: true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('profileSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
    // Apply theme to document for global effect (Tailwind dark mode)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleSettingChange = (key: keyof ProfileSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/db/export/csv/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white drop-shadow-lg">
          Your Profile
        </h1>

        {/* User Information Card */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" /> Account Information
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-400 dark:bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-md">
              JD
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">John Doe</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">john.doe@example.com</p>
            </div>
          </div>
          <button
            onClick={() => alert('Editing profile is not yet implemented.')}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Edit Profile
          </button>
        </div>

        {/* App Settings Card */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <CogIcon className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" /> App Settings
          </h2>
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md shadow-sm">
              <label htmlFor="theme-toggle" className="text-gray-700 dark:text-white font-medium">Theme</label>
              <div className="flex items-center space-x-2">
                <SunIcon className="h-5 w-5 text-yellow-500" />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="theme-toggle"
                    className="sr-only peer"
                    checked={settings.theme === 'dark'}
                    onChange={() => handleSettingChange('theme', settings.theme === 'light' ? 'dark' : 'light')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <MoonIcon className="h-5 w-5 text-indigo-500" />
              </div>
            </div>

            {/* Default Priority */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md shadow-sm">
              <label htmlFor="default-priority" className="text-gray-700 dark:text-white font-medium">Default Task Priority</label>
              <select
                id="default-priority"
                value={settings.defaultPriority}
                onChange={(e) => handleSettingChange('defaultPriority', e.target.value as ProfileSettings['defaultPriority'])}
                className="block w-32 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md shadow-sm">
              <label htmlFor="notifications-toggle" className="text-gray-700 dark:text-white font-medium">Receive Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="notifications-toggle"
                  className="sr-only peer"
                  checked={settings.receiveNotifications}
                  onChange={() => handleSettingChange('receiveNotifications', !settings.receiveNotifications)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-gray-700 dark:to-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <DatabaseIcon className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" /> Data Management
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Export all your tasks as a CSV file for backup or analysis.
          </p>
          <button
            onClick={handleExportTasks}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-md shadow-md hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
          >
            Export All Tasks (CSV)
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" /> Home
          </Link>
          <Link
            to="/about"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            <InfoIcon className="h-5 w-5 mr-2" /> About
          </Link>
        </div>
      </div>
    </div>
  );
}

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.757l-.707-.707M6.343 17.657l-.707-.707M16.325 16.757l.707.707M6.343 6.343l.707.707M12 18a6 6 0 100-12 6 6 0 000 12z" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);