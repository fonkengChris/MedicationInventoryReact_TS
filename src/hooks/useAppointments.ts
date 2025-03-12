import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "../services/api";
import { Appointment } from "../types/models";

const useAppointments = () => {
  return useQuery<Appointment[], Error>({
    queryKey: ["appointments"],
    queryFn: () => appointmentApi.getAll().then((res) => res.data),
  });
};

export default useAppointments;
