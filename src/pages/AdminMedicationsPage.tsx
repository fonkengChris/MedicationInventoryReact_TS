import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardActions, Divider, useMediaQuery } from '@mui/material';

const AdminMedicationsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        const response = await medicationApi.getAll();
        if (Array.isArray(response.data)) {
          setMedications(response.data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch medications"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedications();
  }, []);

  if (isLoading) {
    return <div>Loading medications...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      await medicationApi.delete(id);
      setMedications(medications.filter((med) => med._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting medication:", error);
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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: "space-between", 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
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
          Medications Management
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/admin/medications/new"
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
            transition: 'all 0.2s ease'
          }}
        >
          Add Medication
        </Button>
      </Box>

      {medications.length === 0 ? (
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
            No medications found.
          </Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {medications.map((medication) => (
            <Card
              key={medication._id}
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
                  borderColor: '#1976d2'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)',
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
                  {medication.name}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                    Dosage:
                  </Typography>
                  <Chip
                    label={medication.dosage}
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>
                  <span style={{ fontWeight: 600 }}>Manufacturer:</span> {medication.manufacturer || '-'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0, gap: 1 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/admin/medications/edit/${medication._id}`}
                  sx={{
                    fontWeight: 'bold',
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 1,
                    textTransform: 'none',
                    background: 'linear-gradient(90deg, #1976d2 60%, #1565c0 100%)',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)',
                      boxShadow: 2,
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedMedicationId(medication._id!);
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
                  startIcon={<DeleteIcon />}
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
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '1rem' }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '1rem' }}>
                  Dosage
                </TableCell>
                <TableCell sx={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '1rem' }}>
                  Manufacturer
                </TableCell>
                <TableCell sx={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '1rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medications.map((medication) => (
                <TableRow 
                  key={medication._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transition: 'background-color 0.2s ease'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#424242', fontWeight: 500 }}>
                    {medication.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={medication.dosage}
                      size="small"
                      sx={{
                        backgroundColor: '#e8f5e8',
                        color: '#2e7d32',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#666666' }}>
                    {medication.manufacturer || "-"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Button
                        component={Link}
                        to={`/admin/medications/edit/${medication._id}`}
                        sx={{
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0'
                          }
                        }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedMedicationId(medication._id!);
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
                        <DeleteIcon />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              Delete Medication
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666666' }}>
              Are you sure you want to delete this medication? This action cannot be undone.
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
                onClick={() => handleDelete(selectedMedicationId)}
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

export default AdminMedicationsPage;
