import { useQuery } from "@tanstack/react-query";
import { employeeApi } from "../services/rotaApi";
import { Employee } from "../types/models";
import ms from "ms";

const useEmployee = (id: string) => {
  return useQuery<Employee, Error>({
    queryKey: ["employee", id],
    queryFn: () => employeeApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("1h"),
  });
};

export default useEmployee; 