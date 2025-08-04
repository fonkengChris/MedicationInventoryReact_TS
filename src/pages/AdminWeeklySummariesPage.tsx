import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { weeklySummariesApi } from "../services/api";
import { WeeklySummary } from "../types/models";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DownloadIcon from "@mui/icons-material/Download";

const AdminWeeklySummariesPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const [generatedSummary, setGeneratedSummary] =
    useState<WeeklySummary | null>(null);

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }
      return weeklySummariesApi.generate({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
    },
    onSuccess: async (response) => {
      console.log("Generation response:", response);
      setGeneratedSummary(response.data.data);
      // Convert string dates to Date objects safely
      const generatedStartDate = new Date(response.data.data.startDate);
      const generatedEndDate = new Date(response.data.data.endDate);
      
      // Validate that the dates are valid before setting them
      if (!isNaN(generatedStartDate.getTime()) && !isNaN(generatedEndDate.getTime())) {
        setStartDate(generatedStartDate);
        setEndDate(generatedEndDate);
      } else {
        console.error("Invalid dates received from API:", response.data.data.startDate, response.data.data.endDate);
      }
    },
  });

  const {
    data: summary,
    isLoading,
    error,
  } = useQuery<WeeklySummary>({
    queryKey: [
      "weeklySummaries",
      startDate instanceof Date ? startDate.toISOString() : startDate,
      endDate instanceof Date ? endDate.toISOString() : endDate,
    ],
    queryFn: async () => {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }
      if (generatedSummary) {
        return generatedSummary;
      }
      const response = await weeklySummariesApi.getAll({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
      return response.data.data;
    },
    enabled: !!startDate && !!endDate,
  });

  console.log("Current summaries:", summary);

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      setStartDate(weekStart);
      setEndDate(weekEnd);
    }
    generateMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = async (summaryId: string) => {
    try {
      const response = await weeklySummariesApi.downloadPdf(summaryId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weekly-summary-${summaryId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
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
          Weekly Summaries
        </Typography>
      </Box>

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
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    }
                  }
                } 
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    }
                  }
                } 
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !startDate || !endDate}
            sx={{
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
          >
            {generateMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Generate Summary"
            )}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: '8px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ffcdd2'
          }}
        >
          Error loading summaries: {(error as Error).message}
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <CircularProgress size={48} sx={{ color: '#1976d2' }} />
        </Box>
      ) : (() => {
        const currentSummary = generatedSummary || summary;
        return currentSummary?.summaries && currentSummary.summaries.length > 0;
      })() ? (
        <Box sx={{ mt: 4 }}>
          {(generatedSummary || summary)?.summaries?.map((med) => (
            <Card
              key={med._id}
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                mb: 3,
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  borderColor: '#1976d2'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                  zIndex: 1
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Weekly Summary:{" "}
                  {formatDate(
                    summary?.startDate || generatedSummary?.startDate || ""
                  )}{" "}
                  -{" "}
                  {formatDate(
                    summary?.endDate || generatedSummary?.endDate || ""
                  )}
                </Typography>

                <Stack spacing={3}>
                  <Card
                    sx={{
                      background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1, 
                          color: '#1a1a1a',
                          fontWeight: 'bold'
                        }}
                      >
                        {med.medication.medicationName} (
                        {med.medication.quantityPerDose} per dose,{" "}
                        {med.medication.dosesPerDay} doses/day)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                        Service User: {med.serviceUser.name} (NHS:{" "}
                        {med.serviceUser.nhsNumber})
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#e8f5e8', 
                            borderRadius: '8px',
                            border: '1px solid #c8e6c9'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                              Stock Levels
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              Initial: {med.stockLevels.initial}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              Final: {med.stockLevels.final}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              Days Remaining: {med.stockLevels.daysRemaining}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: '8px',
                            border: '1px solid #bbdefb'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                              Stock Changes
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              Total Increase: {med.cumulativeChanges.fromPharmacy + med.cumulativeChanges.returningHome}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              Total Decrease: {med.cumulativeChanges.quantityAdministered + med.cumulativeChanges.leavingHome}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: '#fff3e0', 
                        borderRadius: '8px',
                        border: '1px solid #ffcc02'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00', mb: 1 }}>
                          Detailed Changes
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              From Pharmacy: {med.cumulativeChanges.fromPharmacy}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              Returning Home: {med.cumulativeChanges.returningHome}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              Administered: {med.cumulativeChanges.quantityAdministered}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              Leaving Home: {med.cumulativeChanges.leavingHome}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              Returned to Pharmacy: {med.cumulativeChanges.returnedToPharmacy}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                              Lost/Damaged: {med.cumulativeChanges.lost + med.cumulativeChanges.damaged}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      {med.changes.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                            Recent Changes:
                          </Typography>
                          <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {med.changes.map((change) => (
                              <Box 
                                key={change._id} 
                                sx={{ 
                                  mb: 1, 
                                  p: 1, 
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '4px',
                                  border: '1px solid #e0e0e0'
                                }}
                              >
                                <Typography variant="caption" sx={{ color: '#666666' }}>
                                  {formatDate(change.timestamp)} - {change.type}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666666', display: 'block' }}>
                                  {change.note} (by {change.updatedBy.username})
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          summary?._id || generatedSummary?._id || ""
                        )
                      }
                      sx={{
                        background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #66bb6a 0%, #4caf50 100%)',
                          boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Download PDF
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
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
            No summaries found for the selected date range.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminWeeklySummariesPage;
