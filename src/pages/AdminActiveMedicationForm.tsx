import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  activeMedicationApi,
  serviceUserApi,
  medicationApi,
} from "../services/api";
import { ActiveMedication, ServiceUser, Medication } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, TextField, SelectChangeEvent, Chip } from "@mui/material";

const DOSAGE_UNITS = [
  "mg",
  "ml",
  "g",
  "tablets",
  "capsules",
  "drops",
  "puffs",
  "patches",
];

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminActiveMedicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeMedication, setActiveMedication] = useState<
    Partial<ActiveMedication>
  >({
    serviceUser: "",
    medicationName: "",
    dosage: {
      amount: 0,
      unit: "mg",
    },
    quantityInStock: 0,
    quantityPerDose: 0,
    dosesPerDay: 1,
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    prescribedBy: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceUsersRes, medicationsRes] = await Promise.all([
          serviceUserApi.getAll(),
          medicationApi.getAll(),
        ]);
        setServiceUsers(serviceUsersRes.data);
        setMedications(medicationsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    if (id) {
      const fetchActiveMedication = async () => {
        try {
          const response = await activeMedicationApi.getById(id);
          const medication = response.data;
          setActiveMedication({
            ...medication,
            serviceUser:
              typeof medication.serviceUser === "object"
                ? medication.serviceUser._id
                : medication.serviceUser,
            startDate: new Date(medication.startDate)
              .toISOString()
              .split("T")[0],
            endDate: medication.endDate
              ? new Date(medication.endDate).toISOString().split("T")[0]
              : "",
          });
        } catch (error) {
          console.error("Error fetching active medication:", error);
          navigate("/admin/active-medications");
        }
      };
      fetchActiveMedication();
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
        console.log("Updating active medication:", activeMedication);
        await activeMedicationApi.update(id, {
          ...activeMedication,
          updatedBy: decodedToken._id,
        });
      } else {
        console.log("Creating active medication:", activeMedication);
        await activeMedicationApi.create({
          ...(activeMedication as Omit<ActiveMedication, "_id">),
          updatedBy: decodedToken._id,
        });
      }
      navigate("/admin/active-medications");
    } catch (error) {
      console.error("Error saving active medication:", error);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | number>
  ) => {
    const { name, value } = e.target;
    const inputType = 'type' in e.target ? e.target.type : 'text';

    if (name.startsWith("dosage.")) {
      const field = name.split(".")[1];
      setActiveMedication((prev) => ({
        ...prev,
        dosage: {
          ...prev.dosage!,
          [field]: inputType === "number" ? Number(value) : value,
        } as ActiveMedication["dosage"],
      }));
    } else {
      setActiveMedication((prev) => ({
        ...prev,
        [name]: inputType === "number" ? Number(value) : value,
      }));
    }
  };

  const handleActivationToggle = async (newActiveState: boolean) => {
    if (!id) return;

    try {
      setIsLoading(true);
      if (newActiveState) {
        // Reactivate medication through PUT request
        await activeMedicationApi.update(id, {
          isActive: true,
        });
      } else {
        // Deactivate medication through PATCH request
        await activeMedicationApi.deactivate(id);
      }
      navigate("/admin/active-medications");
    } catch (error) {
      console.error("Error toggling medication activation:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while updating activation status"
      );
    } finally {
      setIsLoading(false);
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
          {id ? "Edit Active Medication" : "Add Active Medication"}
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
                  value={
                    typeof activeMedication.serviceUser === "object"
                      ? activeMedication.serviceUser._id
                      : activeMedication.serviceUser || ""
                  }
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
                <InputLabel sx={{ color: '#666666' }}>Medication</InputLabel>
                <Select
                  name="medicationName"
                  value={activeMedication.medicationName}
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
                  <MenuItem value="">Select Medication</MenuItem>
                  {medications.map((med) => (
                    <MenuItem key={med._id} value={med.name}>
                      {med.name} - {med.dosage}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage Amount"
                name="dosage.amount"
                type="number"
                value={activeMedication.dosage?.amount}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
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
                <InputLabel sx={{ color: '#666666' }}>Dosage Unit</InputLabel>
                <Select
                  name="dosage.unit"
                  value={activeMedication.dosage?.unit}
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
                  {DOSAGE_UNITS.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity in Stock"
                name="quantityInStock"
                type="number"
                value={activeMedication.quantityInStock}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity per Dose"
                name="quantityPerDose"
                type="number"
                value={activeMedication.quantityPerDose}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
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
                label="Doses per Day"
                name="dosesPerDay"
                type="number"
                value={activeMedication.dosesPerDay}
                onChange={handleChange}
                required
                inputProps={{ min: 1, step: 1 }}
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
                label="Frequency"
                name="frequency"
                value={activeMedication.frequency}
                onChange={handleChange}
                required
                placeholder="e.g., Once daily, Twice daily, Every 4 hours"
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
                label="Start Date"
                name="startDate"
                type="date"
                value={activeMedication.startDate}
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
                label="End Date"
                name="endDate"
                type="date"
                value={activeMedication.endDate}
                onChange={handleChange}
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prescribed By"
                name="prescribedBy"
                value={activeMedication.prescribedBy}
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
                label="Notes"
                name="notes"
                value={activeMedication.notes}
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

            {id && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
                      Status:
                    </Typography>
                    <Chip
                      label={activeMedication.isActive ? "Active" : "Inactive"}
                      color={activeMedication.isActive ? "success" : "error"}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Button
                    type="button"
                    onClick={() => handleActivationToggle(!activeMedication.isActive)}
                    sx={{
                      background: activeMedication.isActive 
                        ? 'linear-gradient(90deg, #d32f2f 0%, #c62828 100%)'
                        : 'linear-gradient(90deg, #2e7d32 0%, #1b5e20 100%)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: activeMedication.isActive 
                          ? 'linear-gradient(90deg, #c62828 0%, #d32f2f 100%)'
                          : 'linear-gradient(90deg, #1b5e20 0%, #2e7d32 100%)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
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
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Updating..."
                      : activeMedication.isActive
                      ? "Deactivate Medication"
                      : "Activate Medication"}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              type="button"
              onClick={() => navigate("/admin/active-medications")}
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
                ? "Update Active Medication"
                : "Add Active Medication"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminActiveMedicationForm;
