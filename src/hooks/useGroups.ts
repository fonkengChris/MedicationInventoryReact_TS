import { useQuery } from "@tanstack/react-query";
import { groupApi } from "../services/api";
import { Group } from "../types/models";

const useGroups = () => {
  return useQuery<Group[], Error>({
    queryKey: ["groups"],
    queryFn: () => groupApi.getAll().then((res) => res.data),
  });
};

export default useGroups;
