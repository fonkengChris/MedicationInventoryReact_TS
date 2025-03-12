import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { jwtDecode } from "jwt-decode";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const isAdmin = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded: { role: string } = jwtDecode(token);
      return decoded.role === "admin" || decoded.role === "superAdmin";
    } catch {
      return false;
    }
  };

  const getUserName = () => {
    const token = localStorage.getItem("token");
    if (!token) return "";
    try {
      const decoded: { username: string } = jwtDecode(token);
      return decoded.username;
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            MedTracker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link to="/appointments" className="hover:text-blue-600">
                  Appointments
                </Link>
                <Link to="/medications" className="hover:text-blue-600">
                  Medications
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="hover:text-blue-600">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && (
            <div className="sm:hidden absolute left-1/2 -translate-x-1/2">
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <MenuItem
                  onClick={handleMenuClose}
                  component={Link}
                  to="/appointments"
                >
                  Appointments
                </MenuItem>
                <MenuItem
                  onClick={handleMenuClose}
                  component={Link}
                  to="/medications"
                >
                  Medications
                </MenuItem>
                {isAdmin() && (
                  <MenuItem
                    onClick={handleMenuClose}
                    component={Link}
                    to="/admin"
                  >
                    Admin
                  </MenuItem>
                )}
              </Menu>
            </div>
          )}

          {/* User Info and Auth - Always Visible */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">Welcome: {getUserName()}</span>
                <button onClick={handleLogout} className="hover:text-blue-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
