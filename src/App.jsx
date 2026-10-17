
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Rooms from "./pages/Rooms";
import Tenants from "./pages/Tenants";

import AddProperty from "./pages/AddProperty";
import AddRoom from "./pages/AddRoom";
import AddTenant from "./pages/AddTenant";

import TenantDetails from "./pages/TenantDetails";
import UpdateTenant from "./pages/UpdateTenant";

import Assignments from "./pages/Assignments";

import ElectricityMeters from "./pages/ElectricityMeters";
import ElectricityReadings from "./pages/ElectricityReadings";
import ElectricityBills from "./pages/ElectricityBills";

import Profile from "./pages/Profile";
import Subscriptions from "./pages/Subscriptions";

// Route protection
import ProtectedRoute from "./routes/protectRoutes";

// Shared dashboard layout
import DashboardLayout from "./components/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* AUTHENTICATION GUARD */}
        <Route element={<ProtectedRoute />}>

          {/* SHARED DASHBOARD LAYOUT */}
          <Route element={<DashboardLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Subscriptions */}
            <Route
              path="/subscriptions"
              element={<Subscriptions />}
            />

            {/* Properties */}
            <Route
              path="/properties"
              element={<Properties />}
            />

            <Route
              path="/properties/add"
              element={<AddProperty />}
            />

            {/* Rooms */}
            <Route
              path="/rooms"
              element={<Rooms />}
            />

            <Route
              path="/rooms/add"
              element={<AddRoom />}
            />

            {/* Tenants */}
            <Route
              path="/tenants"
              element={<Tenants />}
            />

            <Route
              path="/tenants/add"
              element={<AddTenant />}
            />

            <Route
              path="/tenants/:tenantId"
              element={<TenantDetails />}
            />

            <Route
              path="/tenants/:tenantId/edit"
              element={<UpdateTenant />}
            />

            {/* Assignments */}
            <Route
              path="/assignments"
              element={<Assignments />}
            />

            {/* Electricity */}
            <Route
              path="/electricity/meters"
              element={<ElectricityMeters />}
            />

            <Route
              path="/electricity/readings"
              element={<ElectricityReadings />}
            />

            <Route
              path="/electricity/bills"
              element={<ElectricityBills />}
            />

          </Route>
        </Route>

        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
