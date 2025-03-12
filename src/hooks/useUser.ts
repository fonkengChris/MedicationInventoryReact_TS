import { useQuery } from "@tanstack/react-query";
import { userApi } from "../services/api";
import { User } from "../types/models";
import ms from "ms";

const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ["user", id],
    queryFn: () => userApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("24h"),
  });
};

export default useUser;
