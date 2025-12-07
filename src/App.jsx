import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import OrganisationDetailsPage from "./pages/OrganisationDetailsPage.jsx";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route
          path="/organisations/:id"
          element={<OrganisationDetailsPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
