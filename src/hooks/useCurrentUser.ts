import { useQuery } from "@tanstack/react-query";
import { userApi, api } from "../services/api";
import { User } from "../types/models";
import { jwtDecode } from "jwt-decode";
import ms from "ms";

const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const decodedToken = jwtDecode(token);

      // First, try to get current user from /me endpoint
      try {
        const response = await userApi.getCurrentUser();
        return response.data;
      } catch (error) {
        // Fall back to ID-based approach
        const userId =
          (decodedToken as any).userId || (decodedToken as any)._id;

        if (!userId) {
          throw new Error("No user ID found in token");
        }

        try {
          const response = await userApi.getById(userId);
          return response.data;
        } catch (idError) {
          console.error("Error fetching current user by ID:", idError);
          throw idError;
        }
      }
    },
    enabled: !!localStorage.getItem("token"),
    staleTime: ms("1h"),
  });
};

export default useCurrentUser;
