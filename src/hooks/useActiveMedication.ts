import { useQuery } from "@tanstack/react-query";
import { activeMedicationApi } from "../services/api";
import { ActiveMedication } from "../types/models";
import ms from "ms";

const useActiveMedication = (id: string) => {
  return useQuery<ActiveMedication, Error>({
    queryKey: ["activeMedication", id],
    queryFn: () => activeMedicationApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: ms("1m"), // Short stale time as this data changes frequently
  });
};

export default useActiveMedication;
