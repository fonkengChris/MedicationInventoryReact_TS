import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi, groupApi } from "../services/api";
import { User, Group } from "../types/models";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography } from "@mui/material";

const AdminUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<Partial<User>>({
    username: "",
    email: "",
    role: "user",
    groups: [],
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupApi.getAll();
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();

    if (id) {
      const fetchUser = async () => {
        try {
          const response = await userApi.getById(id);
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
          navigate("/admin/users");
        }
      };
      fetchUser();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await userApi.update(id, user);
      }
      navigate("/admin/users");
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setUser((prev) => ({
      ...prev,
      groups: selectedOptions,
    }));
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Edit User
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="username-label">Username</InputLabel>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="email-label">Email</InputLabel>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={user.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superAdmin">Super Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="groups-label">Groups</InputLabel>
            <Select
              labelId="groups-label"
              multiple
              name="groups"
              value={user.groups as string[]}
              onChange={handleGroupChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base min-h-[120px]"
            >
              {groups.map((group) => (
                <MenuItem key={group._id} value={group._id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Hold Ctrl (Cmd on Mac) to select multiple groups
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              onClick={() => navigate("/admin/users")}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {isLoading ? "Saving..." : "Update User"}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AdminUserForm;
