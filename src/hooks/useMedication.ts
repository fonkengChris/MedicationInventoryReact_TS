import { useQuery } from "@tanstack/react-query";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";
import ms from "ms";

const useMedication = (id: string) => {
  return useQuery<Medication, Error>({
    queryKey: ["medication", id],
    queryFn: () => medicationApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("5m"),
  });
};

export default useMedication;
