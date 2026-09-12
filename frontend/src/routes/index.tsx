import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import WelcomePage from '../marketing/welcome/WelcomePage';
import MarketingHome from '../marketing/home/Home';
import About from '../marketing/about/About';
import Contact from '../marketing/contact/Contact';
import FindRoomHome from '../findroom/home/FindRoomHome';
import Explore from '../findroom/explore/Explore';
import Rooms from '../findroom/rooms/Rooms';
import Map from '../findroom/map/Map';
import Locations from '../findroom/locations/Locations';
import RoomDetails from '../findroom/rooms/RoomDetails';
import MyEnquiries from '../findroom/enquiries/MyEnquiries';
import HelpPage from '../findroom/help/HelpPage';
import SavedRooms from '../findroom/saved/SavedRooms';
import RequestHelp from '../findroom/request/RequestHelp';
import { RouteError } from '../shared/RouteError/RouteError';
import AdminLogin from '../admin/Login/Login';
import AdminLayout from '../admin/AdminLayout';
import RequireAuth from '../admin/RequireAuth';
import Dashboard from '../admin/Dashboard/Dashboard';
import Hostels from '../admin/Hostels/Hostels';
import HostelManage from '../admin/Hostels/HostelManage';
import Owners from '../admin/Owners/Owners';
import ManagedHostels from '../admin/Owners/ManagedHostels';
import Enquiries from '../admin/Enquiries/Enquiries';
import Tenancies from '../admin/Tenancies/Tenancies';
import Deals from '../admin/Deals/Deals';
import Facilities from '../admin/Facilities/Facilities';
import Docs from '../admin/Docs/Docs';
import { FacilitiesProvider } from '../context/FacilitiesContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: 'marketing', element: <MarketingHome /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      {
        path: 'findroom',
        element: <FindRoomHome />,
      },
      { path: 'findroom/explore', element: <Explore /> },
      { path: 'findroom/rooms', element: <Rooms /> },
      { path: 'findroom/map', element: <Map /> },
      { path: 'findroom/locations', element: <Locations /> },
      { path: 'findroom/rooms/:id', element: <RoomDetails /> },
      { path: 'findroom/enquiries', element: <MyEnquiries /> },
      { path: 'findroom/help', element: <HelpPage /> },
      { path: 'findroom/saved', element: <SavedRooms /> },
      { path: 'findroom/request', element: <RequestHelp /> },
      { path: 'admin/login', element: <AdminLogin /> },
      {
        path: 'admin',
        element: <RequireAuth><FacilitiesProvider><AdminLayout /></FacilitiesProvider></RequireAuth>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'hostels', element: <Hostels /> },
          { path: 'hostels/new', element: <HostelManage /> },
          { path: 'hostels/:id/edit', element: <HostelManage /> },
          { path: 'owners', element: <Owners /> },
          { path: 'managed-hostels', element: <ManagedHostels /> },
          { path: 'enquiries', element: <Enquiries /> },
          { path: 'tenancies', element: <Tenancies /> },
          { path: 'deals', element: <Deals /> },
          { path: 'facilities', element: <Facilities /> },
          { path: 'docs', element: <Docs /> },
        ],
      },
    ],
  },
]);
