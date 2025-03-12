import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentApi } from "../services/api";
import useAppointments from "../hooks/useAppointments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading, error } = useAppointments();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      handleStatusClose();
    },
    onError: (error) => {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    },
  });

  const handleStatusClick = (
    event: React.MouseEvent<HTMLElement | SVGSVGElement>,
    appointmentId: string
  ) => {
    setAnchorEl(event.currentTarget as HTMLElement);
    setSelectedAppointment(appointmentId);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: selectedAppointment,
      status: newStatus,
    });
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      (!selectedUser ||
        (typeof appointment.serviceUser === "object"
          ? appointment.serviceUser._id === selectedUser
          : appointment.serviceUser === selectedUser)) &&
      (!selectedUser || appointment.status === "Scheduled")
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "primary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "Rescheduled":
        return "warning";
      case "NoShow":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Appointments
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {filteredAppointments.map((appointment) => (
          <Grid item xs={12} sm={6} lg={4} key={appointment._id}>
            <Card sx={{ height: "100%" }}>
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": { pb: { xs: 2, sm: 3 } },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      flexGrow: 1,
                      minWidth: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {appointment.appointmentType}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      ml: { xs: 0, sm: 2 },
                    }}
                  >
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status) as any}
                      size={isMobile ? "small" : "medium"}
                      sx={{ maxWidth: "120px" }}
                    />
                    <EditIcon
                      sx={{
                        cursor: "pointer",
                        color: "primary.main",
                        "&:hover": { color: "primary.dark" },
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      }}
                      onClick={(e) => handleStatusClick(e, appointment._id)}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <EventIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {new Date(appointment.dateTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {appointment.location}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <PersonIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {typeof appointment.serviceUser === "object"
                        ? appointment.serviceUser.name
                        : "Loading..."}
                    </Typography>
                  </Box>

                  {appointment.provider && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      Provider: {appointment.provider.name} (
                      {appointment.provider.role})
                    </Typography>
                  )}

                  {appointment.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      Notes: {appointment.notes}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusClose}
        sx={{
          "& .MuiPaper-root": {
            width: { xs: "200px", sm: "auto" },
          },
        }}
      >
        {["Scheduled", "Completed", "Cancelled", "Rescheduled", "NoShow"].map(
          (status) => (
            <MenuItem
              key={status}
              onClick={() => handleStatusUpdate(status)}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                py: { xs: 1.5, sm: 1 },
              }}
            >
              {status}
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
};

export default AppointmentList;
