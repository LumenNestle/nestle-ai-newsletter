import { useQuery } from "@tanstack/react-query";
import { listBlockDefinitions } from "../api/blocks";

export function useBlockDefinitions() {
    return useQuery({
        queryKey: ["block-definitions"],
        queryFn: listBlockDefinitions,
        staleTime: Infinity, // son estáticos, no cambian entre deploys
    });
}
