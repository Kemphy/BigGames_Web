import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BookingProvider } from "./context/BookingContext"
import { AuthProvider } from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </AuthProvider>
  </React.StrictMode>
)
