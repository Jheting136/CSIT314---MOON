// Router.tsx
import { BrowserRouter, useRoutes } from "react-router-dom";
import { appRoutes } from "./routes";

export default function AppRouter() {
  const routes = useRoutes(appRoutes);
  return routes;
}

// index.tsx or main.tsx
import ReactDOM from "react-dom/client";
import AppRouter from "./Router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
);
