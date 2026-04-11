export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
} as const;

export const publicRoutes = [routes.home, routes.login] as const;
