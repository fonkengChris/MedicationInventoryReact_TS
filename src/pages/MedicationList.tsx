import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { medicationApi } from "../services/api";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";

const MedicationList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const {
    data: medications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medications"],
    queryFn: () => medicationApi.getAll().then((res) => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

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
        Medications
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {medications.map((medication) => (
          <Grid item xs={12} sm={6} lg={4} key={medication._id}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
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
              }}
              onClick={() => navigate(`/medications/${medication._id}`)}
            >
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
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      lineHeight: 1.2
                    }}
                  >
                    {medication.name}
                  </Typography>
                  <Chip
                    label="View Details"
                    size="small"
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: '#bbdefb'
                      }
                    }}
                  />
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
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <MedicalInformationIcon
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
                      Dosage: {medication.dosage}
                    </Typography>
                  </Box>

                  {medication.manufacturer && (
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
                      <BusinessIcon
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
                        {medication.manufacturer}
                      </Typography>
                    </Box>
                  )}

                  {medication.notes && (
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
                      <DescriptionIcon
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
                        {medication.notes.split(" ").slice(0, 7).join(" ")}
                        {medication.notes.split(" ").length > 7 ? "..." : ""}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MedicationList;
