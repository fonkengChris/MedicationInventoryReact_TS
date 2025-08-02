import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentApi, serviceUserApi } from "../services/api";
import { Appointment, ServiceUser } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Button, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminAppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [appointment, setAppointment] = useState<Partial<Appointment>>({
    serviceUser: "",
    appointmentType: "Medical",
    dateTime: "",
    duration: 30,
    location: "",
    provider: {
      name: "",
      role: "",
      contactNumber: "",
    },
    status: "Scheduled",
    notes: "",
  });

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const response = await serviceUserApi.getAll();
        setServiceUsers(response.data);
      } catch (error) {
        console.error("Error fetching service users:", error);
      }
    };

    fetchServiceUsers();

    if (id) {
      const fetchAppointment = async () => {
        try {
          const response = await appointmentApi.getById(id);
          const apt = response.data;
          setAppointment({
            ...apt,
            serviceUser: (apt.serviceUser as any)._id,
            dateTime: new Date(apt.dateTime).toISOString().slice(0, 16),
          });
        } catch (error) {
          console.error("Error fetching appointment:", error);
          navigate("/admin/appointments");
        }
      };
      fetchAppointment();
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
        await appointmentApi.update(id, {
          ...appointment,
          updatedBy: decodedToken._id,
        });
      } else {
        await appointmentApi.create({
          ...(appointment as Omit<Appointment, "_id">),
          createdBy: decodedToken._id,
        });
      }
      navigate("/admin/appointments");
    } catch (error) {
      console.error("Error saving appointment:", error);
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
    if (name.startsWith("provider.")) {
      const field = name.split(".")[1];
      setAppointment((prev) => ({
        ...prev,
        provider: {
          ...prev.provider,
          [field]: value,
        },
      }));
    } else {
      setAppointment((prev) => ({
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
          {id ? "Edit Appointment" : "Add Appointment"}
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
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666666' }}>Service User</InputLabel>
                <Select
                  name="serviceUser"
                  value={appointment.serviceUser as string}
                  onChange={handleChange}
                  required
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
                  <MenuItem value="">Select Service User</MenuItem>
                  {serviceUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666666' }}>Appointment Type</InputLabel>
                <Select
                  name="appointmentType"
                  value={appointment.appointmentType}
                  onChange={handleChange}
                  required
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
                  {["Medical", "Dental", "Therapy", "Review", "Other"].map(
                    (type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date & Time"
                name="dateTime"
                type="datetime-local"
                value={appointment.dateTime}
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
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={appointment.duration}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
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
                label="Location"
                name="location"
                value={appointment.location}
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
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666666' }}>Status</InputLabel>
                <Select
                  name="status"
                  value={appointment.status}
                  onChange={handleChange}
                  required
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
                  {[
                    "Scheduled",
                    "Completed",
                    "Cancelled",
                    "Rescheduled",
                    "NoShow",
                  ].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={appointment.notes}
                onChange={handleChange}
                multiline
                rows={3}
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
              onClick={() => navigate("/admin/appointments")}
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
                ? "Update Appointment"
                : "Add Appointment"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAppointmentForm;
