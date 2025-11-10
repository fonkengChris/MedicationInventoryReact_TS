import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { marApi, serviceUserApi } from "../services/api";
import { MarData, ServiceUser } from "../types/models";

const formatDate = (date: Date | null) => {
  if (!date) return "";
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().split("T")[0];
};

const AdminMarPage: React.FC = () => {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [marData, setMarData] = useState<MarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const response = await serviceUserApi.getAll();
        setServiceUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch service users", err);
        setError("Failed to load service users");
      }
    };

    fetchServiceUsers();
  }, []);

  const handleLoad = async () => {
    if (!selectedServiceUser || !startDate || !endDate) {
      setError("Select a service user and date range");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await marApi.getData(selectedServiceUser, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
      setMarData(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch MAR data", err);
      setError(
        err?.response?.data?.message || "Failed to fetch MAR data"
      );
      setMarData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedServiceUser || !startDate || !endDate) {
      setError("Select a service user and date range");
      return;
    }

    try {
      const response = await marApi.downloadPdf(selectedServiceUser, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mar-${selectedServiceUser}-${formatDate(startDate)}-${formatDate(
        endDate
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to download MAR PDF", err);
      setError(err?.response?.data?.message || "Failed to download MAR PDF");
    }
  };

  const medicationList = useMemo(() => marData?.medications || [], [marData]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          p: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.3rem", sm: "1.6rem" },
            color: "#1a1a1a",
            fontWeight: "bold",
          }}
        >
          MAR Chart Generation
        </Typography>
        <Button variant="outlined" onClick={handleDownload} disabled={!marData}>
          Download PDF
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="service-user-select-label">Service User</InputLabel>
              <Select
                labelId="service-user-select-label"
                value={selectedServiceUser}
                label="Service User"
                onChange={(event) => setSelectedServiceUser(event.target.value)}
              >
                {serviceUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mt: 3, alignItems: "center" }}>
          <Button
            variant="contained"
            onClick={handleLoad}
            disabled={loading || !selectedServiceUser || !startDate || !endDate}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Load MAR"}
          </Button>
          <TextField
            label="Threshold Before (mins)"
            value={marData?.settings.thresholdBefore ?? 0}
            InputProps={{ readOnly: true }}
            size="small"
          />
          <TextField
            label="Threshold After (mins)"
            value={marData?.settings.thresholdAfter ?? 0}
            InputProps={{ readOnly: true }}
            size="small"
          />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {marData && medicationList.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography>No active medications found for this period.</Typography>
        </Paper>
      )}

      {marData &&
        medicationList.map((medication) => (
          <Card
            key={medication._id}
            sx={{
              mb: 3,
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {medication.medicationName}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {medication.dosage.amount} {medication.dosage.unit} |{" "}
                {medication.quantityPerDose} per dose | {medication.dosesPerDay} doses/day
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {marData.dateRange.map((date) => {
                  const windows =
                    marData.windows[medication._id]?.[date] ?? [];
                  const administrations =
                    marData.administrations[medication._id]?.[date] ?? [];

                  return (
                    <Grid item xs={12} md={6} lg={4} key={`${medication._id}-${date}`}>
                      <Paper sx={{ p: 2, borderRadius: "12px" }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {new Date(date).toLocaleDateString()}
                        </Typography>

                        {windows.length === 0 ? (
                          <Typography variant="body2" color="textSecondary">
                            No scheduled doses.
                          </Typography>
                        ) : (
                          windows.map((window) => {
                            const administered = administrations.find(
                              (record) =>
                                record.scheduledTime === window.scheduledTime
                            );

                            return (
                              <Box
                                key={`${window.scheduledTime}-${window.windowStart}`}
                                sx={{
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                  p: 1.5,
                                  mb: 1,
                                  backgroundColor: administered
                                    ? administered.status === "on-time"
                                      ? "#e8f5e9"
                                      : "#fff8e1"
                                    : "#fafafa",
                                }}
                              >
                                <Typography variant="body2">
                                  Scheduled: {window.scheduledTime}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Window:{" "}
                                  {new Date(window.windowStart).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(window.windowEnd).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>

                                {administered ? (
                                  <>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      Administered:{" "}
                                      {new Date(
                                        administered.administeredAt
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Status: {administered.status}
                                    </Typography>
                                    {administered.notes && (
                                      <Typography variant="caption" display="block">
                                        Notes: {administered.notes}
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <Typography variant="caption" color="textSecondary">
                                    No administration recorded.
                                  </Typography>
                                )}
                              </Box>
                            );
                          })
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
};

export default AdminMarPage;

