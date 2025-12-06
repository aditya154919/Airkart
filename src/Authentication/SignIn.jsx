import React, { useContext, useState } from "react";
import axios from "axios";
import { MdAirplaneTicket, MdPayment } from "react-icons/md";
import { FaSuitcase } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Appcontext } from "../Context/Appcontext";
import { Loader2 } from "lucide-react";

const SignIn = () => {
  const { loggedIn, setLoggedIn, user, setUser } = useContext(Appcontext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    if (!user) {
      setLoggedIn(!loggedIn);
      setFormData({ name: "", email: "", password: "" });
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = loggedIn
        ? `https://airkart-backend.onrender.com/api/v1/login`
        : `https://airkart-backend.onrender.com/api/v1/signup`;

      const { data } = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (data.success) {
        setUser(data.user);
        setLoggedIn(true);

        setMessage(
          loggedIn
            ? "Login successful! Redirecting..."
            : "Account created successfully! Redirecting..."
        );

        setLoading(false);
        await new Promise((r) => setTimeout(r, 600));
        navigate("/");
      } else {
        setMessage(data.message || "Failed. Try again!");
        setLoading(false);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-[900px] bg-white shadow-2xl rounded-lg overflow-hidden"
      >
        <div className="bg-orange-600 text-white w-1/2 flex flex-col gap-10 px-10 py-12">
          <div className="flex items-center gap-3 text-2xl font-medium">
            <MdAirplaneTicket className="text-4xl bg-white/20 p-1 rounded-full" />
            Fast & easy flight bookings
          </div>
          <div className="flex items-center gap-3 text-2xl font-medium">
            <MdPayment className="text-4xl bg-white/20 p-1 rounded-full" />
            Seamless & secure payments
          </div>
          <div className="flex items-center gap-3 text-2xl font-medium">
            <FaSuitcase className="text-4xl bg-white/20 p-1 rounded-full" />
            Manage trips & get instant tickets
          </div>
        </div>

        <div className="w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-6">
            {loggedIn
              ? "Log in to Airkart ✈️"
              : "Create your Airkart Account 🚀"}
          </h2>

          <AnimatePresence mode="wait">
            <motion.form
              key={loggedIn ? "login" : "signup"}
              initial={{ opacity: 0, x: loggedIn ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: loggedIn ? -100 : 100 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {!loggedIn && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border p-3 rounded-md"
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="border p-3 rounded-md"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="border p-3 rounded-md"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white py-2 rounded-md font-semibold"
              >
                {loading ? "Please wait..." : loggedIn ? "Login" : "Sign Up"}
              </button>
            </motion.form>

            <p className="text-center mt-2">OR</p>

            <button
              className="w-full border p-2 rounded-md text-[18px] flex justify-center items-center gap-2"
              onClick={() =>
                window.open("https://airkart-backend.onrender.com/api/v1/auth/google", "_self")
              }
              disabled={loading} 
            >
              {loading ? (
                <Loader2 />
              ) : (
                <>
                  <img
                    src="/assets/Google.png"
                    className="w-5"
                    alt="Google logo"
                  />
                  {loggedIn ? "Login" : "Sign Up"} with Google
                </>
              )}
            </button>
          </AnimatePresence>

          {message && (
            <p className="text-center mt-3 text-red-600 text-sm">{message}</p>
          )}

          <div className="text-center mt-6">
            {loggedIn ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              className="text-orange-600 font-semibold"
              onClick={toggleForm}
            >
              {loggedIn ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
