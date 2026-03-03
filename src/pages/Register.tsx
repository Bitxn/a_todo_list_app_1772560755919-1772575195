import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate network delay for a more realistic user experience
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // This part simulates user registration as no explicit backend endpoint for register
      // was provided. In a real application, an API call would be made here.
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        email: formData.email,
        username: formData.username,
        password: formData.password, // In a production app, passwords should be hashed server-side.
      };

      if (users.some((user: any) => user.email === newUser.email || user.username === newUser.username)) {
          setErrors({ form: 'User with this email or username already exists.' });
          setIsSubmitting(false);
          return;
      }
      localStorage.setItem('registeredUsers', JSON.stringify([...users, newUser]));
      
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrors({ form: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Create Your Account
        </h2>
        {registrationSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">Your account has been created. Redirecting to login...</span>
          </div>
        )}
        {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{errors.form}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`block w-full px-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
              placeholder="you@example.com"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`block w-full px-4 py-3 border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
              placeholder="Choose a username"
              aria-invalid={errors.username ? "true" : "false"}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <p id="username-error" className="mt-2 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`block w-full px-4 py-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
              placeholder="Min 6 characters"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`block w-full px-4 py-3 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
              placeholder="Confirm your password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || registrationSuccess}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
              (isSubmitting || registrationSuccess) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}