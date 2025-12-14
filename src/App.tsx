import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Payment from "./pages/Payment"
import Success from "./pages/Success"
import BookingDetail from "./pages/BookingDetail"
import Profile from "./pages/Profile"
import RequireAdmin from "./components/RequireAdmin"

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking/:id" element={<BookingDetail />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
