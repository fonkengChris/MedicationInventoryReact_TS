import React, { useState, useEffect } from "react";
import {
  MedicationUpdate,
  DateRangeFilter,
  User,
  ActiveMedication,
} from "../types/models";
import {
  medicationUpdateApi,
  activeMedicationApi,
  userApi,
} from "../services/api";
import { FiTrash2 } from "react-icons/fi";
import {
  Paper,
  TableContainer,
  Button,
  Typography,
} from "@mui/material";

const AdminMedicationUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<MedicationUpdate[]>([]);
  const [activeMedications, setActiveMedications] = useState<
    ActiveMedication[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    medicationId?: string;
    userId?: string;
    dateRange?: DateRangeFilter;
  }>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>("");

  // Fetch medications and users for dropdowns
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [medsResponse, usersResponse] = await Promise.all([
          activeMedicationApi.getAll(),
          userApi.getAll(),
        ]);
        setActiveMedications(medsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      let response;

      if (filter.medicationId) {
        response = await medicationUpdateApi.getByMedication(
          filter.medicationId
        );
      } else if (filter.userId) {
        response = await medicationUpdateApi.getByUser(filter.userId);
      } else if (filter.dateRange) {
        response = await medicationUpdateApi.getByDateRange(filter.dateRange);
      } else {
        response = await medicationUpdateApi.getAll();
      }

      setUpdates(response.data);
    } catch (error) {
      console.error("Error fetching updates:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch updates"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [filter]);

  const handleDateRangeFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFilter({
      dateRange: {
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await medicationUpdateApi.delete(id);
      setUpdates(updates.filter((update) => update._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update");
    }
  };

  const getUpdateTypeColor = (updateType: string) => {
    switch (updateType) {
      case "New Medication":
        return "bg-green-100 text-green-800";
      case "MedStock Increase":
        return "bg-blue-100 text-blue-800";
      case "MedStock Decrease":
        return "bg-yellow-100 text-yellow-800";
      case "Activated":
        return "bg-green-100 text-green-800";
      case "Deactivated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) return "None";
    if (typeof value === "object") {
      if (value.amount && value.unit) return `${value.amount} ${value.unit}`;
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (isLoading) return <div>Loading updates...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Medication Updates History
        </Typography>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) =>
            setFilter({ medicationId: e.target.value || undefined })
          }
          value={filter.medicationId || ""}
        >
          <option value="">All Medications</option>
          {activeMedications.map((med) => (
            <option key={med._id} value={med._id}>
              {med.medicationName}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFilter({ userId: e.target.value || undefined })}
          value={filter.userId || ""}
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user?.username || user?.email || "Unknown User"}
            </option>
          ))}
        </select>

        <form
          onSubmit={handleDateRangeFilter}
          className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Filter by Date
          </Button>
        </form>
      </div>

      {/* Updates Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
        <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8">
          <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Medication
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    User
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Changes
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Notes
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {updates.map((update) => (
                  <tr key={update._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">
                        {update.medication.medicationName}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {update.updatedBy?.username ||
                          update.updatedBy?.email ||
                          "Unknown User"}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                      {update.updatedBy?.username ||
                        update.updatedBy?.email ||
                        "Unknown User"}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getUpdateTypeColor(
                          update.updateType
                        )}`}
                      >
                        {update.updateType}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="max-w-xs text-sm">
                        {update.changes &&
                          Object.entries(update.changes).map(
                            ([field, change]) => (
                              <div key={field} className="mb-1">
                                <span className="font-medium capitalize">
                                  {field.replace(/([A-Z])/g, " $1").trim()}:
                                </span>{" "}
                                <span className="text-red-600">
                                  {formatChangeValue(change.oldValue)}
                                </span>
                                {" → "}
                                <span className="text-green-600">
                                  {formatChangeValue(change.newValue)}
                                </span>
                              </div>
                            )
                          )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                      {update.updateType.includes("MedStock")
                        ? update.notes
                        : "N/A"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => {
                          setSelectedUpdateId(update._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                        <span className="sr-only">Delete update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TableContainer>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Update
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this update? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button
                  variant="contained"
                  onClick={() => handleDelete(selectedUpdateId)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsDeleteModalOpen(false)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicationUpdatesPage;
