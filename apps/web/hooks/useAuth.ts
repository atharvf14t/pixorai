import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export function useAuth(): any {
  const { getToken, isSignedIn } = useClerkAuth();
  const { user } = useUser();

  return {
    getToken,
    isAuthenticated: !!isSignedIn,
    user,
  };
}
