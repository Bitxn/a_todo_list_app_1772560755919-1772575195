
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Taskdetail from './pages/Taskdetail';
import Profile from './pages/Profile';
import About from './pages/About';

export const APP_ROUTES = [
  {
    "name": "Home",
    "route": "/"
  },
  {
    "name": "Login",
    "route": "/login"
  },
  {
    "name": "Register",
    "route": "/register"
  },
  {
    "name": "TaskDetail",
    "route": "/tasks/:id"
  },
  {
    "name": "Profile",
    "route": "/profile"
  },
  {
    "name": "About",
    "route": "/about"
  }
];

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks/:id" element={<Taskdetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
