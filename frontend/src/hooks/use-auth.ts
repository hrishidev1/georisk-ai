import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, register as registerApi, getMe } from "@/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginRequest } from "@/types/auth";
import type { UserCreate } from "@/types/user";

export function useLogin() {
  const authLogin = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const tokenResponse = await loginApi(data);
      // Temporarily set token so getMe() can use it
      useAuthStore.getState().login(tokenResponse.access_token, {
        id: 0,
        email: "",
        full_name: null,
        is_active: true,
        created_at: "",
      });
      const user = await getMe();
      return { token: tokenResponse.access_token, user };
    },
    onSuccess: ({ token, user }) => {
      authLogin(token, user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: UserCreate) => registerApi(data),
  });
}

export function useCurrentUser() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await getMe();
      setUser(user);
      return user;
    },
    enabled: isHydrated && isAuthenticated,
    retry: false,
  });
}
