import { useQuery } from "@tanstack/react-query";
import { serviceUserApi } from "../services/api";
import { ServiceUser } from "../types/models";
import initialServiceUsers from "../data/serviceUsers";
import ms from "ms";

const useServiceUser = (id: string) => {
  return useQuery<ServiceUser, Error>({
    queryKey: ["serviceUser", id],
    queryFn: () => serviceUserApi.getById(id).then((res) => res.data),
    initialData: () => {
      const user = initialServiceUsers.find((user) => user._id.$oid === id);
      if (!user) return undefined;
      return {
        ...user,
        _id: user._id.$oid,
        dateOfBirth: user.dateOfBirth.$date,
        createdAt: new Date(user.createdAt.$date),
        group: user.group?.$oid,
      } as ServiceUser;
    },
    enabled: !!id,
    staleTime: ms("1h"),
  });
};

export default useServiceUser;
