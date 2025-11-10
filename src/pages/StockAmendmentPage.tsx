import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activeMedicationApi, serviceUserApi } from "../services/api";
import { ActiveMedication, ServiceUser } from "../types/models";

type AdjustmentType = "add" | "remove";

const addReasonOptions: string[] = [
  "Stock received from pharmacy",
  "Medication returned home",
  "Stock count correction",
  "Other",
];

const removeReasonOptions: string[] = [
  "Medication administered",
  "Medication leaving the home",
  "Medication returned to pharmacy",
  "Medication wasted",
  "Stock count correction",
  "Other",
];

interface UpdatePayload {
  id: string;
  payload: Partial<ActiveMedication>;
}

const StockAmendmentPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [selectedServiceUser, setSelectedServiceUser] = useState<string>("");
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("add");
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>(addReasonOptions[0]);
  const [customNote, setCustomNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: serviceUsers = [], isLoading: isLoadingServiceUsers } = useQuery({
    queryKey: ["serviceUsers"],
    queryFn: () => serviceUserApi.getAll().then((res) => res.data),
  });

  const { data: activeMedications = [], isLoading: isLoadingMedications } =
    useQuery({
      queryKey: ["activeMedications"],
      queryFn: () => activeMedicationApi.getAll().then((res) => res.data),
    });

  const reasonOptions = useMemo(
    () => (adjustmentType === "add" ? addReasonOptions : removeReasonOptions),
    [adjustmentType]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceUserId = params.get("serviceUser") ?? "";
    const medicationId = params.get("medication") ?? "";

    if (serviceUserId) {
      setSelectedServiceUser(serviceUserId);
    }
    if (medicationId) {
      setSelectedMedicationId(medicationId);
    }
  }, [location.search]);

  useEffect(() => {
    if (!selectedServiceUser || !serviceUsers.length) {
      return;
    }

    const isValidServiceUser = serviceUsers.some(
      (user) => user._id === selectedServiceUser
    );

    if (!isValidServiceUser) {
      setSelectedServiceUser("");
      setSelectedMedicationId("");
    }
  }, [serviceUsers, selectedServiceUser]);

  useEffect(() => {
    if (reasonOptions.length === 0) {
      return;
    }

    setNote(reasonOptions[0]);
    setCustomNote("");
  }, [reasonOptions]);

  const filteredMedications = useMemo(() => {
    if (!selectedServiceUser) return [];

    return activeMedications.filter((medication) => {
      if (!medication || !medication.serviceUser) {
        return false;
      }

      const serviceUserId =
        typeof medication.serviceUser === "string"
          ? medication.serviceUser
          : (medication.serviceUser as any)?._id;

      return serviceUserId === selectedServiceUser && medication.isActive;
    });
  }, [activeMedications, selectedServiceUser]);

  useEffect(() => {
    if (
      selectedMedicationId &&
      !filteredMedications.some((medication) => medication._id === selectedMedicationId)
    ) {
      setSelectedMedicationId("");
    }
  }, [filteredMedications, selectedMedicationId]);

  const selectedMedication = useMemo(() => {
    if (!selectedMedicationId) return null;
    return (
      filteredMedications.find((medication) => medication._id === selectedMedicationId) ??
      null
    );
  }, [filteredMedications, selectedMedicationId]);

  const serviceUserValue = useMemo(() => {
    if (!selectedServiceUser) return "";
    const found = serviceUsers.find((user) => user._id === selectedServiceUser);
    return found ? selectedServiceUser : "";
  }, [selectedServiceUser, serviceUsers]);

  const medicationValue = useMemo(() => {
    if (!selectedMedicationId) return "";
    const found = filteredMedications.find(
      (medication) => medication._id === selectedMedicationId
    );
    return found ? selectedMedicationId : "";
  }, [filteredMedications, selectedMedicationId]);

  const mutation = useMutation({
    mutationFn: ({ id, payload }: UpdatePayload) =>
      activeMedicationApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeMedications"] });
    },
  });

  const resetFeedback = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleServiceUserChange = (event: SelectChangeEvent<string>) => {
    resetFeedback();
    const nextServiceUser = event.target.value;
    setSelectedServiceUser(nextServiceUser);
    setSelectedMedicationId("");
  };

  const handleMedicationChange = (event: SelectChangeEvent<string>) => {
    resetFeedback();
    setSelectedMedicationId(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (!selectedServiceUser) {
      setError("Please select a service user.");
      return;
    }

    if (!selectedMedication) {
      setError("Please select a medication to adjust.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const finalNote = note === "Other" ? customNote.trim() : note;
    if (!finalNote) {
      setError("Please provide a note describing the stock adjustment.");
      return;
    }

    const currentStock = selectedMedication.quantityInStock ?? 0;

    if (adjustmentType === "remove" && quantity > currentStock) {
      setError("Cannot remove more than the current stock level.");
      return;
    }

    const updatedStock =
      adjustmentType === "add"
        ? currentStock + quantity
        : Math.max(0, currentStock - quantity);

    try {
      await mutation.mutateAsync({
        id: selectedMedication._id,
        payload: {
          quantityInStock: updatedStock,
          stockChangeNote: finalNote,
          notes: finalNote,
        },
      });

      setSuccessMessage("Stock updated successfully.");
      setQuantity(0);
      if (note === "Other") {
        setCustomNote("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update stock.");
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Paper
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: { xs: 2, md: 4 },
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Medication Stock Amendment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Record stock adjustments with clear notes for auditing and safety.
        </Typography>

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

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth disabled>
              <InputLabel id="service-user-select-label">Service User</InputLabel>
              <Select
                labelId="service-user-select-label"
                label="Service User"
                value={serviceUserValue}
                onChange={handleServiceUserChange}
                disabled
              >
                <MenuItem value="" disabled>
                  {isLoadingServiceUsers ? "Loading..." : "Service user not available"}
                </MenuItem>
                {serviceUsers.map((user: ServiceUser) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              disabled
            >
              <InputLabel id="medication-select-label">Medication</InputLabel>
              <Select
                labelId="medication-select-label"
                label="Medication"
                value={medicationValue}
                onChange={handleMedicationChange}
                disabled
              >
                <MenuItem value="" disabled>
                  {isLoadingMedications
                    ? "Loading..."
                    : "Medication not available"}
                </MenuItem>
                {filteredMedications.map((medication) => (
                  <MenuItem key={medication._id} value={medication._id}>
                    {medication.medicationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedMedication && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f5f7fb",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedMedication.medicationName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current stock level: {selectedMedication.quantityInStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dosage: {selectedMedication.dosage.amount}{" "}
                  {selectedMedication.dosage.unit}
                </Typography>
              </Paper>
            )}

            <FormControl fullWidth>
              <InputLabel id="adjustment-type-label">Adjustment Type</InputLabel>
              <Select
                labelId="adjustment-type-label"
                label="Adjustment Type"
                value={adjustmentType}
                onChange={(event) =>
                  setAdjustmentType(event.target.value as AdjustmentType)
                }
              >
                <MenuItem value="add">Add Stock</MenuItem>
                <MenuItem value="remove">Remove Stock</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(event) => {
                resetFeedback();
                const nextValue = Number(event.target.value);
                setQuantity(Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue));
              }}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />

            <FormControl fullWidth>
              <InputLabel id="note-select-label">Reason</InputLabel>
              <Select
                labelId="note-select-label"
                label="Reason"
                value={note}
                onChange={(event) => {
                  resetFeedback();
                  setNote(event.target.value);
                }}
              >
                {reasonOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {note === "Other" && (
              <TextField
                label="Custom Note"
                value={customNote}
                onChange={(event) => {
                  resetFeedback();
                  setCustomNote(event.target.value);
                }}
                fullWidth
                required
              />
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button component={Link} to="/" color="inherit">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Updating..." : "Save Adjustment"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default StockAmendmentPage;

