import { useQuery } from "@tanstack/react-query";
import { serviceUserApi } from "../services/api";
import { ServiceUser } from "../types/models";
import initialServiceUsers from "../data/serviceUsers";

const useServiceUsers = () => {
  return useQuery<ServiceUser[], Error>({
    queryKey: ["serviceUsers"],
    queryFn: () => serviceUserApi.getAll().then((res) => res.data),
    initialData: initialServiceUsers as ServiceUser[],
  });
};

export default useServiceUsers;
