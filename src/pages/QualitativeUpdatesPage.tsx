import React, { useState, useEffect } from "react";
import {
  MedicationUpdate,
  DateRangeFilter,
  User,
  ActiveMedication,
} from "../types/models";
import {
  medicationUpdateApi,
  activeMedicationApi,
  userApi,
} from "../services/api";
import { FiTrash2 } from "react-icons/fi";
import {
  Paper,
  TableContainer,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardActions, Divider, useMediaQuery } from '@mui/material';

const QualitativeUpdatesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [updates, setUpdates] = useState<MedicationUpdate[]>([]);
  const [activeMedications, setActiveMedications] = useState<
    ActiveMedication[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    medicationId?: string;
    userId?: string;
    dateRange?: DateRangeFilter;
  }>({});
  const [dateInputs, setDateInputs] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>("");

  // Fetch medications and users for dropdowns
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [medsResponse, usersResponse] = await Promise.all([
          activeMedicationApi.getAll(),
          userApi.getAll(),
        ]);
        setActiveMedications(medsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      if (filter.medicationId) params.medicationId = filter.medicationId;
      if (filter.userId) params.userId = filter.userId;
      if (filter.dateRange) {
        params.startDate = filter.dateRange.startDate;
        params.endDate = filter.dateRange.endDate;
      }
      
      const response = await medicationUpdateApi.getQualitative(params);
      setUpdates(response.data);
    } catch (error) {
      console.error("Error fetching updates:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch updates"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [filter]);

  const validateDateRange = (startDate: string, endDate: string): string | null => {
    if (!startDate && !endDate) {
      return null;
    }
    
    if (!startDate || !endDate) {
      return "Both start and end dates are required";
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date format";
    }
    
    if (start > end) {
      return "Start date must be before or equal to end date";
    }
    
    return null;
  };

  const handleDateRangeFilter = () => {
    const validationError = validateDateRange(dateInputs.startDate, dateInputs.endDate);
    setDateError(validationError);
    
    if (validationError) {
      return;
    }

    setFilter(prevFilter => ({
      ...prevFilter,
      dateRange: dateInputs.startDate && dateInputs.endDate ? {
        startDate: dateInputs.startDate,
        endDate: dateInputs.endDate,
      } : undefined,
    }));
  };

  const handleClearDateFilter = () => {
    setDateInputs({ startDate: "", endDate: "" });
    setDateError(null);
    setFilter(prevFilter => ({
      ...prevFilter,
      dateRange: undefined,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await medicationUpdateApi.delete(id);
      setUpdates(updates.filter((update) => update._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update");
    }
  };

  const getUpdateTypeColor = (updateType: string) => {
    switch (updateType) {
      case "New Medication":
        return { bg: '#e8f5e8', color: '#2e7d32' };
      case "Name Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Dosage Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Frequency Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Administration Times Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Prescriber Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Service User Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Instructions Change":
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case "Activated":
        return { bg: '#e8f5e8', color: '#2e7d32' };
      case "Deactivated":
        return { bg: '#ffebee', color: '#c62828' };
      case "Deleted":
        return { bg: '#ffebee', color: '#c62828' };
      default:
        return { bg: '#f3e5f5', color: '#7b1fa2' };
    }
  };

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) return "None";
    if (typeof value === "object") {
      if (value.amount && value.unit) return `${value.amount} ${value.unit}`;
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (isLoading) return <div>Loading updates...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
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
            color: '#7b1fa2',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Qualitative Updates (Other Changes)
        </Typography>
      </Box>

      {/* Filters */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#666666' }}>All Medications</InputLabel>
            <Select
              value={filter.medicationId || ""}
              onChange={(e) =>
                setFilter(prev => ({ 
                  ...prev, 
                  medicationId: e.target.value || undefined 
                }))
              }
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7b1fa2'
                }
              }}
            >
              <MenuItem value="">All Medications</MenuItem>
              <MenuItem value="null">Unknown/Deleted Medications</MenuItem>
              {activeMedications.map((med) => (
                <MenuItem key={med._id} value={med._id}>
                  {med.medicationName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#666666' }}>All Users</InputLabel>
            <Select
              value={filter.userId || ""}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                userId: e.target.value || undefined 
              }))}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7b1fa2'
                }
              }}
            >
              <MenuItem value="">All Users</MenuItem>
              <MenuItem value="null">Unknown/Deleted Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user?.username || user?.email || "Unknown User"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Start Date"
            value={dateInputs.startDate}
            onChange={(e) => setDateInputs(prev => ({ ...prev, startDate: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#7b1fa2'
              }
            }}
          />

          <TextField
            type="date"
            label="End Date"
            value={dateInputs.endDate}
            onChange={(e) => setDateInputs(prev => ({ ...prev, endDate: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#7b1fa2'
              }
            }}
          />
        </Box>

        {dateError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {dateError}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleDateRangeFilter}
            disabled={!dateInputs.startDate || !dateInputs.endDate}
            sx={{
              background: 'linear-gradient(90deg, #7b1fa2 0%, #6a1b9a 100%)',
              color: '#ffffff',
              fontWeight: 'bold',
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(123, 31, 162, 0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #6a1b9a 0%, #7b1fa2 100%)',
                boxShadow: '0 6px 20px rgba(123, 31, 162, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#999999',
                boxShadow: 'none',
                transform: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Filter by Date
          </Button>

          {(dateInputs.startDate || dateInputs.endDate) && (
            <Button
              variant="outlined"
              onClick={handleClearDateFilter}
              sx={{
                borderColor: '#e0e0e0',
                color: '#666666',
                fontWeight: 'bold',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#7b1fa2',
                  color: '#7b1fa2',
                  backgroundColor: '#f5f5f5'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Clear Date Filter
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={() => {
              setFilter({});
              setDateInputs({ startDate: "", endDate: "" });
              setDateError(null);
            }}
            sx={{
              borderColor: '#e0e0e0',
              color: '#666666',
              fontWeight: 'bold',
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#7b1fa2',
                color: '#7b1fa2',
                backgroundColor: '#f5f5f5'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Box>

      {/* Updates Table */}
      {updates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Typography variant="h6" sx={{ color: '#666666', fontWeight: 500 }}>
            No qualitative updates found.
          </Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {updates.map((update) => (
            <Card
              key={update._id}
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  borderColor: '#7b1fa2'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: update.updateType === 'New Medication' ? 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)' :
                    update.updateType === 'Activated' ? 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)' :
                    update.updateType === 'Deactivated' ? 'linear-gradient(90deg, #e53935 0%, #ef5350 100%)' :
                    'linear-gradient(90deg, #7e57c2 0%, #9575cd 100%)',
                  zIndex: 1
                }
              }}
            >
              <CardContent sx={{ pb: 1, position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1, 
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  {update.medication.medicationName}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>
                  <span style={{ fontWeight: 600 }}>User:</span> {update.updatedBy?.username || update.updatedBy?.email || 'Unknown User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                    Type:
                  </Typography>
                  <Chip
                    label={update.updateType}
                    size="small"
                    sx={{
                      backgroundColor: getUpdateTypeColor(update.updateType).bg,
                      color: getUpdateTypeColor(update.updateType).color,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#1a1a1a' }}>Changes:</Typography>
                <Box sx={{
                  background: '#f5f7fa',
                  borderRadius: 2,
                  padding: 2,
                  marginBottom: 1,
                  fontSize: '0.875rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  {update.changes && typeof update.changes === 'object'
                    ? Object.entries(update.changes).map(
                        ([field, change]) => (
                          <Box key={field} sx={{ marginBottom: 1 }}>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: '#424242' }}>
                              {field.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>{' '}
                            <span style={{ color: '#e53935', fontWeight: 500 }}>
                              {formatChangeValue(change.oldValue)}
                            </span>
                            {' → '}
                            <span style={{ color: '#43a047', fontWeight: 500 }}>
                              {formatChangeValue(change.newValue)}
                            </span>
                          </Box>
                        )
                      )
                    : <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>{String(update.changes)}</Typography>}
                </Box>
                {update.notes && (
                  <Box sx={{
                    background: '#f3e5f5',
                    borderRadius: 2,
                    padding: 1.5,
                    marginBottom: 1,
                    borderLeft: '4px solid #7b1fa2'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7b1fa2', mb: 0.5 }}>
                      Note:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#424242' }}>
                      {update.notes}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>
                  <span style={{ fontWeight: 600 }}>Timestamp:</span> {new Date(update.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedUpdateId(update._id);
                    setIsDeleteModalOpen(true);
                  }}
                  sx={{
                    fontWeight: 'bold',
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    borderWidth: 2,
                    textTransform: 'none',
                    borderColor: '#e53935',
                    color: '#e53935',
                    '&:hover': {
                      background: '#ffebee',
                      borderColor: '#b71c1c',
                      color: '#b71c1c',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  startIcon={<FiTrash2 />}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            overflowX: 'auto', 
            '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } },
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                '& th': {
                  backgroundColor: '#f8f9fa',
                  color: '#1a1a1a',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: '12px 16px',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0'
                },
                '& td': {
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0'
                },
                '& tr': {
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transition: 'background-color 0.2s ease'
                  }
                }
              }}
            >
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Changes</th>
                  <th>Note</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((update) => (
                  <tr key={update._id}>
                    <td style={{ color: '#424242', fontWeight: 500 }}>
                      {update.medication.medicationName}
                    </td>
                    <td style={{ color: '#666666' }}>
                      {update.updatedBy?.username ||
                        update.updatedBy?.email ||
                        "Unknown User"}
                    </td>
                    <td>
                      <Chip
                        label={update.updateType}
                        size="small"
                        sx={{
                          backgroundColor: getUpdateTypeColor(update.updateType).bg,
                          color: getUpdateTypeColor(update.updateType).color,
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </td>
                    <td>
                      <Box sx={{ maxWidth: '200px' }}>
                        {update.changes &&
                          Object.entries(update.changes).map(
                            ([field, change]) => (
                              <Box key={field} sx={{ mb: 0.5 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#424242' }}>
                                  {field.replace(/([A-Z])/g, " $1").trim()}:
                                </span>{' '}
                                <span style={{ color: '#e53935', fontSize: '0.75rem' }}>
                                  {formatChangeValue(change.oldValue)}
                                </span>
                                {" → "}
                                <span style={{ color: '#43a047', fontSize: '0.75rem' }}>
                                  {formatChangeValue(change.newValue)}
                                </span>
                              </Box>
                            )
                          )}
                      </Box>
                    </td>
                    <td style={{ color: '#666666', fontSize: '0.875rem', maxWidth: '250px' }}>
                      {update.notes ? (
                        <Box sx={{
                          background: '#f3e5f5',
                          padding: 1,
                          borderRadius: 1,
                          borderLeft: '3px solid #7b1fa2'
                        }}>
                          {update.notes}
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td style={{ color: '#666666', fontSize: '0.875rem' }}>
                      {new Date(update.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <Button
                        onClick={() => {
                          setSelectedUpdateId(update._id);
                          setIsDeleteModalOpen(true);
                        }}
                        sx={{
                          color: '#e53935',
                          '&:hover': {
                            backgroundColor: '#ffebee',
                            color: '#b71c1c'
                          }
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        </TableContainer>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              p: 4,
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1a1a1a', fontWeight: 'bold' }}>
              Delete Update
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666666' }}>
              Are you sure you want to delete this update? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(selectedUpdateId)}
                variant="contained"
                sx={{
                  backgroundColor: '#e53935',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#b71c1c'
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QualitativeUpdatesPage;

