import React, { useEffect, useMemo, useState } from "react";
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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { marApi, serviceUserApi } from "../services/api";
import { MarData, ServiceUser, MedicationAdministrationRecord } from "../types/models";

const formatDate = (date: Date | null) => {
  if (!date) return "";
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().split("T")[0];
};

function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

function getFirstDayOfWeekContainingDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday is 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLastDayOfWeekContainingDate(date: Date): Date {
  const firstDay = getFirstDayOfWeekContainingDate(date);
  const lastDay = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
}

function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const lastDayOfMonth = getLastDayOfMonth(year, month);
  
  // Get the Monday of the week containing the first day of the month
  const start = getFirstDayOfWeekContainingDate(firstDayOfMonth);
  
  // Get the Sunday of the week containing the last day of the month
  const end = getLastDayOfWeekContainingDate(lastDayOfMonth);
  
  return { start, end };
}

function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function groupDatesIntoWeeks(dates: string[]): (string | null)[][] {
  if (!dates || !dates.length) return [];

  const dateObjects = dates.map((d) => new Date(d));
  const weeksMap = new Map<string, (string | null)[]>();

  dateObjects.forEach((date) => {
    const monday = startOfWeekMonday(date);
    const key = monday.toISOString();
    if (!weeksMap.has(key)) {
      weeksMap.set(key, Array.from({ length: 7 }, () => null));
    }
    const week = weeksMap.get(key)!;
    const dayIndex = (date.getDay() + 6) % 7;
    week[dayIndex] = date.toISOString().split("T")[0];
  });

  return Array.from(weeksMap.values());
}

function formatDisplayDate(date: string | null, dayIndex: number): string {
  if (!date) return "";
  const d = new Date(date);
  const dayLabel = WEEKDAY_LABELS[dayIndex] || "";
  const dayNumber = d.getDate().toString().padStart(2, "0");
  return `${dayLabel} ${dayNumber}`;
}

function formatWeekRangeLabel(week: (string | null)[], index: number): string {
  const validDates = week.filter(Boolean) as string[];
  if (!validDates.length) return `Week ${index + 1}`;

  const start = new Date(validDates[0]);
  const end = new Date(validDates[validDates.length - 1]);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });

  return `Week ${index + 1} (${formatter.format(start)} - ${formatter.format(end)})`;
}

function getStatusCode(status: string | undefined, notes: string | undefined): string | null {
  if (!status && !notes) return null;

  const combined = `${status || ""} ${notes || ""}`.toUpperCase();
  
  if (combined.includes("REFUSED") || combined.includes(" R ")) return "R";
  if (combined.includes("NAUSEA") || combined.includes("VOMITING") || combined.includes(" N ")) return "N";
  if (combined.includes("HOSPITAL") || combined.includes(" H ")) return "H";
  if (combined.includes("ON LEAVE") || combined.includes("LEAVE") || combined.includes(" L ")) return "L";
  if (combined.includes("DESTROYED") || combined.includes(" D ")) return "D";
  if (combined.includes("SLEEPING") || combined.includes(" S ")) return "S";
  if (combined.includes("PULSE ABNORMAL") || combined.includes("PULSE") || combined.includes(" P ")) return "P";
  if (combined.includes("NOT REQUIRED") || combined.includes("NR")) return "NR";
  if (combined.includes("OTHER") || combined.includes(" O ")) return "O";

  return null;
}

function getStaffAbbreviation(administeredBy: any): string {
  if (!administeredBy) return "";

  let source = "";
  if (typeof administeredBy === "string") {
    source = administeredBy;
  } else if (typeof administeredBy === "object") {
    if (administeredBy.username) {
      source = administeredBy.username;
    } else if (administeredBy.name) {
      source = administeredBy.name;
    } else if (administeredBy.email) {
      source = administeredBy.email.split("@")[0];
    }
  }

  const parts = source.trim().split(/[\s._-]+/).filter(Boolean);
  if (!parts.length) return source.slice(0, 2).toUpperCase();

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function getTimeSlotsForMedication(
  medicationId: string,
  dates: string[],
  windows: MarData["windows"],
  administrations: MarData["administrations"],
  medication?: any
): string[] {
  const slots = new Set<string>();
  const medIdStr = String(medicationId);

  // First, check if medication has administrationTimes directly (most reliable source)
  if (medication?.administrationTimes && Array.isArray(medication.administrationTimes) && medication.administrationTimes.length > 0) {
    medication.administrationTimes.forEach((time: string) => {
      if (time && typeof time === 'string') {
        slots.add(time);
      }
    });
  }

  // Then check windows and administrations for all dates
  // Try multiple key formats to handle different serialization scenarios
  dates.forEach((date) => {
    // Normalize date to YYYY-MM-DD format
    let dateStr = date;
    if (date.includes('T')) {
      dateStr = date.split('T')[0];
    } else if (date.includes(' ')) {
      dateStr = new Date(date).toISOString().split('T')[0];
    }
    
    // Try multiple key combinations
    const dateKeys = [dateStr, date];
    const medKeys = [medIdStr, medicationId];
    
    for (const medKey of medKeys) {
      for (const dateKey of dateKeys) {
        const dailyWindows = windows[medKey]?.[dateKey] || [];
        const dailyAdministrations = administrations[medKey]?.[dateKey] || [];

        dailyWindows.forEach((window: any) => {
          if (window?.scheduledTime && typeof window.scheduledTime === 'string') {
            slots.add(window.scheduledTime);
          }
        });

        dailyAdministrations.forEach((admin: any) => {
          if (admin?.scheduledTime && typeof admin.scheduledTime === 'string') {
            slots.add(admin.scheduledTime);
          } else if (admin?.administeredAt && !admin?.scheduledTime) {
            slots.add("PRN");
          }
        });
      }
    }
  });

  const ordered = Array.from(slots);
  ordered.sort((a, b) => {
    if (a === "PRN") return 1;
    if (b === "PRN") return -1;
    return a.localeCompare(b);
  });

  // Only return PRN as fallback if we truly found no scheduled times
  // If we found administrationTimes, we should have slots
  if (ordered.length === 0 && (!medication?.administrationTimes || medication.administrationTimes.length === 0)) {
    return ["PRN"];
  }

  return ordered.length > 0 ? ordered : ["PRN"];
}

function getCellContent(
  slot: string,
  date: string | null,
  medicationId: string,
  windows: MarData["windows"],
  administrations: MarData["administrations"]
): { content: string; isDestroyed: boolean; statusCode: string | null; hasBackground: boolean } {
  if (!date) {
    return { content: "", isDestroyed: false, statusCode: null, hasBackground: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);
  const isFuture = cellDate > today;

  // Only hide future dates, allow today's administrations to show
  if (isFuture) {
    return { content: "", isDestroyed: false, statusCode: null, hasBackground: false };
  }

  // Normalize medication ID and date format
  const medIdStr = String(medicationId);
  const dateStr = date.includes('T') ? date.split('T')[0] : date;
  
  const dailyAdministrations = administrations[medIdStr]?.[dateStr] || administrations[medIdStr]?.[date] || [];
  const administration = dailyAdministrations.find((admin: any) => {
    if (slot === "PRN") {
      return !admin.scheduledTime;
    }
    return admin.scheduledTime === slot;
  });

  if (!administration) {
    return { content: "", isDestroyed: false, statusCode: null, hasBackground: false };
  }

  const statusCode = getStatusCode(administration.status, administration.notes);

  if (statusCode === "D") {
    return { content: "×", isDestroyed: true, statusCode: "D", hasBackground: false };
  }

  if (statusCode) {
    const hasBackground = ["R", "L", "O"].includes(statusCode);
    return { content: statusCode, isDestroyed: false, statusCode, hasBackground };
  }

  const adminStatus = (administration.status || "").toLowerCase();
  const isSuccessfulAdmin = ["on-time", "early", "late", "recorded"].includes(adminStatus);

  if (isSuccessfulAdmin && administration.administeredBy) {
    const staffAbbreviation = getStaffAbbreviation(administration.administeredBy);
    if (staffAbbreviation) {
      const hasBackground = adminStatus === "on-time" || adminStatus === "early";
      return { content: staffAbbreviation, isDestroyed: false, statusCode: null, hasBackground };
    }
  }

  const staffAbbreviation = getStaffAbbreviation(administration.administeredBy);
  if (staffAbbreviation) {
    return { content: staffAbbreviation, isDestroyed: false, statusCode: null, hasBackground: false };
  }

  return { content: "", isDestroyed: false, statusCode: null, hasBackground: false };
}

const AdminMarPage: React.FC = () => {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [marData, setMarData] = useState<MarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate start and end dates for the current month
  const startDate = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const endDate = useMemo(() => getLastDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const response = await serviceUserApi.getAll();
        setServiceUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch service users", err);
        setError("Failed to load service users");
      }
    };

    fetchServiceUsers();
  }, []);

  const handleLoad = React.useCallback(async () => {
    if (!selectedServiceUser) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      const response = await marApi.getData(selectedServiceUser, {
        startDate: start,
        endDate: end,
      });
      setMarData(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch MAR data", err);
      setError(err?.response?.data?.message || "Failed to fetch MAR data");
      setMarData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceUser, startDate, endDate]);

  // Auto-load MAR data when service user or month changes
  useEffect(() => {
    if (selectedServiceUser) {
      handleLoad();
    }
  }, [selectedServiceUser, handleLoad]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDownload = async () => {
    if (!selectedServiceUser) {
      setError("Select a service user");
      return;
    }

    try {
      const response = await marApi.downloadPdf(selectedServiceUser, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mar-${selectedServiceUser}-${formatDate(startDate)}-${formatDate(
        endDate
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to download MAR PDF", err);
      setError(err?.response?.data?.message || "Failed to download MAR PDF");
    }
  };

  const medicationList = useMemo(() => marData?.medications || [], [marData]);
  const weeks = useMemo(() => {
    if (!marData?.dateRange) return [];
    return groupDatesIntoWeeks(marData.dateRange);
  }, [marData?.dateRange]);

  const isFutureDate = (date: string | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          p: { xs: 2, sm: 3 },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.3rem", sm: "1.6rem" },
            color: "#1a1a1a",
            fontWeight: "bold",
          }}
        >
          MAR Chart
        </Typography>
        <Button variant="outlined" onClick={handleDownload} disabled={!marData} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Download PDF
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="service-user-select-label">Service User</InputLabel>
              <Select
                labelId="service-user-select-label"
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
          </Grid>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 2,
              }}
            >
              <IconButton
                onClick={handlePreviousMonth}
                disabled={loading}
                sx={{
                  border: "1px solid #ddd",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  minWidth: "200px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {formatMonthYear(currentYear, currentMonth)}
              </Typography>
              <IconButton
                onClick={handleNextMonth}
                disabled={loading}
                sx={{
                  border: "1px solid #ddd",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ArrowForward />
              </IconButton>
              <Button
                variant="outlined"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now.getMonth());
                  setCurrentYear(now.getFullYear());
                }}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                Today
              </Button>
            </Box>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {marData && medicationList.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography>No active medications found for this period.</Typography>
        </Paper>
      )}

      {marData &&
        medicationList.map((medication) => {
          const timeSlots = getTimeSlotsForMedication(
            medication._id,
            marData.dateRange,
            marData.windows,
            marData.administrations,
            medication
          );

          return (
            <Paper
              key={medication._id}
              sx={{
                mb: 3,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <TableContainer
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "auto",
                  "&::-webkit-scrollbar": {
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "#555",
                    },
                  },
                }}
              >
                <Table 
                  size="small"
                  sx={{
                    width: "100%",
                    tableLayout: "auto",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: "#E8E8E8",
                          fontWeight: "bold",
                          width: "140px",
                          maxWidth: "140px",
                          minWidth: "120px",
                          borderRight: "1px solid #ddd",
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                        }}
                      >
                        Medication Details
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          width: "60px",
                          maxWidth: "60px",
                          minWidth: "50px",
                          textAlign: "center",
                          borderRight: "1px solid #ddd",
                          position: "sticky",
                          left: "140px",
                          zIndex: 2,
                          backgroundColor: "white",
                        }}
                      >
                        Time
                      </TableCell>
                      {weeks.map((week, weekIndex) => (
                        <TableCell
                          key={`week-${weekIndex}`}
                          colSpan={7}
                          sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            borderRight: weekIndex < weeks.length - 1 ? "1px solid #ddd" : "none",
                            minWidth: `${7 * 50}px`,
                          }}
                        >
                          {formatWeekRangeLabel(week, weekIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: "#E8E8E8",
                          borderRight: "1px solid #ddd",
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                        }}
                      />
                      <TableCell
                        sx={{
                          borderRight: "1px solid #ddd",
                          position: "sticky",
                          left: "140px",
                          zIndex: 1,
                          backgroundColor: "white",
                        }}
                      />
                      {weeks.map((week, weekIndex) =>
                        week.map((date, dayIndex) => (
                          <TableCell
                            key={`date-${dayIndex}-${date}`}
                            sx={{
                              textAlign: "center",
                              fontWeight: "500",
                              fontSize: "0.75rem",
                              minWidth: "50px",
                              width: "50px",
                              borderRight:
                                dayIndex < 6 || weekIndex < weeks.length - 1
                                  ? "1px solid #ddd"
                                  : "none",
                            }}
                          >
                            {formatDisplayDate(date, dayIndex)}
                          </TableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeSlots.map((slot, slotIndex) => (
                      <TableRow key={slot}>
                        {slotIndex === 0 && (
                          <TableCell
                            rowSpan={timeSlots.length || 1}
                            sx={{
                              backgroundColor: "#E8E8E8",
                              borderRight: "1px solid #ddd",
                              verticalAlign: "top",
                              p: 1,
                              width: "140px",
                              maxWidth: "140px",
                              minWidth: "120px",
                              position: "sticky",
                              left: 0,
                              zIndex: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, fontSize: "0.85rem" }}>
                              {medication.medicationName || "Medication"}
                            </Typography>
                            {medication.dosage?.amount !== undefined && medication.dosage?.unit && (
                              <Typography variant="caption" sx={{ fontSize: "0.75rem", display: "block", mb: 0.3 }}>
                                Dosage: {medication.dosage.amount} {medication.dosage.unit}
                              </Typography>
                            )}
                            {medication.quantityPerDose !== undefined && medication.quantityPerDose !== null && (
                              <Typography variant="caption" sx={{ fontSize: "0.75rem", display: "block" }}>
                                Quantity per dose: {medication.quantityPerDose}
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderRight: "1px solid #ddd",
                            verticalAlign: "middle",
                            fontSize: "0.8rem",
                            width: "60px",
                            maxWidth: "60px",
                            minWidth: "50px",
                            position: "sticky",
                            left: "140px",
                            zIndex: 1,
                            backgroundColor: "white",
                          }}
                        >
                          {slot === "PRN" ? "PRN / Other" : slot}
                        </TableCell>
                        {weeks.map((week, weekIndex) =>
                          week.map((date, dayIndex) => {
                            const cellInfo = getCellContent(
                              slot,
                              date,
                              medication._id,
                              marData.windows,
                              marData.administrations
                            );
                            const isFuture = isFutureDate(date);

                            return (
                              <TableCell
                                key={`cell-${slot}-${date}-${dayIndex}`}
                                sx={{
                                  textAlign: "center",
                                  minWidth: "50px",
                                  width: "50px",
                                  height: 50,
                                  border: isFuture
                                    ? "2px solid #ff0000"
                                    : "1px solid #ddd",
                                  backgroundColor: cellInfo.hasBackground ? "#FFFF99" : "transparent",
                                  borderRight:
                                    dayIndex < 6 || weekIndex < weeks.length - 1
                                      ? isFuture
                                        ? "2px solid #ff0000"
                                        : "1px solid #ddd"
                                      : "none",
                                }}
                              >
                                {cellInfo.content && (
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: cellInfo.isDestroyed ? "1.2rem" : "0.9rem",
                                      color: cellInfo.isDestroyed ? "#ff0000" : "#000",
                                    }}
                                  >
                                    {cellInfo.content}
                                  </Typography>
                                )}
                              </TableCell>
                            );
                          })
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderTop: "1px solid #ddd" }}>
                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                  <strong>Codes:</strong> R - Refused | N - Nausea/Vomiting | H - Hospital | L - On Leave | D - Destroyed | S - Sleeping | P - Pulse Abnormal | NR - Not Required | O - Other
                </Typography>
              </Box>
            </Paper>
          );
        })}
    </Box>
  );
};

export default AdminMarPage;
