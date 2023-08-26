import { useState, useEffect } from "react";
import { Navigate, BrowserRouter as Router, json, useNavigate } from "react-router-dom";

export function Logout() {
  localStorage.clear()
  return (
      <Navigate to={"/"} />
  )
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("login");

    if (token === null) {
      navigate("/login");
    } else if (token) {
      if (JSON.parse(token).hak == "admin") {
        navigate("/Admin")
      } else {
        navigate("/app");
      }
    }

    // console.log(token);
  }, []);

  return;
}