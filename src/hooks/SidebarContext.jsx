import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Sidebar state (you can customize this)

  
  return (
    <SidebarContext.Provider value={{ isSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the sidebar context
export const useSidebar = () => {
  return useContext(SidebarContext);
};