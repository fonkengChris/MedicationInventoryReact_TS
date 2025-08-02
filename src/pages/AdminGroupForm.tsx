import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupApi } from "../services/api";
import { Group } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Button, Typography, Box, TextField } from "@mui/material";

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
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 4,
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Typography 
          sx={{ 
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: '#1a1a1a',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {id ? "Edit Group" : "Add Group"}
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          p: 4
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={group.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666'
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={group.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666'
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              type="button"
              onClick={() => navigate("/admin/groups")}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderColor: '#e0e0e0',
                color: '#666666',
                fontWeight: 'bold',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  backgroundColor: '#f5f5f5'
                },
                transition: 'all 0.2s ease'
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#999999',
                  boxShadow: 'none'
                },
                transition: 'all 0.2s ease'
              }}
              variant="contained"
            >
              {isLoading ? "Saving..." : id ? "Update Group" : "Add Group"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminGroupForm;
