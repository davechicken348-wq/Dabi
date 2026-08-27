import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Welcome from "../pages/Welcome/Welcome";
import Home from "../pages/Home/Home";
import FindHostel from "../pages/FindHostel/FindHostel";
import HostelDetails from "../pages/HostelDetails/HostelDetails";
import Locations from "../pages/Locations/Locations";
import HowItWorks from "../pages/HowItWorks/HowItWorks";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import AdminLayout from "../admin/AdminLayout";
import RequireAuth from "../admin/RequireAuth";
import Login from "../admin/Login/Login";
import Dashboard from "../admin/Dashboard/Dashboard";
import Hostels from "../admin/Hostels/Hostels";
import HostelManage from "../admin/Hostels/HostelManage";
import Enquiries from "../admin/Enquiries/Enquiries";
import Owners from "../admin/Owners/Owners";
import ManagedHostels from "../admin/Owners/ManagedHostels";
import Deals from "../admin/Deals/Deals";
import Tenancies from "../admin/Tenancies/Tenancies";
import Facilities from "../admin/Facilities/Facilities";
import Docs from "../admin/Docs/Docs";

export const routes: RouteObject[] = [
  { path: "/", element: <Welcome /> },
  { path: "/home", element: <Home /> },
  { path: "/find-hostel", element: <FindHostel /> },
  { path: "/hostel/:id", element: <HostelDetails /> },
  { path: "/locations", element: <Locations /> },
  { path: "/how-it-works", element: <HowItWorks /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/admin/login", element: <Login /> },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "hostels", element: <Hostels /> },
      { path: "hostels/new", element: <HostelManage /> },
      { path: "hostels/:id/edit", element: <HostelManage /> },
      { path: "enquiries", element: <Enquiries /> },
      { path: "tenancies", element: <Tenancies /> },
      { path: "owners", element: <Owners /> },
      { path: "managed-hostels", element: <ManagedHostels /> },
      { path: "deals", element: <Deals /> },
       { path: "facilities", element: <Facilities /> },
       { path: "docs", element: <Docs /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
