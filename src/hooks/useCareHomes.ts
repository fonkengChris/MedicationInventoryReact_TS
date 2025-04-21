import { useQuery } from "@tanstack/react-query";
import { careHomeApi } from "../services/rotaApi";
import { CareHome } from "../types/models";

const useCareHomes = () => {
  return useQuery<CareHome[], Error>({
    queryKey: ["careHomes"],
    queryFn: () => careHomeApi.getAll().then((res) => res.data),
  });
};

export default useCareHomes; 