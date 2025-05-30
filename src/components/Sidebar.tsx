import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';

// This component is now deprecated in favor of AppSidebar
// Keeping it for backwards compatibility
interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  console.warn('Sidebar component is deprecated. Use AppSidebar instead.');
  
  // Redirect to use AppSidebar instead
  return <AppSidebar />;
};

export default Sidebar;
