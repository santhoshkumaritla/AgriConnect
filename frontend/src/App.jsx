import { Navigate, Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Marketplace from './pages/marketplace/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import Cart from './pages/marketplace/Cart';
import Wishlist from './pages/marketplace/Wishlist';
import Orders from './pages/marketplace/Orders';
import Equipment from './pages/equipment/Equipment';
import Consultations from './pages/consultations/Consultations';
import Forum from './pages/forum/Forum';
import AiLab from './pages/ai/AiLab';
import EducationHub from './pages/education/EducationHub';
import Analytics from './pages/analytics/Analytics';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import DeliveryTracking from './pages/DeliveryTracking';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import FarmerProfile from './pages/FarmerProfile';
import ManageProducts from './pages/farmer/ManageProducts';
import FarmProfile from './pages/farmer/FarmProfile';
import DashboardRedirect from './components/DashboardRedirect';
import RoleRouteOutlet, { RoleIndexRedirect } from './components/RoleRouteOutlet';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import ConsumerDashboard from './pages/dashboards/ConsumerDashboard';
import ExpertDashboard from './pages/dashboards/ExpertDashboard';
import DeliveryDashboard from './pages/dashboards/DeliveryDashboard';
import OwnerDashboard from './pages/dashboards/OwnerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* ——— Consumer ——— */}
        <Route path="/consumer" element={<RoleRouteOutlet role="consumer" />}>
          <Route index element={<RoleIndexRedirect role="consumer" />} />
          <Route path="dashboard" element={<ConsumerDashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:id" element={<ProductDetail />} />
          <Route path="farmers/:id" element={<FarmerProfile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<Orders />} />
          <Route path="chat" element={<Chat />} />
          <Route path="payment" element={<Payment />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ——— Farmer ——— */}
        <Route path="/farmer" element={<RoleRouteOutlet role="farmer" />}>
          <Route index element={<RoleIndexRedirect role="farmer" />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:id" element={<ProductDetail />} />
          <Route path="farmers/:id" element={<FarmerProfile />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="farm" element={<FarmProfile />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="orders" element={<Orders />} />
          <Route path="chat" element={<Chat />} />
          <Route path="ai" element={<AiLab />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ——— Expert ——— */}
        <Route path="/expert" element={<RoleRouteOutlet role="expert" />}>
          <Route index element={<RoleIndexRedirect role="expert" />} />
          <Route path="dashboard" element={<ExpertDashboard />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="education" element={<EducationHub />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ——— Delivery partner ——— */}
        <Route path="/delivery-partner" element={<RoleRouteOutlet role="delivery" />}>
          <Route index element={<RoleIndexRedirect role="delivery" />} />
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="deliveries" element={<DeliveryTracking />} />
          <Route path="orders" element={<Orders />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ——— Equipment owner ——— */}
        <Route path="/equipment-owner" element={<RoleRouteOutlet role="equipment_owner" />}>
          <Route index element={<RoleIndexRedirect role="equipment_owner" />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ——— Admin ——— */}
        <Route path="/admin" element={<RoleRouteOutlet role="admin" />}>
          <Route index element={<RoleIndexRedirect role="admin" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="forum" element={<Forum />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
