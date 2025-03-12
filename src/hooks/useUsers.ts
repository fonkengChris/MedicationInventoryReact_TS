import { useQuery } from "@tanstack/react-query";
import { userApi } from "../services/api";
import { User } from "../types/models";

const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: () => userApi.getAll().then((res) => res.data),
  });
};

export default useUsers;
