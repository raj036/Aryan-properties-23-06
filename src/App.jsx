import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { LoginProvider, useLogin } from "./hooks/LoginContext.jsx";
import { SidebarProvider } from "./hooks/SidebarContext.jsx";

import Sidebar from "./pages/Adminpage/Sidebar.jsx";
import Admin from "./pages/Adminpage/Admin.jsx"; // Adjust import based on Admin location
import Login from "./hooks/Login.jsx"; // Adjust import based on Login location
import ProtectedRoute from "./hooks/ProtectedRoutes.jsx";
import UserSidebar from "./pages/UserPage/UserSidebar.jsx";
import UserDashboard from "./pages/UserPage/UserDashboard.jsx";
//import { User } from "lucide-react";
import User from "./components/User.jsx";
import Property from "./components/Property.jsx";
import Client from "./components/Client.jsx";
import Access from "./components/Access.jsx";
import InputField from "./components/InputField.jsx";

const App = ({ showSidebar }) => {
  const { user } = useLogin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="App ">
      <div className={`flex h-screen ${showSidebar ? "flex " : ""}`}>
        {/* Sidebar displayed conditionally */}
        {showSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}
        <div
          className={`flex-grow w-[80%] ${
            showSidebar && isSidebarOpen ? "ml-64" : ""
          }`}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin-dashboard" element={<Admin />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin-user" element={<User />} />{" "}
              {/* ✅ Use lowercase /user */}
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin-property" element={<Property />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin-client" element={<Client />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin-access" element={<Access />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin-inputfield" element={<InputField />} />
            </Route>

            {/* Protected Routes for User */}
            <Route element={<ProtectedRoute />}>
              <Route path="/user-dashboard" element={<UserDashboard />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const noSidebarPages = ["/", "/login", "/user-dashboard"];

  useEffect(() => {
    setShowSidebar(!noSidebarPages.includes(location.pathname));
  }, [location.pathname]);

  return <App showSidebar={showSidebar} />;
};

export default function RootApp() {
  return (
    <LoginProvider>
      <SidebarProvider>
        <Router  basename="/aryans/">
          <AppWrapper />
        </Router>
      </SidebarProvider>
    </LoginProvider>
  );
}
