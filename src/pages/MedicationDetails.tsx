import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import useMedication from "../hooks/useMedication";

const MedicationDetails: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: medication, isLoading, error } = useMedication(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!medication) return <div>Medication not found</div>;

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 }, maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>
          Medication Details
        </Typography>
        <IconButton onClick={() => navigate("/medications")} color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h5">{medication.name}</Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MedicalInformationIcon />
              <Typography>Dosage: {medication.dosage}</Typography>
            </Box>

            {medication.manufacturer && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon />
                <Typography>{medication.manufacturer}</Typography>
              </Box>
            )}

            {medication.notes && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DescriptionIcon />
                <Typography>{medication.notes}</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MedicationDetails;
