import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: "Medications", path: "/medications" },
    { text: "Appointments", path: "/appointments" },
    { text: "Admin", path: "/admin" },
  ];

  return (
    <nav 
      className="navigation-bar"
      style={{ 
        backgroundColor: '#1976d2', 
        color: 'white', 
        padding: '16px',
        position: 'relative',
        zIndex: 1000
      }}
    >
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Link 
          to="/" 
          className="nav-brand"
          style={{ 
            color: 'white !important',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '20px',
            display: 'block'
          }}
        >
          MedTracker
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: '24px' }}>
          {menuItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${idx === 2 ? 'nav-admin' : ''}`}
              style={{
                color: 'white !important',
                fontWeight: 'bold',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                border: idx === 2 ? 'none' : '2px solid white',
                backgroundColor: idx === 2 ? '#1565c0' : 'transparent',
                transition: 'all 0.2s',
                display: 'inline-block',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = idx === 2 ? '#0d47a1' : 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = idx === 2 ? '#1565c0' : 'transparent';
              }}
            >
              {item.text}
            </Link>
          ))}
        </div>

        <div style={{ display: 'none' }}>
          <IconButton
            onClick={handleMenuOpen}
            aria-label="menu"
            sx={{
              color: 'white !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon sx={{ color: 'white !important' }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
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
            {menuItems.map((item, idx) => (
              <MenuItem
                key={item.path}
                onClick={handleMenuClose}
                component={Link}
                to={item.path}
                sx={{
                  fontWeight: 'bold',
                  color: idx === 2 ? '#1976d2' : '#1a1a1a',
                  background: idx === 2 ? '#e3f2fd' : 'transparent',
                  borderRadius: 2,
                  '&:hover': {
                    background: idx === 2 ? '#bbdefb' : '#f5f5f5',
                    color: idx === 2 ? '#1565c0' : '#1a1a1a',
                  },
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  borderBottom: idx < menuItems.length - 1 ? '1px solid #e0e0e0' : 'none',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                {item.text}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
