import { useQuery } from "@tanstack/react-query";
import { medicationApi } from "../services/api";
import { Medication } from "../types/models";

const useMedications = () => {
  return useQuery<Medication[], Error>({
    queryKey: ["medications"],
    queryFn: () => medicationApi.getAll().then((res) => res.data),
  });
};

export default useMedications;
