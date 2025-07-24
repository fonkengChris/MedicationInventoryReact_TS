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
      setGeneratedSummary(response.data);
      const generatedStartDate = new Date(response.data.startDate);
      const generatedEndDate = new Date(response.data.endDate);
      setStartDate(generatedStartDate);
      setEndDate(generatedEndDate);
    },
  });

  const {
    data: summary,
    isLoading,
    error,
  } = useQuery<WeeklySummary>({
    queryKey: [
      "weeklySummaries",
      startDate?.toISOString(),
      endDate?.toISOString(),
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
      return response.data;
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Weekly Summaries
      </Typography>

      <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !startDate || !endDate}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {generateMutation.isPending ? (
            <CircularProgress size={24} />
          ) : (
            "Generate Summary"
          )}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading summaries: {(error as Error).message}
        </Alert>
      )}

      {isLoading ? (
        <CircularProgress />
      ) : generatedSummary || summary ? (
        <Box sx={{ mt: 4 }}>
          {(generatedSummary || summary)?.summaries.map((med) => (
            <Paper key={med._id} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
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
                <Paper key={med._id} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {med.medication.medicationName} (
                    {med.medication.quantityPerDose} per dose,{" "}
                    {med.medication.dosesPerDay} doses/day)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Service User: {med.serviceUser.name} (NHS:{" "}
                    {med.serviceUser.nhsNumber})
                    <br />
                    Initial Stock: {med.stockLevels.initial}
                    <br />
                    Final Stock: {med.stockLevels.final}
                    <br />
                    Days Remaining: {med.stockLevels.daysRemaining}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Stock Changes:</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Total Increase:{" "}
                          {med.cumulativeChanges.fromPharmacy +
                            med.cumulativeChanges.returningHome}
                          <br />
                          From Pharmacy: {med.cumulativeChanges.fromPharmacy}
                          <br />
                          Returning Home: {med.cumulativeChanges.returningHome}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Total Decrease:{" "}
                          {med.cumulativeChanges.quantityAdministered +
                            med.cumulativeChanges.leavingHome}
                          <br />
                          Administered:{" "}
                          {med.cumulativeChanges.quantityAdministered}
                          <br />
                          Leaving Home: {med.cumulativeChanges.leavingHome}
                          <br />
                          Returned to Pharmacy:{" "}
                          {med.cumulativeChanges.returnedToPharmacy}
                          <br />
                          Lost: {med.cumulativeChanges.lost}
                          <br />
                          Damaged: {med.cumulativeChanges.damaged}
                          <br />
                          Other: {med.cumulativeChanges.other}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {med.changes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Recent Changes:
                      </Typography>
                      {med.changes.map((change) => (
                        <Box key={change._id} sx={{ mb: 1 }}>
                          <Typography variant="caption">
                            {formatDate(change.timestamp)} - {change.type}
                            <br />
                            {change.note} (by {change.updatedBy.username})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownload(
                        summary?._id || generatedSummary?._id || ""
                      )
                    }
                  >
                    Download PDF
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No summaries found for the selected date range.
        </Typography>
      )}
    </Box>
  );
};

export default AdminWeeklySummariesPage;
