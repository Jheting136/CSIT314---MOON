import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("listings", "routes/ListingsPage.tsx"),
  route("login", "routes/LoginPage.tsx"),
  route("adminView", "routes/adminView.tsx"),
  route("viewUserProfile/:id", "routes/viewUserProfile.tsx"),
  route("signup", "routes/SignupPage.tsx"),
  route("admin", "routes/admin.tsx"),
  route("cleaner", "routes/cleaner.tsx"),
  route("homeowner", "routes/homeowner.tsx"),
  route("editUser/:id", "routes/EditUser.tsx"),
  route('userHistory/:id', 'routes/UserHistory.tsx'),
  route("test", "routes/testpage.tsx"), //put all your routes above here testpage is not for production
] satisfies RouteConfig;
