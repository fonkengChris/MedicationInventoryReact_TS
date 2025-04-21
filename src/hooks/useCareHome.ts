import { useQuery } from "@tanstack/react-query";
import { careHomeApi } from "../services/rotaApi";
import { CareHome } from "../types/models";
import ms from "ms";

const useCareHome = (id: string) => {
  return useQuery<CareHome, Error>({
    queryKey: ["careHome", id],
    queryFn: () => careHomeApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("24h"),
  });
};

export default useCareHome; 