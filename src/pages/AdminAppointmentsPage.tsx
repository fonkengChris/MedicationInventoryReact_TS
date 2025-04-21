import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { appointmentApi } from "../services/api";
import { Appointment } from "../types/models";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const getStatusColor = (status: string, dateTime: string) => {
  const appointmentDate = new Date(dateTime);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if appointment is tomorrow (same day ignoring time)
  const isTomorrow = appointmentDate.toDateString() === tomorrow.toDateString();

  if (status === "Completed") {
    return "bg-green-50";
  } else if (status === "Cancelled" || status === "NoShow") {
    return "bg-red-50";
  } else if (isTomorrow) {
    return "bg-cyan-50";
  }
  return ""; // default with no background
};

const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentApi.getAll();
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await appointmentApi.delete(id);
      setAppointments(appointments.filter((apt) => apt._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
          Appointments Management
        </h1>
        <Link
          to="/admin/appointments/new"
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          Add Appointment
        </Link>
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="shadow-sm ring-1 ring-black ring-opacity-5">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 sm:pl-6">
                    Service User
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Date & Time
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Provider
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {appointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className={getStatusColor(
                      appointment.status,
                      appointment.dateTime
                    )}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">
                        {(appointment.serviceUser as any).name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {appointment.appointmentType}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(appointment.dateTime).toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {appointment.provider.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                          appointment.status,
                          appointment.dateTime
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/appointments/edit/${appointment._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EditIcon className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(appointment._id);
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Appointment
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this appointment? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedAppointmentId)}
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

export default AdminAppointmentsPage;
