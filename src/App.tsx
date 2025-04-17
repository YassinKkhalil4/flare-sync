import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SocialConnect from "./pages/SocialConnect";
import Messaging from "./pages/Messaging";
import CreatorProfile from "./pages/CreatorProfile";
import BrandDeals from "./pages/BrandDeals";
import Plans from "./pages/Plans";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import PaymentHistory from "./pages/PaymentHistory";

// Content Management Pages
import ContentListPage from "./pages/Content/ContentListPage";
import ContentCreatePage from "./pages/Content/ContentCreatePage";
import ContentEditPage from "./pages/Content/ContentEditPage";
import ContentDetailPage from "./pages/Content/ContentDetailPage";
import ContentApprovalPage from "./pages/Content/ContentApprovalPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/social-connect" element={
              <ProtectedRoute>
                <SocialConnect />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <CreatorProfile />
              </ProtectedRoute>
            } />
            <Route path="/deals" element={
              <ProtectedRoute>
                <BrandDeals />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            
            {/* Content Management Routes */}
            <Route path="/content" element={
              <ProtectedRoute>
                <ContentListPage />
              </ProtectedRoute>
            } />
            <Route path="/content/create" element={
              <ProtectedRoute>
                <ContentCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/content/edit/:id" element={
              <ProtectedRoute>
                <ContentEditPage />
              </ProtectedRoute>
            } />
            <Route path="/content/:id" element={
              <ProtectedRoute>
                <ContentDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/content/approvals" element={
              <ProtectedRoute>
                <ContentApprovalPage />
              </ProtectedRoute>
            } />
             <Route path="/payment-history" element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
