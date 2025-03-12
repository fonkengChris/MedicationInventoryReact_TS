import { useQuery } from "@tanstack/react-query";
import { groupApi } from "../services/api";
import { Group } from "../types/models";
import ms from "ms";

const useGroup = (id: string) => {
  return useQuery<Group, Error>({
    queryKey: ["group", id],
    queryFn: () => groupApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("1h"),
  });
};

export default useGroup;
