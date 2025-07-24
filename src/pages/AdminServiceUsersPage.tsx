import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { serviceUserApi } from "../services/api";
import { ServiceUser } from "../types/models";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";

const AdminServiceUsersPage: React.FC = () => {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const response = await serviceUserApi.getAll();
        setServiceUsers(response.data);
      } catch (error) {
        console.error("Error fetching service users:", error);
      }
    };
    fetchServiceUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await serviceUserApi.delete(id);
      setServiceUsers(serviceUsers.filter((user) => user._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting service user:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Service Users Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
          component={Link}
          to="/admin/service-users/new"
        >
          Add Service User
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
        <Table className="min-w-full divide-y divide-gray-300">
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Name
              </TableCell>
              <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                NHS Number
              </TableCell>
              <TableCell className="hidden md:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Date of Birth
              </TableCell>
              <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Phone
              </TableCell>
              <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Group
              </TableCell>
              <TableCell className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-200 bg-white">
            {serviceUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">
                    {user.name}
                  </div>
                  <div className="sm:hidden text-gray-500 mt-1">
                    {user.nhsNumber}
                    <br />
                    {user.phoneNumber}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                  {user.nhsNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                  {user.phoneNumber}
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                  {typeof user.group === "string"
                    ? user.group
                    : user.group!.name}
                </TableCell>
                <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/service-users/edit/${user._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EditIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedUserId(user._id);
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Service User
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this service user? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(selectedUserId)}
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

export default AdminServiceUsersPage;
