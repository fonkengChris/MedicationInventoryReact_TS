import React, { useEffect, useState } from "react";
import {
  serviceUserApi,
  activeMedicationApi,
  appointmentApi,
} from "../services/api";
import { ServiceUser, ActiveMedication, Appointment } from "../types/models";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Modal,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import { jwtDecode } from "jwt-decode";
import useServiceUsers from "../hooks/useServiceUsers";
import useActiveMedications from "../hooks/useActiveMedications";
import useAppointments from "../hooks/useAppointments";

const Home = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<ActiveMedication | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [isServing, setIsServing] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
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

  const { data: serviceUsers = [], isLoading: isLoadingUsers } =
    useServiceUsers();
  const { data: activeMedications = [], refetch: fetchActiveMedications } =
    useActiveMedications();
  const { data: appointments = [], refetch: fetchAppointments } =
    useAppointments();

  const filteredMedications = activeMedications.filter(
    (med) => (med.serviceUser as any)._id === selectedUser && med.isActive
  );

  const filteredAppointments = appointments.filter(
    (apt) => (apt.serviceUser as any)._id === selectedUser
  );

  const handleUserChange = (event: any) => {
    setSelectedUser(event.target.value);
  };

  const handleAddStock = (medication: ActiveMedication) => {
    setSelectedMedication(medication);
    setIsServing(false);
    setIsModalOpen(true);
  };

  const handleSubmitStock = async () => {
    if (!selectedMedication) return;

    try {
      await activeMedicationApi.update(selectedMedication._id, {
        quantityInStock: selectedMedication.quantityInStock + quantity,
      });
      await fetchActiveMedications();
      setIsModalOpen(false);
      setQuantity(0);
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleServeMedication = (medication: ActiveMedication) => {
    setSelectedMedication(medication);
    setIsServing(true);
    setQuantity(medication.quantityPerDose);
    setIsModalOpen(true);
  };

  const handleSubmitServe = async () => {
    if (!selectedMedication) return;

    try {
      await activeMedicationApi.update(selectedMedication._id, {
        quantityInStock: selectedMedication.quantityInStock - quantity,
      });
      await fetchActiveMedications();
      setIsModalOpen(false);
      setQuantity(0);
    } catch (error) {
      console.error("Failed to serve medication:", error);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: { _id: string } = jwtDecode(token);

      await appointmentApi.create({
        ...newAppointment,
        serviceUser: selectedUser!,
        createdBy: decodedToken._id,
      } as Omit<Appointment, "_id">);

      await fetchAppointments();
      setIsAppointmentModalOpen(false);
      setNewAppointment({
        serviceUser: "",
        appointmentType: "Medical",
        dateTime: "",
        duration: 30,
        location: "",
        provider: { name: "", role: "", contactNumber: "" },
        status: "Scheduled",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment");
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to MedTracker
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Please select a service user to manage their medications
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="service-user-label">Service User</InputLabel>
          <Select
            labelId="service-user-label"
            value={selectedUser}
            label="Service User"
            onChange={handleUserChange}
            disabled={isLoadingUsers}
          >
            {serviceUsers.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Add profile card */}
        {selectedUser && (
          <Card sx={{ mb: 4, mt: 4 }}>
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      bgcolor: "primary.main",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
                  </Avatar>
                  <Typography
                    variant="h5"
                    sx={{ mt: 2, textAlign: { xs: "center", sm: "left" } }}
                  >
                    {serviceUsers.find((u) => u._id === selectedUser)?.name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body1">
                    <strong>Peronal Info:</strong>
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    NHS Number:{" "}
                    {
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.nhsNumber
                    }
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    DOB:{" "}
                    {new Date(
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.dateOfBirth || ""
                    ).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body1">
                    <strong>Address:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {serviceUsers.find((u) => u._id === selectedUser)?.address}
                  </Typography>
                  <Typography variant="body2">
                    Phone:{" "}
                    {
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.phoneNumber
                    }
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body1">
                    <strong>Emergency Contact:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.emergencyContact.name
                    }
                    (
                    {
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.emergencyContact.relationship
                    }
                    )
                  </Typography>
                  <Typography variant="body2">
                    Phone:{" "}
                    {
                      serviceUsers.find((u) => u._id === selectedUser)
                        ?.emergencyContact.phoneNumber
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {selectedUser && filteredMedications.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              mt: 4,
              overflow: "auto",
              "& .MuiTable-root": {
                minWidth: { xs: 650, sm: 800 },
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medication Name</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Stock Level</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Prescribed By</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedications.map((medication) => (
                  <TableRow key={medication._id}>
                    <TableCell>{medication.medicationName}</TableCell>
                    <TableCell>{`${medication.dosage.amount} ${medication.dosage.unit}`}</TableCell>
                    <TableCell>{medication.quantityInStock}</TableCell>
                    <TableCell>{medication.frequency}</TableCell>
                    <TableCell>
                      {new Date(medication.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{medication.prescribedBy}</TableCell>
                    <TableCell>{medication.notes}</TableCell>
                    <TableCell>
                      <Tooltip title="Add Stock">
                        <IconButton
                          color="primary"
                          onClick={() => handleAddStock(medication)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Serve Medication">
                        <IconButton
                          color="success"
                          onClick={() => handleServeMedication(medication)}
                        >
                          <LocalHospitalIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedUser && filteredAppointments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Upcoming Appointments
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                overflow: "auto",
                "& .MuiTable-root": {
                  minWidth: { xs: 650, sm: 800 },
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments
                    .filter((appointment) => appointment.status === "Scheduled")
                    .map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>{appointment.appointmentType}</TableCell>
                        <TableCell>
                          {new Date(appointment.dateTime).toLocaleString()}
                        </TableCell>
                        <TableCell>{appointment.duration} mins</TableCell>
                        <TableCell>{appointment.location}</TableCell>
                        <TableCell>
                          {`${appointment.provider.name} (${appointment.provider.role})`}
                        </TableCell>
                        <TableCell>{appointment.status}</TableCell>
                        <TableCell>{appointment.notes}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {selectedUser && filteredAppointments.length === 0 && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            No upcoming appointments found.
          </Typography>
        )}

        {selectedUser && (
          <Button
            variant="contained"
            onClick={() => setIsAppointmentModalOpen(true)}
            sx={{ mt: 4 }}
          >
            Add New Appointment
          </Button>
        )}
      </Box>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {selectedMedication?.medicationName}
          </Typography>
          <TextField
            fullWidth
            type="number"
            label={isServing ? "Quantity to Serve" : "Quantity to Add"}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{ my: 2 }}
          />
          <Button
            variant="contained"
            onClick={isServing ? handleSubmitServe : handleSubmitStock}
            sx={{ mr: 1 }}
          >
            {isServing ? "Serve" : "Add Stock"}
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
        </Box>
      </Modal>
      <Modal
        open={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%" },
            maxWidth: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Add New Appointment
          </Typography>

          <form onSubmit={handleAppointmentSubmit} className="space-y-4">
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                name="appointmentType"
                value={newAppointment.appointmentType}
                onChange={(e) =>
                  setNewAppointment((prev) => ({
                    ...prev,
                    appointmentType: e.target.value as
                      | "Medical"
                      | "Dental"
                      | "Therapy"
                      | "Review"
                      | "Other",
                  }))
                }
                required
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

            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              name="dateTime"
              value={newAppointment.dateTime}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  dateTime: e.target.value,
                }))
              }
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="number"
              label="Duration (minutes)"
              name="duration"
              value={newAppointment.duration}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  duration: Number(e.target.value),
                }))
              }
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={newAppointment.location}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              required
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Provider Details
            </Typography>

            <TextField
              fullWidth
              label="Provider Name"
              name="provider.name"
              value={newAppointment.provider?.name}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  provider: { ...prev.provider!, name: e.target.value },
                }))
              }
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Provider Role"
              name="provider.role"
              value={newAppointment.provider?.role}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  provider: { ...prev.provider!, role: e.target.value },
                }))
              }
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Provider Contact Number"
              name="provider.contactNumber"
              value={newAppointment.provider?.contactNumber}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  provider: {
                    ...prev.provider!,
                    contactNumber: e.target.value,
                  },
                }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              name="notes"
              value={newAppointment.notes}
              onChange={(e) =>
                setNewAppointment((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button onClick={() => setIsAppointmentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Add Appointment
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Home;
