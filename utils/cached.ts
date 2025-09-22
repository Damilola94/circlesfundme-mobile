import handleFetch from "@/services/api/handleFetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type UserResponse = {
  data?: {
    firstName: string;
    lastName: string;
    email: string;
    profilePictureUrl?: string;
    onboardingStatus?: string;
    isPaymentSetupComplete?: boolean;
  };
};

export function useUserData() {
  const queryClient = useQueryClient();

  const cachedUserData = queryClient.getQueryData<UserResponse>(["users-me"]);

  const { data: userData } = useQuery<UserResponse>({
    queryKey: ["users-me"],
    queryFn: () => handleFetch({ endpoint: "users/me", auth: true }),
    initialData: cachedUserData,
  });

  return userData;
}
