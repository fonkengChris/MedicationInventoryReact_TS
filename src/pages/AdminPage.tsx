import React, { useState } from "react";
import { Navigate, Outlet, useNavigate, Link } from "react-router-dom";
import {
  FiPackage,
  FiUsers,
  FiArrowLeft,
  FiList,
  FiActivity,
  FiCalendar,
  FiUserPlus,
  FiMenu,
  FiX,
  FiClock,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  exp: number;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth" />;

  try {
    const decodedToken: DecodedToken = jwtDecode(token);

    // Check if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/auth" />;
    }

    if (!["admin", "superAdmin"].includes(decodedToken.role)) {
      return <Navigate to="/" />;
    }

    const closeSidebar = () => {
      setIsSidebarOpen(false);
    };

    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {/* Mobile Header */}
        <div 
          className="lg:hidden p-4 flex justify-between items-center"
          style={{ 
            background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          <h1 className="text-xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Admin Dashboard
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            {isSidebarOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out overflow-y-auto`}
            style={{ 
              background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }}
          >
            <div className="hidden lg:block p-6">
              <h1 className="text-xl font-bold text-white mb-8" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Admin Dashboard
              </h1>
            </div>

            <div className="p-6">
              <button
                onClick={() => {
                  navigate("/");
                  closeSidebar();
                }}
                className="flex items-center text-white mb-8 hover:text-blue-200 transition-colors duration-200 p-3 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <FiArrowLeft className="mr-2" />
                Back to Home
              </button>

              <nav className="space-y-2">
                <Link
                  to="/admin/medications"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiPackage className="mr-3 text-lg" />
                  <span className="font-medium">Medications</span>
                </Link>
                <Link
                  to="/admin/active-medications"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiList className="mr-3 text-lg" />
                  <span className="font-medium">Active Medications</span>
                </Link>
                <Link
                  to="/admin/service-users"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiUsers className="mr-3 text-lg" />
                  <span className="font-medium">Service Users</span>
                </Link>
                <Link
                  to="/admin/appointments"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiCalendar className="mr-3 text-lg" />
                  <span className="font-medium">Appointments</span>
                </Link>
                <Link
                  to="/admin/medication-updates"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiActivity className="mr-3 text-lg" />
                  <span className="font-medium">Medication Updates</span>
                </Link>
                <Link
                  to="/admin/weekly-summaries"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiBarChart2 className="mr-3 text-lg" />
                  <span className="font-medium">Weekly Summaries</span>
                </Link>
                <Link
                  to="/admin/mar"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiTrendingUp className="mr-3 text-lg" />
                  <span className="font-medium">MAR Charts</span>
                </Link>
                <Link
                  to="/admin/administration/settings"
                  className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  <FiClock className="mr-3 text-lg" />
                  <span className="font-medium">Admin Windows</span>
                </Link>
                {decodedToken.role === "superAdmin" && (
                  <>
                    <div className="border-t border-white border-opacity-20 my-4"></div>
                    <Link
                      to="/admin/users"
                      className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      onClick={closeSidebar}
                    >
                      <FiUsers className="mr-3 text-lg" />
                      <span className="font-medium">Users</span>
                    </Link>
                    <Link
                      to="/admin/groups"
                      className="flex items-center text-white hover:text-blue-200 py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      onClick={closeSidebar}
                    >
                      <FiUserPlus className="mr-3 text-lg" />
                      <span className="font-medium">Groups</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={closeSidebar}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8">
              <div 
                className="rounded-xl shadow-lg"
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="p-4 sm:p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/auth" />;
  }
};

export default AdminPage;
