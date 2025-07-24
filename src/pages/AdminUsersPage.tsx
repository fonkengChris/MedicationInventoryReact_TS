import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { userApi } from "../services/api";
import { User } from "../types/models";
import { FiTrash2 } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import EditIcon from "@mui/icons-material/Edit";
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

const AdminUsersPage: React.FC = () => {
  const token = localStorage.getItem("token");

  // Check for superAdmin access
  if (!token) return <Navigate to="/auth" />;

  try {
    const decodedToken: { role: string } = jwtDecode(token);
    if (decodedToken.role !== "superAdmin") {
      return <Navigate to="/admin" />;
    }
  } catch (error) {
    return <Navigate to="/auth" />;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.getAll();
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch users"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      setUsers(users.filter((user) => user._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          User Management
        </Typography>
      </div>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
        <Table className="min-w-full divide-y divide-gray-300">
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Email
              </TableCell>
              <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Role
              </TableCell>
              <TableCell className="hidden md:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Created At
              </TableCell>
              <TableCell className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">
                    {user.email}
                  </div>
                  <div className="sm:hidden mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/users/edit/${user._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EditIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <Button
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.role === "admin"}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      <FiTrash2 className="h-5 w-5" />
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
                    Delete User
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this user? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button
                  type="button"
                  onClick={() => handleDelete(selectedUserId)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

export default AdminUsersPage;
