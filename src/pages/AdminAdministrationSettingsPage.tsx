import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { administrationApi, groupApi } from "../services/api";
import { AdministrationSettings, Group } from "../types/models";

const AdminAdministrationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdministrationSettings | null>(null);
  const [thresholdBefore, setThresholdBefore] = useState<number>(30);
  const [thresholdAfter, setThresholdAfter] = useState<number>(30);
  const [scope, setScope] = useState<"global" | "group">("global");
  const [groupId, setGroupId] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSettings = async () => {
    try {
      const response = await administrationApi.getSettings(
        scope === "group" && groupId ? { groupId } : undefined
      );
      setSettings(response.data.data);
      setThresholdBefore(response.data.data.thresholdBefore);
      setThresholdAfter(response.data.data.thresholdAfter);
    } catch (err: any) {
      console.error("Failed to load settings", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to load settings",
      });
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupApi.getAll();
        setGroups(response.data);
      } catch (err) {
        console.error("Failed to load groups", err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    loadSettings();
  }, [scope, groupId]);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await administrationApi.updateSettings({
        scope,
        groupId: scope === "group" ? groupId : undefined,
        thresholdBefore,
        thresholdAfter,
      });
      setMessage({
        type: "success",
        text: "Settings updated successfully",
      });
      loadSettings();
    } catch (err: any) {
      console.error("Failed to update settings", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update settings",
      });
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Administration Threshold Settings
        </Typography>

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="scope-select-label">Scope</InputLabel>
            <Select
              labelId="scope-select-label"
              label="Scope"
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as "global" | "group")
              }
            >
              <MenuItem value="global">Global</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </Select>
          </FormControl>

          {scope === "group" && (
            <FormControl fullWidth>
              <InputLabel id="group-select-label">Group</InputLabel>
              <Select
                labelId="group-select-label"
                label="Group"
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
              >
                {groups.map((group) => (
                  <MenuItem key={group._id} value={group._id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Threshold Before (minutes)"
            type="number"
            value={thresholdBefore}
            onChange={(event) => setThresholdBefore(Number(event.target.value))}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Threshold After (minutes)"
            type="number"
            value={thresholdAfter}
            onChange={(event) => setThresholdAfter(Number(event.target.value))}
            inputProps={{ min: 0 }}
          />

          {settings && (
            <Alert severity="info">
              Current settings last updated:{" "}
              {settings.updatedAt
                ? new Date(settings.updatedAt).toLocaleString()
                : "Unknown"}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || (scope === "group" && !groupId)}
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminAdministrationSettingsPage;

