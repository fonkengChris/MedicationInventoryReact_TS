import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Button,
  Typography,
} from "@mui/material";

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
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Medications Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
          component={Link}
          to="/admin/medications/new"
        >
          Add Medication
        </Button>
      </div>

      {medications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No medications found.</p>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
          <Table className="min-w-full divide-y divide-gray-300">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                  Dosage
                </TableCell>
                <TableCell className="hidden md:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                  Manufacturer
                </TableCell>
                <TableCell className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-200 bg-white">
              {medications.map((medication) => (
                <TableRow key={medication._id}>
                  <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">
                      {medication.name}
                    </div>
                    <div className="sm:hidden text-gray-500 mt-1">
                      {medication.dosage}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                    {medication.dosage}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                    {medication.manufacturer || "-"}
                  </TableCell>
                  <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="text"
                        color="primary"
                        component={Link}
                        to={`/admin/medications/edit/${medication._id}`}
                      >
                        <EditIcon className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => {
                          setSelectedMedicationId(medication._id!);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <DeleteIcon className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(selectedMedicationId)}
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

export default AdminMedicationsPage;
