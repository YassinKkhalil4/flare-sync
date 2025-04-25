
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layouts/MainLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import SocialConnect from "@/pages/SocialConnect";
import Messaging from "@/pages/Messaging";
import CreatorProfile from "@/pages/CreatorProfile";
import BrandDeals from "@/pages/BrandDeals";
import Plans from "@/pages/Plans";
import AdminDashboard from "@/pages/AdminDashboard";
import NotificationsPage from "@/pages/NotificationsPage";
import PaymentHistory from "@/pages/PaymentHistory";

// Content Management Pages
import ContentListPage from "@/pages/Content/ContentListPage";
import ContentCreatePage from "@/pages/Content/ContentCreatePage";
import ContentEditPage from "@/pages/Content/ContentEditPage";
import ContentDetailPage from "@/pages/Content/ContentDetailPage";
import ContentApprovalPage from "@/pages/Content/ContentApprovalPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes - All wrapped in MainLayout */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/social-connect" element={<SocialConnect />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/profile" element={<CreatorProfile />} />
        <Route path="/deals" element={<BrandDeals />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/payment-history" element={<PaymentHistory />} /> 
        
        {/* Content Management Routes */}
        <Route path="/content" element={<ContentListPage />} />
        <Route path="/content/create" element={<ContentCreatePage />} />
        <Route path="/content/edit/:id" element={<ContentEditPage />} />
        <Route path="/content/:id" element={<ContentDetailPage />} />
        <Route path="/content/approvals" element={<ContentApprovalPage />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
