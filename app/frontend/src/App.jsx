import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModeSelectPage       from './pages/ModeSelectPage.jsx';
import CustomerOnboarding   from './pages/customer/CustomerOnboarding.jsx';
import CustomerLayout       from './components/layout/CustomerLayout.jsx';
import CustomerHome         from './pages/customer/CustomerHome.jsx';
import WishlistPage         from './pages/customer/WishlistPage.jsx';
import FeedPage             from './pages/customer/FeedPage.jsx';
import ChatPage             from './pages/customer/ChatPage.jsx';
import CustomerSettings     from './pages/customer/CustomerSettings.jsx';
import BusinessOnboarding   from './pages/business/BusinessOnboarding.jsx';
import BusinessLayout       from './components/layout/BusinessLayout.jsx';
import BusinessDashboard    from './pages/business/BusinessDashboard.jsx';
import CustomersPage        from './pages/business/CustomersPage.jsx';
import JourneysPage         from './pages/business/JourneysPage.jsx';
import CataloguePage        from './pages/business/CataloguePage.jsx';
import SupportPage          from './pages/business/SupportPage.jsx';
import useAppStore          from './store/appStore.js';

export default function App() {
  const { appMode, customerProfile, merchantProfile } = useAppStore();

  return (
    <Routes>
      {/* Entry */}
      <Route path="/"              element={<ModeSelectPage />} />
      <Route path="/customer/onboarding" element={<CustomerOnboarding />} />
      <Route path="/business/onboarding" element={<BusinessOnboarding />} />

      {/* Customer */}
      <Route
        path="/customer"
        element={customerProfile ? <CustomerLayout /> : <Navigate to="/customer/onboarding" replace />}
      >
        <Route index element={<CustomerHome />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="feed"     element={<FeedPage />} />
        <Route path="chat"     element={<ChatPage />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>

      {/* Business */}
      <Route
        path="/business"
        element={merchantProfile ? <BusinessLayout /> : <Navigate to="/business/onboarding" replace />}
      >
        <Route index element={<BusinessDashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="journeys"  element={<JourneysPage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="support"   element={<SupportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
