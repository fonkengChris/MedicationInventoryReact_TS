import { useQuery } from "@tanstack/react-query";
import { employeeApi } from "../services/rotaApi";
import { Employee } from "../types/models";

const useEmployees = (careHomeId: string) => {
  return useQuery<Employee[], Error>({
    queryKey: ["employees", careHomeId],
    queryFn: () => employeeApi.getByCareHome(careHomeId).then((res) => res.data),
    enabled: !!careHomeId,
  });
};

export default useEmployees; 