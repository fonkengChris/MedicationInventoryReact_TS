import { useQuery } from "@tanstack/react-query";
import { serviceUserApi } from "../services/api";
import { ServiceUser } from "../types/models";
import ms from "ms";

const useServiceUser = (id: string) => {
  return useQuery<ServiceUser, Error>({
    queryKey: ["serviceUser", id],
    queryFn: () => serviceUserApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("1h"),
  });
};

export default useServiceUser;
