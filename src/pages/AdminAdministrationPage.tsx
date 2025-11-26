import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { serviceUserApi, administrationApi } from "../services/api";
import { ActiveMedication, ServiceUser } from "../types/models";

interface AvailabilityMedication {
  medication: ActiveMedication;
  availability: "available" | "upcoming" | "unavailable" | "no-schedule";
  currentWindow: any;
  nextWindow: any;
  lastWindow: any;
}

const AdminAdministrationPage: React.FC = () => {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilityMedication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantityToDispense, setQuantityToDispense] = useState<number>(1);
  const [administrationOutcome, setAdministrationOutcome] = useState<string>("");
  const [administrationNotes, setAdministrationNotes] = useState<string>("");
  const [selectedMedication, setSelectedMedication] =
    useState<AvailabilityMedication | null>(null);
  const determineAdministrationMode = useCallback(
    (medication: AvailabilityMedication["medication"]) => {
      const instructionsSource = [
        medication.instructions,
        medication.notes,
        medication.frequency,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (instructionsSource.includes("inject")) {
        return "via injection";
      }
      if (
        instructionsSource.includes("topical") ||
        instructionsSource.includes("apply") ||
        instructionsSource.includes("cream") ||
        instructionsSource.includes("ointment") ||
        instructionsSource.includes("patch")
      ) {
        return "topically";
      }
      if (
        instructionsSource.includes("inhal") ||
        instructionsSource.includes("nebuli")
      ) {
        return "via inhalation";
      }
      if (instructionsSource.includes("sublingual")) {
        return "sublingually";
      }
      if (
        instructionsSource.includes("nasal") ||
        instructionsSource.includes("spray")
      ) {
        return "nasally";
      }
      if (
        instructionsSource.includes("buccal") ||
        instructionsSource.includes("cheek")
      ) {
        return "buccally";
      }

      return "orally";
    },
    []
  );

  const buildDefaultAdministrationNote = useCallback(
    (medication: AvailabilityMedication, quantity: number) => {
      const serviceUserName =
        serviceUsers.find((user) => user._id === selectedServiceUser)?.name ||
        "the service user";
      const dosageText = medication.medication.dosage
        ? `${medication.medication.dosage.amount} ${medication.medication.dosage.unit}`
        : "";
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const administrationMode = determineAdministrationMode(
        medication.medication
      );

      const dosageSegment = dosageText
        ? ` ${medication.medication.medicationName} ${dosageText}`
        : ` ${medication.medication.medicationName}`;

      return `At ${currentTime}, ${serviceUserName} complied with his${dosageSegment}, following prompting from staff. He took ${quantity} ${administrationMode}.`;
    },
    [determineAdministrationMode, selectedServiceUser, serviceUsers]
  );

  const [initialMedicationId, setInitialMedicationId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const response = await serviceUserApi.getAll();
        setServiceUsers(response.data);
      } catch (err) {
        console.error("Failed to load service users", err);
        setError("Failed to load service users");
      }
    };

    fetchServiceUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceUserId = params.get("serviceUser");
    const medicationId = params.get("medication");

    if (serviceUserId && serviceUserId !== selectedServiceUser) {
      setSelectedServiceUser(serviceUserId);
    }

    if (medicationId) {
      setInitialMedicationId(medicationId);
    }
  }, [location.search, selectedServiceUser]);

  const fetchAvailability = async () => {
    if (!selectedServiceUser) {
      setError("Select a service user");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await administrationApi.getAvailability(selectedServiceUser);
      setAvailability(response.data.data.medications);
    } catch (err: any) {
      console.error("Failed to load availability", err);
      setError(err?.response?.data?.message || "Failed to load availability");
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedServiceUser) {
      fetchAvailability();
    }
  }, [selectedServiceUser]);

  useEffect(() => {
    if (!initialMedicationId || !availability.length) {
      return;
    }

    const matchedMedication = availability.find(
      (item) => item.medication._id === initialMedicationId
    );

    if (matchedMedication) {
      setSelectedMedication(matchedMedication);
      setQuantityToDispense(matchedMedication.medication.quantityPerDose ?? 1);
      setAdministrationNotes("");
      setInitialMedicationId(null);
    }
  }, [availability, initialMedicationId]);

  const handleOpenDispense = (item: AvailabilityMedication) => {
    setSelectedMedication(item);
    setQuantityToDispense(item.medication.quantityPerDose ?? 1);
    setAdministrationNotes("");
    setAdministrationOutcome(""); // Reset outcome when opening dialog
  };

  const handleDispense = async () => {
    if (!selectedMedication || !selectedServiceUser) {
      return;
    }

    try {
      const trimmedNotes = administrationNotes.trim();
      const noteToSubmit =
        trimmedNotes.length > 0
          ? trimmedNotes
          : buildDefaultAdministrationNote(
              selectedMedication,
              quantityToDispense
            );

      await administrationApi.dispense(selectedServiceUser, {
        medicationId: selectedMedication.medication._id,
        quantity: quantityToDispense,
        notes: noteToSubmit,
        outcome: administrationOutcome || undefined, // Only send if selected
      });
      setSuccessMessage("Administration recorded successfully");
      setSelectedMedication(null);
      setAdministrationNotes("");
      setQuantityToDispense(1);
      setAdministrationOutcome("");
      fetchAvailability();
    } catch (err: any) {
      console.error("Failed to record administration", err);
      setError(err?.response?.data?.message || "Failed to record administration");
    }
  };

  const renderAvailabilityChip = (availability: AvailabilityMedication["availability"]) => {
    switch (availability) {
      case "available":
        return <Chip label="Available" color="success" />;
      case "upcoming":
        return <Chip label="Upcoming" color="info" />;
      case "unavailable":
        return <Chip label="Unavailable" color="default" />;
      case "no-schedule":
      default:
        return <Chip label="No Schedule" color="warning" />;
    }
  };

  const sortedAvailability = useMemo(() => {
    const priority = {
      available: 0,
      upcoming: 1,
      "no-schedule": 2,
      unavailable: 3,
    };
    return [...availability].sort(
      (a, b) => priority[a.availability] - priority[b.availability]
    );
  }, [availability]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Medication Administration
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="service-user-select">Service User</InputLabel>
            <Select
              labelId="service-user-select"
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
          <Button
            variant="contained"
            onClick={fetchAvailability}
            disabled={!selectedServiceUser || loading}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {sortedAvailability.map((item) => (
            <Paper
              key={item.medication._id}
              sx={{
                p: 3,
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h6">{item.medication.medicationName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.medication.dosage.amount} {item.medication.dosage.unit} |{" "}
                    {item.medication.quantityPerDose} per dose |{" "}
                    {item.medication.dosesPerDay} times per day
                  </Typography>
                  {item.medication.administrationTimes?.length ? (
                    <Typography variant="body2">
                      Scheduled: {item.medication.administrationTimes.join(", ")}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No administration times defined.
                    </Typography>
                  )}
                </Box>
                {renderAvailabilityChip(item.availability)}
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {item.currentWindow && (
                  <TextField
                    label="Current Window"
                    value={`${new Date(
                      item.currentWindow.windowStart
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(item.currentWindow.windowEnd).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                )}
                {item.nextWindow && (
                  <TextField
                    label="Next Window"
                    value={`${new Date(item.nextWindow.windowStart).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Stack>

              <Box>
                <Button
                  variant="contained"
                  disabled={item.availability !== "available"}
                  onClick={() => handleOpenDispense(item)}
                >
                  Dispense
                </Button>
              </Box>
            </Paper>
          ))}
          {!availability.length && (
            <Paper sx={{ p: 3 }}>
              <Typography>No medications found.</Typography>
            </Paper>
          )}
        </Stack>
      )}

      <Dialog
        open={!!selectedMedication}
        onClose={() => setSelectedMedication(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Record Administration</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {selectedMedication?.medication.medicationName}
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={quantityToDispense}
            onChange={(event) => setQuantityToDispense(Number(event.target.value))}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="outcome-select-label">Outcome (MAR Code)</InputLabel>
            <Select
              labelId="outcome-select-label"
              label="Outcome (MAR Code)"
              value={administrationOutcome}
              onChange={(event) => setAdministrationOutcome(event.target.value)}
            >
              <MenuItem value="">
                <em>Administered (default - timing based)</em>
              </MenuItem>
              <MenuItem value="refused">R - Refused</MenuItem>
              <MenuItem value="nausea_vomiting">N - Nausea/Vomiting</MenuItem>
              <MenuItem value="hospital">H - Hospital</MenuItem>
              <MenuItem value="on_leave">L - On Leave</MenuItem>
              <MenuItem value="destroyed">D - Destroyed</MenuItem>
              <MenuItem value="sleeping">S - Sleeping</MenuItem>
              <MenuItem value="pulse_abnormal">P - Pulse Abnormal</MenuItem>
              <MenuItem value="not_required">NR - Not Required</MenuItem>
              <MenuItem value="missed">Missed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="other">O - Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            multiline
            minRows={3}
            fullWidth
            value={administrationNotes}
            onChange={(event) => setAdministrationNotes(event.target.value)}
            placeholder={
              administrationOutcome
                ? "Add additional details about this outcome..."
                : "Add notes about the administration..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMedication(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleDispense}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAdministrationPage;

