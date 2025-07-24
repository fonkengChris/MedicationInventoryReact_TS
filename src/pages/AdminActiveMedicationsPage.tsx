import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activeMedicationApi } from "../services/api";
import { ActiveMedication } from "../types/models";
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

const AdminActiveMedicationsPage: React.FC = () => {
  const [activeMedications, setActiveMedications] = useState<
    ActiveMedication[]
  >([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");

  useEffect(() => {
    const fetchActiveMedications = async () => {
      try {
        const response = await activeMedicationApi.getAll();
        setActiveMedications(response.data);
      } catch (error) {
        console.error("Error fetching active medications:", error);
      }
    };
    fetchActiveMedications();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await activeMedicationApi.delete(id);
      setActiveMedications(activeMedications.filter((med) => med._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting active medication:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Active Medications Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/active-medications/new"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Active Medication
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
        <Table className="min-w-full divide-y divide-gray-300">
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Service User
              </TableCell>
              <TableCell
                scope="col"
                className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900"
              >
                Medication Name
              </TableCell>
              <TableCell
                scope="col"
                className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900"
              >
                Dosage
              </TableCell>
              <TableCell
                scope="col"
                className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900"
              >
                Stock
              </TableCell>
              <TableCell
                scope="col"
                className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900"
              >
                Days Remaining
              </TableCell>
              <TableCell
                scope="col"
                className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900"
              >
                Status
              </TableCell>
              <TableCell scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-200 bg-white">
            {activeMedications.map((medication) => (
              <TableRow
                key={medication._id}
                className={`
                      ${
                        medication.daysRemaining < 5
                          ? "bg-red-200"
                          : medication.daysRemaining < 10
                          ? "bg-yellow-200"
                          : ""
                      }
                    `}
              >
                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">
                    {typeof medication.serviceUser === "object"
                      ? medication.serviceUser.name
                      : "Loading..."}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {medication.medicationName}
                </TableCell>
                <TableCell className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {`${medication.dosage.amount} ${medication.dosage.unit}`}
                </TableCell>
                <TableCell className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {medication.quantityInStock}
                </TableCell>
                <TableCell className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {medication.daysRemaining}
                </TableCell>
                <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      medication.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {medication.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/active-medications/edit/${medication._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EditIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedMedicationId(medication._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Active Medication
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this active medication?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(selectedMedicationId)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

export default AdminActiveMedicationsPage;
