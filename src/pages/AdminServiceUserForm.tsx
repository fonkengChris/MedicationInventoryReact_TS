import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceUserApi, groupApi } from "../services/api";
import { ServiceUser, Group } from "../types/models";
import { jwtDecode } from "jwt-decode";
import { Grid, Button, Typography } from "@mui/material";

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminServiceUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [serviceUser, setServiceUser] = useState<Partial<ServiceUser>>({
    name: "",
    dateOfBirth: "",
    nhsNumber: "",
    address: "",
    phoneNumber: "",
    group: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (id) {
      const fetchServiceUser = async () => {
        try {
          const response = await serviceUserApi.getById(id);
          const user = response.data;
          setServiceUser({
            ...user,
            dateOfBirth: new Date(user.dateOfBirth).toISOString().split("T")[0],
          });
        } catch (error) {
          console.error("Error fetching service user:", error);
          navigate("/admin/service-users");
        }
      };
      fetchServiceUser();
    }
  }, [id, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (
        !serviceUser.name ||
        !serviceUser.dateOfBirth ||
        !serviceUser.nhsNumber ||
        !serviceUser.address ||
        !serviceUser.phoneNumber
      ) {
        throw new Error("Please fill in all required fields");
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: DecodedToken = jwtDecode(token);
      const currentUser = {
        userId: decodedToken._id,
        role: decodedToken.role,
      };

      if (id) {
        await serviceUserApi.update(id, {
          ...serviceUser,
          updatedBy: currentUser.userId,
        });
      } else {
        await serviceUserApi.create({
          ...(serviceUser as Omit<ServiceUser, "_id">),
          createdBy: currentUser.userId,
        });
      }
      navigate("/admin/service-users");
    } catch (error) {
      console.error("Error saving service user:", error);
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.includes("emergencyContact.")) {
      const field = name.split(".")[1];
      setServiceUser((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setServiceUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          {id ? "Edit Service User" : "Add Service User"}
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
                value={serviceUser.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={serviceUser.dateOfBirth}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NHS Number
              </label>
              <input
                type="text"
                name="nhsNumber"
                value={serviceUser.nhsNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={serviceUser.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={serviceUser.phoneNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                name="group"
                value={serviceUser.group as string}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select a Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={serviceUser.emergencyContact?.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={serviceUser.emergencyContact?.relationship}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phoneNumber"
                    value={serviceUser.emergencyContact?.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Button
                type="button"
                onClick={() => navigate("/admin/service-users")}
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
                  ? "Update Service User"
                  : "Add Service User"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default AdminServiceUserForm;
