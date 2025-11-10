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
      <nav className="bg-blue-600 shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-bold"
            style={{ 
              color: '#ffffff',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            MedTracker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link 
                  to="/appointments" 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Appointments
                </Link>
                <Link 
                  to="/medications" 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Medications
                </Link>
                <Link 
                  to="/administration" 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Administration
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    style={{ 
                      color: '#ffffff',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#1565c0',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d47a1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }}
                  >
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
                onClick={handleMenuOpen}
                aria-label="menu"
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <MenuIcon sx={{ color: '#ffffff' }} />
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
                PaperProps={{
                  sx: {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    borderRadius: 2,
                    mt: 1
                  }
                }}
              >
                <MenuItem
                  onClick={handleMenuClose}
                  component={Link}
                  to="/appointments"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1a1a1a'
                    }
                  }}
                >
                  Appointments
                </MenuItem>
                <MenuItem
                  onClick={handleMenuClose}
                  component={Link}
                  to="/medications"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1a1a1a'
                    }
                  }}
                >
                  Medications
                </MenuItem>
                <MenuItem
                  onClick={handleMenuClose}
                  component={Link}
                  to="/administration"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1a1a1a'
                    }
                  }}
                >
                  Administration
                </MenuItem>
                {isAdmin() && (
                  <MenuItem
                    onClick={handleMenuClose}
                    component={Link}
                    to="/admin"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1976d2',
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#bbdefb',
                        color: '#1565c0'
                      }
                    }}
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
                <span style={{ color: '#ffffff', fontWeight: 500 }}>
                  Welcome: {getUserName()}
                </span>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '2px solid #ffffff',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={{ 
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '2px solid #ffffff',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
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
