import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import axios from "axios";
import { Grid, Button, Typography } from "@mui/material";

const AdminMedicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [medication, setMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    form: "tablet",
    route: "oral",
    manufacturer: "",
    notes: "",
  });

  const formOptions = [
    "tablet",
    "capsule",
    "injection",
    "cream",
    "solution",
    "other",
  ];
  const routeOptions = ["oral", "intravenous", "topical", "other"];

  useEffect(() => {
    if (id) {
      const fetchMedication = async () => {
        try {
          const response = await medicationApi.getById(id);

          if (!response.data) {
            throw new Error("No medication data received");
          }

          setMedication(response.data);
        } catch (error) {
          console.error("Error details:", error);

          if (axios.isAxiosError(error) && error.response?.status === 404) {
            alert("Medication not found. It may have been deleted.");
            navigate("/admin/medications");
          } else {
            alert("Error loading medication data. Please try again.");
          }
        }
      };
      fetchMedication();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (
        !medication.name ||
        !medication.dosage ||
        !medication.form ||
        !medication.route
      ) {
        throw new Error("Required fields missing");
      }

      if (id) {
        await medicationApi.update(id, medication);
      } else {
        await medicationApi.create({
          name: medication.name,
          dosage: medication.dosage,
          form: medication.form,
          route: medication.route,
          manufacturer: medication.manufacturer,
          notes: medication.notes,
        });
      }
      navigate("/admin/medications");
    } catch (error) {
      console.error("Error saving medication:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          alert(
            "Network error: Please check your internet connection and ensure the server is running."
          );
        } else if (error.response?.status === 404) {
          alert("Medication not found. It may have been deleted.");
          navigate("/admin/medications");
        } else if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/auth");
        } else {
          alert(
            `Error: ${
              error.response?.data?.message || "An unexpected error occurred"
            }`
          );
        }
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setMedication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          {id ? "Edit Medication" : "Add New Medication"}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={medication.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={medication.dosage}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form
              </label>
              <select
                name="form"
                value={medication.form}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              >
                {formOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route
              </label>
              <select
                name="route"
                value={medication.route}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              >
                {routeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={medication.manufacturer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={medication.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Button
                type="button"
                onClick={() => navigate("/admin/medications")}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                disabled={isLoading}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading
                  ? "Saving..."
                  : id
                  ? "Update Medication"
                  : "Add Medication"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default AdminMedicationForm;
