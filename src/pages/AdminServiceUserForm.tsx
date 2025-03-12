import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceUserApi, groupApi } from "../services/api";
import { ServiceUser, Group } from "../types/models";
import { jwtDecode } from "jwt-decode";

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
        {id ? "Edit Service User" : "Add Service User"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="sm:col-span-2">
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div className="sm:col-span-2">
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div className="sm:col-span-2 border-t pt-4 mt-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
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
              </div>

              <div>
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
              </div>

              <div>
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
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/service-users")}
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
              ? "Update Service User"
              : "Add Service User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminServiceUserForm;
