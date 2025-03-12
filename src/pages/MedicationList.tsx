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
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.5rem", sm: "2rem" },
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
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => navigate(`/medications/${medication._id}`)}
            >
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
                    }}
                  >
                    {medication.name}
                  </Typography>
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
                    <MedicalInformationIcon
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
                      Dosage: {medication.dosage}
                    </Typography>
                  </Box>

                  {medication.manufacturer && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <BusinessIcon
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
                      }}
                    >
                      <DescriptionIcon
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
