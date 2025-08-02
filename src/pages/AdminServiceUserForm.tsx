import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceUserApi, groupApi } from "../services/api";
import { ServiceUser, Group } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, TextField, SelectChangeEvent } from "@mui/material";

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminServiceUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [serviceUser, setServiceUser] = useState<Partial<ServiceUser>>({
    name: "",
    dateOfBirth: "",
    nhsNumber: "",
    address: "",
    phoneNumber: "",
    group: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (id) {
      const fetchServiceUser = async () => {
        try {
          const response = await serviceUserApi.getById(id);
          const user = response.data;
          setServiceUser({
            ...user,
            dateOfBirth: new Date(user.dateOfBirth).toISOString().split("T")[0],
          });
        } catch (error) {
          console.error("Error fetching service user:", error);
          navigate("/admin/service-users");
        }
      };
      fetchServiceUser();
    }
  }, [id, navigate]);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (
        !serviceUser.name ||
        !serviceUser.dateOfBirth ||
        !serviceUser.nhsNumber ||
        !serviceUser.address ||
        !serviceUser.phoneNumber
      ) {
        throw new Error("Please fill in all required fields");
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: DecodedToken = jwtDecode(token);
      const currentUser = {
        userId: decodedToken._id,
        role: decodedToken.role,
      };

      if (id) {
        await serviceUserApi.update(id, {
          ...serviceUser,
          updatedBy: currentUser.userId,
        });
      } else {
        await serviceUserApi.create({
          ...(serviceUser as Omit<ServiceUser, "_id">),
          createdBy: currentUser.userId,
        });
      }
      navigate("/admin/service-users");
    } catch (error) {
      console.error("Error saving service user:", error);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    if (name.includes("emergencyContact.")) {
      const field = name.split(".")[1];
      setServiceUser((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setServiceUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
          {id ? "Edit Service User" : "Add Service User"}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={serviceUser.name}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={serviceUser.dateOfBirth}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NHS Number"
                name="nhsNumber"
                value={serviceUser.nhsNumber}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={serviceUser.address}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={serviceUser.phoneNumber}
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666666' }}>Group</InputLabel>
                <Select
                  name="group"
                  value={serviceUser.group as string}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '& .MuiSelect-select': {
                      color: '#1a1a1a'
                    }
                  }}
                >
                  <MenuItem value="">Select a Group</MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1a1a1a', fontWeight: 'bold' }}>
                Emergency Contact
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="emergencyContact.name"
                    value={serviceUser.emergencyContact?.name}
                    onChange={handleChange}
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

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    name="emergencyContact.relationship"
                    value={serviceUser.emergencyContact?.relationship}
                    onChange={handleChange}
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

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="emergencyContact.phoneNumber"
                    type="tel"
                    value={serviceUser.emergencyContact?.phoneNumber}
                    onChange={handleChange}
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
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              type="button"
              onClick={() => navigate("/admin/service-users")}
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
              {isLoading
                ? "Saving..."
                : id
                ? "Update Service User"
                : "Add Service User"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminServiceUserForm;
