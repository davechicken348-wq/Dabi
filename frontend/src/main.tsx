import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SchoolProvider } from "./context/SchoolContext";
import { FacilitiesProvider } from "./context/FacilitiesContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <FacilitiesProvider>
            <App />
          </FacilitiesProvider>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
