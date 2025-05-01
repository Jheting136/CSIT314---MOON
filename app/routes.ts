import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("listings", "routes/ListingsPage.tsx"),
  route("login", "routes/LoginPage.tsx"),
  route("adminView", "routes/adminView.tsx"),
  route("viewUserProfile/:id", "routes/viewUserProfile.tsx"),
  route("test", "routes/testpage.tsx"),
  route("signup", "routes/SignupPage.tsx"),
  route("admin", "routes/admin.tsx"),
  route("cleaner", "routes/cleaner.tsx"),
  route("homeowner", "routes/homeowner.tsx"),

] satisfies RouteConfig;
