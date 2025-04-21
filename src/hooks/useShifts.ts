import { useQuery } from "@tanstack/react-query";
import { shiftApi } from "../services/rotaApi";
import { Shift } from "../types/models";

const useShifts = (careHomeId: string) => {
  return useQuery<Shift[], Error>({
    queryKey: ["shifts", careHomeId],
    queryFn: () => shiftApi.getByCareHome(careHomeId).then((res) => res.data),
    enabled: !!careHomeId,
  });
};

export default useShifts; 