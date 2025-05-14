import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import SocialProfile from '../pages/SocialProfile';
import NotFound from '../pages/NotFound';
import Legal from '../pages/Legal';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Contact from '../pages/Contact';
import Pricing from '../pages/Pricing';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import Auth from '../pages/Auth';
import EditProfile from '../pages/EditProfile';
import Upgrade from '../pages/Upgrade';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import CreateAdminUser from '../pages/CreateAdminUser';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/social-profile/:id" element={<SocialProfile />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogPost />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/create-user" element={<CreateAdminUser />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
