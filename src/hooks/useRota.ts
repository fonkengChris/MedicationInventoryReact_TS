import { useQuery } from "@tanstack/react-query";
import { rotaApi } from "../services/rotaApi";
import { Rota } from "../types/models";
import ms from "ms";

const useRota = (careHomeId: string, weekStart: string) => {
  return useQuery<Rota, Error>({
    queryKey: ["rota", careHomeId, weekStart],
    queryFn: () => rotaApi.getByWeek(careHomeId, weekStart).then((res) => res.data),
    enabled: !!(careHomeId && weekStart),
    staleTime: ms("5m"),
  });
};

export default useRota; 