import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Payment from "./pages/Payment"
import Success from "./pages/Success"
import BookingDetail from "./pages/BookingDetail"
import Profile from "./pages/Profile"
import FoodMenu from "./pages/FoodMenu"
import FoodCheckout from "./pages/FoodCheckout"
import FoodSuccess from "./pages/FoodSuccess"
import BookingGuide from "./pages/BookingGuide"
import PromoPage from "./pages/PromoPage"
import LocationContact from "./pages/LocationContact"
import RequireAdmin from "./components/RequireAdmin"

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        {/* User Routes with Navbar */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/booking/:id" element={<MainLayout><BookingDetail /></MainLayout>} />
        <Route path="/payment/:id" element={<MainLayout><Payment /></MainLayout>} />
        <Route path="/success/:id" element={<MainLayout><Success /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        
        {/* Food & Beverage Routes */}
        <Route path="/food" element={<MainLayout><FoodMenu /></MainLayout>} />
        <Route path="/food/checkout" element={<MainLayout><FoodCheckout /></MainLayout>} />
        <Route path="/food/success" element={<MainLayout><FoodSuccess /></MainLayout>} />

        {/* FAQ Routes */}
        <Route path="/booking-guide" element={<MainLayout><BookingGuide /></MainLayout>} />
        <Route path="/promo" element={<MainLayout><PromoPage /></MainLayout>} />
        <Route path="/location" element={<MainLayout><LocationContact /></MainLayout>} />

        {/* Admin Routes without Navbar - Full Page */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout>
                <Admin />
              </AdminLayout>
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
