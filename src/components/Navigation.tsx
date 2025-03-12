import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

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
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MedTracker
        </Link>

        <div className="hidden sm:flex gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-blue-200"
            >
              {item.text}
            </Link>
          ))}
        </div>

        <div className="sm:hidden">
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
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={handleMenuClose}
                component={Link}
                to={item.path}
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
