import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { groupApi } from "../services/api";
import { Group, User } from "../types/models";
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

const AdminGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupApi.getAll();
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await groupApi.delete(id);
      setGroups(groups.filter((group) => group._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Groups Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/groups/new"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Group
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 500, sm: 800 } } }}>
        <Table className="min-w-full divide-y divide-gray-300">
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 sm:pl-6">
                Name
              </TableCell>
              <TableCell className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Description
              </TableCell>
              <TableCell className="hidden md:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Created By
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
            {groups.map((group) => (
              <TableRow key={group._id}>
                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">
                    {group.name}
                  </div>
                  <div className="sm:hidden text-gray-500 mt-1">
                    {group.description}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                  {group.description}
                </TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {typeof group.createdBy === "object" &&
                  group.createdBy !== null
                    ? (group.createdBy as User).username
                    : group.createdBy}
                </TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(group.createdAt!).toLocaleDateString()}
                </TableCell>
                <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/groups/edit/${group._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EditIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedGroupId(group._id);
                        setIsDeleteModalOpen(true);
                      }}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
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
                    Delete Group
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this group? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(selectedGroupId)}
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

export default AdminGroupsPage;
