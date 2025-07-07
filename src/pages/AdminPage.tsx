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
      <div className="min-h-screen bg-gray-100">
        {/* Mobile Header */}
        <div className="lg:hidden bg-blue-900 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-2"
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
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-blue-900 p-4 transition-transform duration-300 ease-in-out overflow-y-auto`}
          >
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-white mb-8">
                Admin Dashboard
              </h1>
            </div>

            <button
              onClick={() => {
                navigate("/");
                closeSidebar();
              }}
              className="flex items-center text-white mb-8 hover:text-blue-200"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </button>

            <nav className="space-y-4">
              <Link
                to="/admin/medications"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiPackage className="mr-2" />
                Medications
              </Link>
              <Link
                to="/admin/active-medications"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiList className="mr-2" />
                Active Medications
              </Link>
              <Link
                to="/admin/service-users"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiUsers className="mr-2" />
                Service Users
              </Link>
              <Link
                to="/admin/appointments"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiCalendar className="mr-2" />
                Appointments
              </Link>
              <Link
                to="/admin/medication-updates"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiActivity className="mr-2" />
                Medication Updates
              </Link>
              <Link
                to="/admin/weekly-summaries"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiBarChart2 className="mr-2" />
                Weekly Summaries
              </Link>
              {/* <Link
                to="/admin/medication-trends"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiTrendingUp className="mr-2" />
                Medication Trends
              </Link> */}
              {/* <Link
                to="/admin/rota"
                className="flex items-center text-white hover:text-blue-200 py-2"
                onClick={closeSidebar}
              >
                <FiClock className="mr-2" />
                Rota Calendar 
              </Link> */}
              {decodedToken.role === "superAdmin" && (
                <>
                  <Link
                    to="/admin/users"
                    className="flex items-center text-white hover:text-blue-200 py-2"
                    onClick={closeSidebar}
                  >
                    <FiUsers className="mr-2" />
                    Users
                  </Link>
                  <Link
                    to="/admin/groups"
                    className="flex items-center text-white hover:text-blue-200 py-2"
                    onClick={closeSidebar}
                  >
                    <FiUserPlus className="mr-2" />
                    Groups
                  </Link>
                </>
              )}
            </nav>
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
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <Outlet />
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
