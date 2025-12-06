import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Appcontext } from "../Context/Appcontext";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { LogOut, Ticket, User } from "lucide-react";

const Navbar = ({ openNav, setOpenNav }) => {
  const navigate = useNavigate();
  const { loggedIn, setLoggedIn, user, setUser } = useContext(Appcontext);
  const token = localStorage.getItem("accesstoken");

  async function logoutHandler() {
    try {
      await axios.post(
        "https://airkart-backend.onrender.com/api/v1/logout",
        {},
        { headers: {
          Authorization: `Bearer ${token}`
        }, withCredentials: true }
      );

      setUser(null);
      setLoggedIn(false);
      localStorage.removeItem("accesstoken");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  }

  return (
    <div className="flex flex-row backdrop-blur-4xl md:justify-around justify-between md:p-0">
      <div
        className="p-2 flex flex-row items-center justify-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <p className="text-white md:text-2xl font-bold text-3xl">
          Air<span className="text-orange-400">/</span>kart
        </p>
      </div>
      <div className="md:flex items-center justify-center hidden">
        <ul className="flex flex-row gap-4 text-white text-2xl font-bold">
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `${isActive ? "text-sky-500" : "text-white"} cursor-pointer`
            }
          >
            Home
          </NavLink>

          <NavLink
            to={"/about"}
            className={({ isActive }) =>
              `${isActive ? "text-sky-500" : "text-white"} cursor-pointer`
            }
          >
            About
          </NavLink>

          <NavLink
            to={"/contact"}
            className={({ isActive }) =>
              `${isActive ? "text-sky-500" : "text-white"} cursor-pointer`
            }
          >
            Contact
          </NavLink>
        </ul>
      </div>

      <div className="flex items-center justify-center rounded-full gap-4">
        <div className="flex items-center justify-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  {user?.avatar ? (
                    <AvatarImage className="cursor-pointer" src={user.avatar} />
                  ) : (
                    <AvatarFallback className="cursor-pointer">
                      {(user?.name || user?.displayName || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => navigate(`/profile/${user?._id}`)}
                >
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => navigate("/bookedticket")}
                >
                  <Ticket />
                  Ticket
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <LogOut />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="bg-white/70 backdrop-blur-3xl px-3 py-2 text-xl cursor-pointer rounded-md text-sky-600 font-semibold"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
