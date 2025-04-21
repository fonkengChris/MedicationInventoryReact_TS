import { useQuery } from "@tanstack/react-query";
import { rotaApi } from "../services/rotaApi";
import { Rota } from "../types/models";

const useRotas = (careHomeId: string) => {
  return useQuery<Rota[], Error>({
    queryKey: ["rotas", careHomeId],
    queryFn: () => rotaApi.getAllByHome(careHomeId).then((res) => res.data),
    enabled: !!careHomeId,
  });
};

export default useRotas; 