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

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#e3f2fd";
      case "Completed":
        return "#e8f5e8";
      case "Cancelled":
        return "#ffebee";
      case "Rescheduled":
        return "#fff3e0";
      case "NoShow":
        return "#ffebee";
      default:
        return "#f5f5f5";
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
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.5rem", sm: "2rem" },
          color: '#1a1a1a',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Appointments
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {filteredAppointments.map((appointment) => (
          <Grid item xs={12} sm={6} lg={4} key={appointment._id}>
            <Card sx={{ 
              height: "100%",
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { 
                transform: 'translateY(-8px)',
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
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                zIndex: 1
              }
            }}>
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": { pb: { xs: 2, sm: 3 } },
                  position: 'relative',
                  zIndex: 2
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
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      lineHeight: 1.2
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
                      sx={{ 
                        maxWidth: "120px",
                        fontWeight: 'bold',
                        backgroundColor: getStatusBackground(appointment.status),
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <EditIcon
                      sx={{
                        cursor: "pointer",
                        color: "#1976d2",
                        "&:hover": { 
                          color: "#1565c0",
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s ease'
                        },
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
                      p: 1.5,
                      backgroundColor: '#e3f2fd',
                      borderRadius: '8px',
                      border: '1px solid #bbdefb'
                    }}
                  >
                    <EventIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                        color: '#1976d2'
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                        color: '#424242',
                        fontWeight: 500
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
                      p: 1.5,
                      backgroundColor: '#fff3e0',
                      borderRadius: '8px',
                      border: '1px solid #ffe0b2'
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                        color: '#f57c00'
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                        color: '#424242',
                        fontWeight: 500
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
                      p: 1.5,
                      backgroundColor: '#e8f5e8',
                      borderRadius: '8px',
                      border: '1px solid #c8e6c9'
                    }}
                  >
                    <PersonIcon
                      sx={{
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        mt: "2px",
                        color: '#388e3c'
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        wordBreak: "break-word",
                        color: '#424242',
                        fontWeight: 500
                      }}
                    >
                      {typeof appointment.serviceUser === "object"
                        ? appointment.serviceUser.name
                        : "Loading..."}
                    </Typography>
                  </Box>

                  {appointment.provider && (
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#f3e5f5',
                        borderRadius: '8px',
                        border: '1px solid #e1bee7'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          wordBreak: "break-word",
                          color: '#424242',
                          fontWeight: 500
                        }}
                      >
                        <strong style={{ color: '#7b1fa2' }}>Provider:</strong> {appointment.provider.name} (
                        {appointment.provider.role})
                      </Typography>
                    </Box>
                  )}

                  {appointment.notes && (
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#fce4ec',
                        borderRadius: '8px',
                        border: '1px solid #f8bbd9'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          wordBreak: "break-word",
                          color: '#424242',
                          fontWeight: 500
                        }}
                      >
                        <strong style={{ color: '#c2185b' }}>Notes:</strong> {appointment.notes}
                      </Typography>
                    </Box>
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
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e0e0e0'
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
                fontWeight: 'bold',
                color: '#424242',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
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
