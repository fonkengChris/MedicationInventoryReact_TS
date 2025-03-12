import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminMedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        const response = await medicationApi.getAll();
        if (Array.isArray(response.data)) {
          setMedications(response.data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch medications"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedications();
  }, []);

  if (isLoading) {
    return <div>Loading medications...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      await medicationApi.delete(id);
      setMedications(medications.filter((med) => med._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
          Medications Management
        </h1>
        <Link
          to="/admin/medications/new"
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          Add Medication
        </Link>
      </div>

      {medications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No medications found.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Dosage
                    </th>
                    <th className="hidden md:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Manufacturer
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {medications.map((medication) => (
                    <tr key={medication._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">
                          {medication.name}
                        </div>
                        <div className="sm:hidden text-gray-500 mt-1">
                          {medication.dosage}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                        {medication.dosage}
                      </td>
                      <td className="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                        {medication.manufacturer || "-"}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/medications/edit/${medication._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EditIcon className="h-5 w-5" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedMedicationId(medication._id!);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <DeleteIcon className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Medication
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this medication? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedicationId)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicationsPage;
