import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  activeMedicationApi,
  serviceUserApi,
  medicationApi,
} from "../services/api";
import { ActiveMedication, ServiceUser, Medication } from "../types/models";
import { jwtDecode } from "jwt-decode";

const DOSAGE_UNITS = [
  "mg",
  "ml",
  "g",
  "tablets",
  "capsules",
  "drops",
  "puffs",
  "patches",
];

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminActiveMedicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeMedication, setActiveMedication] = useState<
    Partial<ActiveMedication>
  >({
    serviceUser: "",
    medicationName: "",
    dosage: {
      amount: 0,
      unit: "mg",
    },
    quantityInStock: 0,
    quantityPerDose: 0,
    dosesPerDay: 1,
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    prescribedBy: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceUsersRes, medicationsRes] = await Promise.all([
          serviceUserApi.getAll(),
          medicationApi.getAll(),
        ]);
        setServiceUsers(serviceUsersRes.data);
        setMedications(medicationsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    if (id) {
      const fetchActiveMedication = async () => {
        try {
          const response = await activeMedicationApi.getById(id);
          const medication = response.data;
          setActiveMedication({
            ...medication,
            serviceUser:
              typeof medication.serviceUser === "object"
                ? medication.serviceUser._id
                : medication.serviceUser,
            startDate: new Date(medication.startDate)
              .toISOString()
              .split("T")[0],
            endDate: medication.endDate
              ? new Date(medication.endDate).toISOString().split("T")[0]
              : "",
          });
        } catch (error) {
          console.error("Error fetching active medication:", error);
          navigate("/admin/active-medications");
        }
      };
      fetchActiveMedication();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: DecodedToken = jwtDecode(token);

      if (id) {
        console.log("Updating active medication:", activeMedication);
        await activeMedicationApi.update(id, {
          ...activeMedication,
          updatedBy: decodedToken._id,
        });
      } else {
        console.log("Creating active medication:", activeMedication);
        await activeMedicationApi.create({
          ...(activeMedication as Omit<ActiveMedication, "_id">),
          updatedBy: decodedToken._id,
        });
      }
      navigate("/admin/active-medications");
    } catch (error) {
      console.error("Error saving active medication:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("dosage.")) {
      const field = name.split(".")[1];
      setActiveMedication((prev) => ({
        ...prev,
        dosage: {
          ...prev.dosage!,
          [field]: type === "number" ? Number(value) : value,
        } as ActiveMedication["dosage"],
      }));
    } else {
      setActiveMedication((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleActivationToggle = async (newActiveState: boolean) => {
    if (!id) return;

    try {
      setIsLoading(true);
      if (newActiveState) {
        // Reactivate medication through PUT request
        await activeMedicationApi.update(id, {
          isActive: true,
        });
      } else {
        // Deactivate medication through PATCH request
        await activeMedicationApi.deactivate(id);
      }
      navigate("/admin/active-medications");
    } catch (error) {
      console.error("Error toggling medication activation:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while updating activation status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
        {id ? "Edit Active Medication" : "Add Active Medication"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service User
            </label>
            <select
              name="serviceUser"
              value={
                typeof activeMedication.serviceUser === "object"
                  ? activeMedication.serviceUser._id
                  : activeMedication.serviceUser || ""
              }
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select Service User</option>
              {serviceUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication
            </label>
            <select
              name="medicationName"
              value={activeMedication.medicationName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select Medication</option>
              {medications.map((med) => (
                <option key={med._id} value={med.name}>
                  {med.name} - {med.dosage}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage Amount
              </label>
              <input
                type="number"
                name="dosage.amount"
                value={activeMedication.dosage?.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage Unit
              </label>
              <select
                name="dosage.unit"
                value={activeMedication.dosage?.unit}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              >
                {DOSAGE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity in Stock
              </label>
              <input
                type="number"
                name="quantityInStock"
                value={activeMedication.quantityInStock}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity per Dose
              </label>
              <input
                type="number"
                name="quantityPerDose"
                value={activeMedication.quantityPerDose}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doses per Day
              </label>
              <input
                type="number"
                name="dosesPerDay"
                value={activeMedication.dosesPerDay}
                onChange={handleChange}
                required
                min="1"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <input
              type="text"
              name="frequency"
              value={activeMedication.frequency}
              onChange={handleChange}
              required
              placeholder="e.g., Once daily, Twice daily, Every 4 hours"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={activeMedication.startDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={activeMedication.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescribed By
            </label>
            <input
              type="text"
              name="prescribedBy"
              value={activeMedication.prescribedBy}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={activeMedication.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Status:
              </span>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  activeMedication.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {activeMedication.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleActivationToggle(!activeMedication.isActive)}
              className={`px-4 py-2 rounded-md text-white ${
                activeMedication.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isLoading}
            >
              {isLoading
                ? "Updating..."
                : activeMedication.isActive
                ? "Deactivate Medication"
                : "Activate Medication"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/admin/active-medications")}
            className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading
              ? "Saving..."
              : id
              ? "Update Active Medication"
              : "Add Active Medication"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminActiveMedicationForm;
