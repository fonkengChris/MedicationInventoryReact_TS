import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupApi } from "../services/api";
import { Group } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Button, Typography } from "@mui/material";

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminGroupForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [group, setGroup] = useState<Partial<Group>>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      const fetchGroup = async () => {
        try {
          const response = await groupApi.getById(id);
          setGroup(response.data);
        } catch (error) {
          console.error("Error fetching group:", error);
          navigate("/admin/groups");
        }
      };
      fetchGroup();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: DecodedToken = jwtDecode(token);

      if (id) {
        await groupApi.update(id, {
          ...group,
          updatedBy: decodedToken._id,
        });
      } else {
        await groupApi.create({
          ...(group as Omit<Group, "_id">),
          createdBy: decodedToken._id,
        });
      }
      navigate("/admin/groups");
    } catch (error) {
      console.error("Error saving group:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          {id ? "Edit Group" : "Add Group"}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <input
                type="text"
                name="name"
                value={group.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <textarea
                name="description"
                value={group.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12}>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                <Button
                  type="button"
                  onClick={() => navigate("/admin/groups")}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                  className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isLoading ? "Saving..." : id ? "Update Group" : "Add Group"}
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default AdminGroupForm;
