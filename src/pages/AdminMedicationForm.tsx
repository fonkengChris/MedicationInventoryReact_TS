import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import axios from "axios";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, TextField, SelectChangeEvent } from "@mui/material";

const AdminMedicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [medication, setMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    form: "tablet",
    route: "oral",
    manufacturer: "",
    notes: "",
  });

  const formOptions = [
    "tablet",
    "capsule",
    "injection",
    "cream",
    "solution",
    "other",
  ];
  const routeOptions = ["oral", "intravenous", "topical", "other"];

  useEffect(() => {
    if (id) {
      const fetchMedication = async () => {
        try {
          const response = await medicationApi.getById(id);

          if (!response.data) {
            throw new Error("No medication data received");
          }

          setMedication(response.data);
        } catch (error) {
          console.error("Error details:", error);

          if (axios.isAxiosError(error) && error.response?.status === 404) {
            alert("Medication not found. It may have been deleted.");
            navigate("/admin/medications");
          } else {
            alert("Error loading medication data. Please try again.");
          }
        }
      };
      fetchMedication();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (
        !medication.name ||
        !medication.dosage ||
        !medication.form ||
        !medication.route
      ) {
        throw new Error("Required fields missing");
      }

      if (id) {
        await medicationApi.update(id, medication);
      } else {
        await medicationApi.create({
          name: medication.name,
          dosage: medication.dosage,
          form: medication.form,
          route: medication.route,
          manufacturer: medication.manufacturer,
          notes: medication.notes,
        });
      }
      navigate("/admin/medications");
    } catch (error) {
      console.error("Error saving medication:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          alert(
            "Network error: Please check your internet connection and ensure the server is running."
          );
        } else if (error.response?.status === 404) {
          alert("Medication not found. It may have been deleted.");
          navigate("/admin/medications");
        } else if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/auth");
        } else {
          alert(
            `Error: ${
              error.response?.data?.message || "An unexpected error occurred"
            }`
          );
        }
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setMedication((prev) => ({
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
          {id ? "Edit Medication" : "Add New Medication"}
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
                value={medication.name}
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
                label="Dosage"
                name="dosage"
                value={medication.dosage}
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
                <InputLabel sx={{ color: '#666666' }}>Form</InputLabel>
                <Select
                  name="form"
                  value={medication.form}
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
                  {formOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666666' }}>Route</InputLabel>
                <Select
                  name="route"
                  value={medication.route}
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
                  {routeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={medication.manufacturer}
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={medication.notes}
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
              onClick={() => navigate("/admin/medications")}
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
                ? "Update Medication"
                : "Add Medication"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminMedicationForm;
