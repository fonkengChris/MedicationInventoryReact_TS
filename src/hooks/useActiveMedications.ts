import { useQuery } from "@tanstack/react-query";
import { activeMedicationApi } from "../services/api";
import { ActiveMedication } from "../types/models";
import useMedicationQueryStore from "../stores/useMedicationQueryStore";

const useActiveMedications = () => {
  const buildQueryParams = useMedicationQueryStore((s) => s.buildQueryParams);

  return useQuery<ActiveMedication[], Error>({
    queryKey: ["activeMedications", buildQueryParams()],
    queryFn: () => activeMedicationApi.getAll().then((res) => res.data),
  });
};

export default useActiveMedications;
