
import React, { useContext, useEffect } from "react";
import { Appcontext } from "@/Context/Appcontext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const { setUser, setLoggedIn } = useContext(Appcontext);
  const navigate = useNavigate();

  useEffect(() => {
    const parseToken = () => {
      const search = new URLSearchParams(window.location.search);
      let token = search.get("token");

      if (!token && window.location.hash.includes("?token=")) {
        const hash = window.location.hash.split("?")[1];
        const params = new URLSearchParams(hash);
        token = params.get("token");
      }
      return token;
    };

    const run = async () => {
      const token = parseToken();
      console.log("🔥 Token found:", token);

      if (token) {
        // 👉 SAVE TOKEN TO LOCALSTORAGE
        localStorage.setItem("accesstoken", token);

        try {
          const res = await axios.get(
            "https://airkart-backend.onrender.com/api/v1/auth/me",
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          if (res.data?.success) {
            setUser(res.data.user);
            setLoggedIn(true);

            navigate("/");
            return;
          }
        } catch (err) {
          console.log("Header flow error:", err.response?.data);
        }
      }

      // fallback
      navigate("/login");
    };

    run();
  }, [setUser, setLoggedIn, navigate]);

  return <p>Finalizing login...</p>;
};

export default AuthSuccess;
