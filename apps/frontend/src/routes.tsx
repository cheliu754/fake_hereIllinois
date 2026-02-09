import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AttendancePage } from "./pages/AttendancePage";
import { LogsPage } from "./pages/LogsPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AttendancePage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
