import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi, groupApi } from "../services/api";
import { User, Group } from "../types/models";

const AdminUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<Partial<User>>({
    username: "",
    email: "",
    role: "user",
    groups: [],
  });

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

    if (id) {
      const fetchUser = async () => {
        try {
          const response = await userApi.getById(id);
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
          navigate("/admin/users");
        }
      };
      fetchUser();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await userApi.update(id, user);
      }
      navigate("/admin/users");
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setUser((prev) => ({
      ...prev,
      groups: selectedOptions,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
        Edit User
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superAdmin">Super Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Groups
          </label>
          <select
            multiple
            name="groups"
            value={user.groups as string[]}
            onChange={handleGroupChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base min-h-[120px]"
          >
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Hold Ctrl (Cmd on Mac) to select multiple groups
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? "Saving..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserForm;
