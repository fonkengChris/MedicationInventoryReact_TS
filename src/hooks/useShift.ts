import { useQuery } from "@tanstack/react-query";
import { shiftApi } from "../services/rotaApi";
import { Shift } from "../types/models";
import ms from "ms";

const useShift = (id: string) => {
  return useQuery<Shift, Error>({
    queryKey: ["shift", id],
    queryFn: () => shiftApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("5m"),
  });
};

export default useShift; 