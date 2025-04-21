import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import axios from "axios";

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
        {id ? "Edit Medication" : "Add New Medication"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/medications")}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading
              ? "Saving..."
              : id
              ? "Update Medication"
              : "Add Medication"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminMedicationForm;
