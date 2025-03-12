import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "../services/api";
import { Appointment } from "../types/models";
import ms from "ms";

const useAppointment = (id: string) => {
  return useQuery<Appointment, Error>({
    queryKey: ["appointment", id],
    queryFn: () => appointmentApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("5m"),
  });
};

export default useAppointment;
