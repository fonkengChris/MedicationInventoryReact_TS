import { useQuery } from "@tanstack/react-query";
import { serviceUserApi, api } from "../services/api";
import { ServiceUser } from "../types/models";
import initialServiceUsers from "../data/serviceUsers";

const useServiceUsers = () => {
  return useQuery<ServiceUser[], Error>({
    queryKey: ["serviceUsers"],
    queryFn: async () => {
      console.log("Fetching service users from API...");
      try {
        const response = await serviceUserApi.getAll();
        console.log("Service users API response:", response.data);
        console.log(
          "Service users with groups:",
          response.data.map((su) => ({
            name: su.name,
            group: su.group,
            groupType: typeof su.group,
          }))
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching service users:", error);
        // Use initial data as fallback
        const fallbackData = initialServiceUsers
          .filter((user) => user.group?.$oid) // Only include users with valid groups
          .map((user) => ({
            ...user,
            _id: user._id.$oid,
            dateOfBirth: user.dateOfBirth.$date,
            createdAt: new Date(user.createdAt.$date),
            group: user.group?.$oid || undefined,
          })) as ServiceUser[];
        console.log(
          "Using initial data:",
          fallbackData.map((su) => ({
            name: su.name,
            group: su.group,
            groupType: typeof su.group,
          }))
        );
        return fallbackData;
      }
    },
    initialData: initialServiceUsers
      .filter((user) => user.group?.$oid) // Only include users with valid groups
      .map((user) => ({
        ...user,
        _id: user._id.$oid,
        dateOfBirth: user.dateOfBirth.$date,
        createdAt: new Date(user.createdAt.$date),
        group: user.group?.$oid || undefined,
      })) as ServiceUser[],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });
};

export default useServiceUsers;
