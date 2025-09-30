import { useQuery } from "@tanstack/react-query";
import { serviceUserApi } from "../services/api";
import { ServiceUser } from "../types/models";

const useServiceUsers = () => {
  return useQuery<ServiceUser[], Error>({
    queryKey: ["serviceUsers"],
    queryFn: async () => {
      console.log("Fetching service users from API...");
      const response = await serviceUserApi.getAll();
      console.log("Service users API response:", response.data);
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });
};

export default useServiceUsers;
