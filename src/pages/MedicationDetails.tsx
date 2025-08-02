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
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
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
    <Box 
      sx={{ 
        p: { xs: 2, sm: 2, md: 3 }, 
        maxWidth: "100%",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: '#1a1a1a',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Medication Details
        </Typography>
        <IconButton 
          onClick={() => navigate("/medications")} 
          sx={{
            backgroundColor: '#1976d2',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease'
            },
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Card
        sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid #e0e0e0',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
            borderColor: '#1976d2'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            zIndex: 1
          }
        }}
      >
        <CardContent 
          sx={{ 
            p: { xs: 3, sm: 4 },
            position: 'relative',
            zIndex: 2
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography 
              variant="h4"
              sx={{
                color: '#1a1a1a',
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {medication.name}
            </Typography>

            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                p: 2,
                backgroundColor: '#e3f2fd',
                borderRadius: '12px',
                border: '1px solid #bbdefb'
              }}
            >
              <MedicalInformationIcon sx={{ color: '#1976d2', fontSize: '2rem' }} />
              <Typography 
                sx={{ 
                  color: '#424242', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                Dosage: {medication.dosage}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' }, 
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  p: 2,
                  backgroundColor: '#fff3e0',
                  borderRadius: '12px',
                  border: '1px solid #ffe0b2',
                  flex: 1,
                  minWidth: '200px'
                }}
              >
                <MedicationIcon sx={{ color: '#f57c00', fontSize: '1.5rem' }} />
                <Chip
                  label={`Form: ${medication.form}`}
                  sx={{
                    backgroundColor: '#fff3e0',
                    color: '#f57c00',
                    fontWeight: 'bold',
                    border: '1px solid #f57c00',
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  p: 2,
                  backgroundColor: '#e8f5e8',
                  borderRadius: '12px',
                  border: '1px solid #c8e6c9',
                  flex: 1,
                  minWidth: '200px'
                }}
              >
                <LocalHospitalIcon sx={{ color: '#388e3c', fontSize: '1.5rem' }} />
                <Chip
                  label={`Route: ${medication.route}`}
                  sx={{
                    backgroundColor: '#e8f5e8',
                    color: '#388e3c',
                    fontWeight: 'bold',
                    border: '1px solid #388e3c',
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
            </Box>

            {medication.manufacturer && (
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  p: 2,
                  backgroundColor: '#f3e5f5',
                  borderRadius: '12px',
                  border: '1px solid #e1bee7'
                }}
              >
                <BusinessIcon sx={{ color: '#7b1fa2', fontSize: '1.5rem' }} />
                <Typography 
                  sx={{ 
                    color: '#424242', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
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
                  p: 2,
                  backgroundColor: '#fce4ec',
                  borderRadius: '12px',
                  border: '1px solid #f8bbd9'
                }}
              >
                <DescriptionIcon sx={{ color: '#c2185b', fontSize: '1.5rem', mt: '2px' }} />
                <Typography 
                  sx={{ 
                    color: '#424242', 
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.5
                  }}
                >
                  {medication.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MedicationDetails;
