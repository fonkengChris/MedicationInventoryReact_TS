import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentApi, serviceUserApi } from "../services/api";
import { Appointment, ServiceUser } from "../types/models";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  _id: string;
  role: string;
}

const AdminAppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [appointment, setAppointment] = useState<Partial<Appointment>>({
    serviceUser: "",
    appointmentType: "Medical",
    dateTime: "",
    duration: 30,
    location: "",
    provider: {
      name: "",
      role: "",
      contactNumber: "",
    },
    status: "Scheduled",
    notes: "",
  });

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

    if (id) {
      const fetchAppointment = async () => {
        try {
          const response = await appointmentApi.getById(id);
          const apt = response.data;
          setAppointment({
            ...apt,
            serviceUser: (apt.serviceUser as any)._id,
            dateTime: new Date(apt.dateTime).toISOString().slice(0, 16),
          });
        } catch (error) {
          console.error("Error fetching appointment:", error);
          navigate("/admin/appointments");
        }
      };
      fetchAppointment();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const decodedToken: DecodedToken = jwtDecode(token);

      if (id) {
        await appointmentApi.update(id, {
          ...appointment,
          updatedBy: decodedToken._id,
        });
      } else {
        await appointmentApi.create({
          ...(appointment as Omit<Appointment, "_id">),
          createdBy: decodedToken._id,
        });
      }
      navigate("/admin/appointments");
    } catch (error) {
      console.error("Error saving appointment:", error);
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
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("provider.")) {
      const field = name.split(".")[1];
      setAppointment((prev) => ({
        ...prev,
        provider: {
          ...prev.provider,
          [field]: value,
        },
      }));
    } else {
      setAppointment((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
        {id ? "Edit Appointment" : "Add Appointment"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service User
            </label>
            <select
              name="serviceUser"
              value={appointment.serviceUser as string}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select Service User</option>
              {serviceUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              name="appointmentType"
              value={appointment.appointmentType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              {["Medical", "Dental", "Therapy", "Review", "Other"].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={appointment.dateTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={appointment.duration}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={appointment.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Provider Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="provider.name"
                  value={appointment.provider?.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="provider.role"
                  value={appointment.provider?.role}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="provider.contactNumber"
                value={appointment.provider?.contactNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={appointment.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            >
              {[
                "Scheduled",
                "Completed",
                "Cancelled",
                "Rescheduled",
                "NoShow",
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={appointment.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/appointments")}
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
              ? "Update Appointment"
              : "Add Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAppointmentForm;
