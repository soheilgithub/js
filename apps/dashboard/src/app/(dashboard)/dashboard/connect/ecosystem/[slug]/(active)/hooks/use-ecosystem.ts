import { useLoggedInUser } from "@3rdweb-sdk/react/hooks/useLoggedInUser";
import { useQuery } from "@tanstack/react-query";
import { FetchError } from "../../../../../../../../utils/error";
import type { Ecosystem } from "../../../types";

export function useEcosystem({
  slug,
  refetchInterval,
  refetchOnWindowFocus,
}: { slug: string; refetchInterval?: number; refetchOnWindowFocus?: boolean }) {
  const { isLoggedIn } = useLoggedInUser();

  const ecosystemQuery = useQuery({
    queryKey: ["ecosystems", slug],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_THIRDWEB_API_HOST}/v1/ecosystem-wallet/${slug}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const data = await res.json();
        console.error(data);
        throw new FetchError(
          res,
          data?.message ?? data?.error?.message ?? "Failed to fetch ecosystems",
        );
      }

      const data = (await res.json()) as { result: Ecosystem };
      return data.result;
    },
    enabled: isLoggedIn,
    retry: false,
    refetchInterval,
    refetchOnWindowFocus,
  });

  return {
    ...ecosystemQuery,
    error: ecosystemQuery.error as FetchError | undefined,
    ecosystem: ecosystemQuery.data,
  };
}
