import React, { useContext, useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Fingerprint,
  User,
  Camera,
  Plane,
  MapPin,
  ShieldCheck,
  Calendar,
  Loader2,
} from "lucide-react";

import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { useParams } from "react-router-dom";
import { Appcontext } from "@/Context/Appcontext";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const Profile = () => {
  const { user, setUser } = useContext(Appcontext);
  const [ticket, setTicket] = useState([]);
  const [loading, setLoading] = useState(true);

  // to extract Time
  const getTime = (dateString) => {
    if (!dateString) return "00:00";
    return dateString.split(" ")[1];
  };

  function convertToDDMMYY(dateInput) {
  // Create a Date object from the input
  const date = new Date(dateInput);

  // Safety check: ensure the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Extract parts and pad with '0' if necessary
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-11
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits

  return `${day}/${month}/${year}`;
}



  //  to extract Date
  const getDate = (dateString) => {
    if (!dateString) return "Date";
    return dateString.split(" ")[0];
  };

  // Helper to get City Code
  const getCityCode = (cityName) => {
    if (!cityName) return "CIT";
    return cityName.substring(0, 3).toUpperCase();
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `https://airkart-backend.onrender.com/api/ticket/user/${user._id}`
        );
        const data = await res.json();
        if (data.success) {
          setTicket(data.tickets);
          console.log("Fetched tickets:", data.tickets);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);



  const currentTicket = ticket[0];

  const params = useParams();
  const userId = params.userId;

  const [updateUser, setUpdateUser] = useState({
    name: user?.name,
    email: user?.email,
    age: user?.age,
    dateOfBirth: user?.dateOfBirth,
    password: "xxxxxx",
    mobileNo: user?.mobileNo,
    aadharNo: user?.aadharNo,
    avatar: user?.avatar,
  });

  const [file, setfile] = useState(null);

  const handleChange = (e) => {
    setUpdateUser({ ...updateUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setfile(selectedFile);
    setUpdateUser({ ...updateUser, avatar: URL.createObjectURL(selectedFile) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(updateUser);

    const accesstoken = localStorage.getItem("accesstoken");
    setLoading(true)
    try {
      //use formdata for text + file
      const formData = new FormData();
      formData.append("name", updateUser.name);
      formData.append("age", updateUser.age);
      formData.append("email", updateUser.email);
      formData.append("password", updateUser.password);
      formData.append("aadharNo", updateUser.aadharNo);
      formData.append("mobileNo", updateUser.mobileNo);
      formData.append("dateOfBirth", updateUser.dateOfBirth);
      formData.append("avatar", updateUser.avatar);

      if (file) {
        formData.append("file", file); //img file for multer
      }
      const res = await axios.put(
        `https://airkart-backend.onrender.com/api/v1/update/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
      toast.error("failed to update profile");
    } finally{
      setLoading(false);
      
    }
  };

  return (
    <div className="p-1 min-h-screen rounded-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <Tabs defaultValue="profile" className="max-w-7xl mx-auto items-center">
        <TabsList className="bg-sky-400">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="update">Update</TabsTrigger>
        </TabsList>

        <TabsContent
          value="update"
          className="focus-visible:outline-none focus-visible:ring-0 mt-3"
        >
          <div className="mx-auto bg-white/95 rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-100 overflow-hidden ">
            <div className="flex flex-col md:flex-row min-h-[550px]">
              <div className="w-full md:w-xs p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <div className="relative group cursor-pointer ">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>

                  <img
                    src={updateUser?.avatar}
                    alt="profile"
                    className="relative h-40 w-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <label className="absolute bottom-1 right-1 bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110 border-4 border-white z-10">
                    <Camera size={20} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-lg font-bold text-gray-800">
                    Change Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-2 px-4 leading-relaxed font-medium">
                    Accepts JPG, GIF or PNG.
                    <br />
                    Max file size 1 MB.
                  </p>
                </div>
              </div>

              <div className="w-full md:max-w-xl p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                      Edit Profile
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Update your personal details below.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      value={updateUser.name}
                      onChange={handleChange}
                      placeholder="aditya kumar"
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bateofbirth"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Date Of Birth
                    </Label>
                    <Input
                      id="name"
                      type="date"
                      name="dateOfBirth"
                      value={updateUser.dateOfBirth}
                      onChange={handleChange}
                      placeholder="aditya kumar"
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={updateUser.email}
                      onChange={handleChange}
                      placeholder="aditya225500@gmail.com"
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="tel"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="tel"
                      type="tel"
                      name="mobileNo"
                      value={updateUser.mobileNo}
                      onChange={handleChange}
                      placeholder="Enter your phine no"
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="age"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      name="age"
                      value={updateUser.age}
                      onChange={handleChange}
                      placeholder="19"
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="aadhar"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Aadhar Number
                    </Label>
                    <Input
                      id="aadhar"
                      placeholder="1122 3344 5566"
                      name="aadharNo"
                      value={updateUser.aadharNo}
                      onChange={handleChange}
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 font-mono tracking-wide transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      New Password{" "}
                      <span className="font-normal text-gray-400 ml-1">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      name="password"
                      value={updateUser.password}
                      onChange={handleChange}
                      className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-slate-50/30 transition-all"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-10  border-t border-slate-100">
                  <button
                    className="bg-sky-600 hover:bg-sky-700 min-w-2 rounded-xl text-white  px-3 py-2 shadow-lg shadow-sky-200 transition-all active:scale-95"
                    onClick={handleSubmit}
                  >
                    {
                      loading ? <Loader2 className="md:min-w-0"/> :"Save Change"
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-8">
          <div className="w-full font-sans">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-100 overflow-hidden relative">
              {/* Decorative Header */}
              <div className="h-32 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 relative">
                <div className="absolute inset-0 opacity-10"></div>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* LEFT SIDE: User Identity */}
                <div className="md:w-1/3 flex flex-col items-center -mt-16 px-8 pb-8 border-r border-slate-100">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                    <img
                      src={user?.avatar || "/assets/profile.png"}
                      alt="Profile"
                      className="relative h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg z-10"
                    />
                    <div className="absolute bottom-2 right-2 z-20 h-5 w-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    {user?.name}
                  </h2>
                  <span className="mt-2 px-3 py-1 bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-wider rounded-full border border-sky-100 flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified User
                  </span>

                  <div className="mt-3">
                    <p className="text-gray-500 font-medium">
                      1 Trip = 75 points
                    </p>
                  </div>

                  <div className="mt-8 w-full flex justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-center w-1/2 border-r border-slate-200">
                      <p className="text-2xl font-bold text-slate-700">
                        {ticket.length}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Trips
                      </p>{" "}
                    </div>
                    <div className="text-center w-1/2">
                      <p className="text-2xl font-bold text-sky-600">
                        {ticket.length * 75}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Points
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Details & Ticket */}
                <div className="md:w-2/3 p-8">
                  {/* Personal Info Grid */}
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <User size={16} /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem
                        icon={<Mail size={18} />}
                        label="Email"
                        value={user?.email}
                      />
                      <DetailItem
                        icon={<Phone size={18} />}
                        label="Phone"
                        value={user?.mobileNo}
                      />
                      <DetailItem
                        icon={<Fingerprint size={18} />}
                        label="Aadhar"
                        value={user?.aadharNo}
                        isMono={true}
                      />
                      <DetailItem
                        icon={<Calendar size={18} />}
                        label="Date of Birth"
                        value={convertToDDMMYY(user?.dateOfBirth)}
                      />
                    </div>
                  </div>

                  {/* UPCOMING TRAVEL SECTION */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Plane size={16} /> Upcoming Travel
                    </h3>

                    {/* Check if we have ticket data */}
                    {currentTicket ? (
                      <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-3 flex justify-between items-center text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center font-bold text-xs backdrop-blur-sm">
                              {currentTicket.flight?.airline
                                ?.substring(0, 2)
                                .toUpperCase() || "FL"}
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-medium">
                                Flight
                              </p>
                              <p className="font-bold text-sm tracking-wide">
                                {currentTicket.flight?.airline}{" "}
                                {currentTicket.flight?.flightNumber}
                              </p>
                            </div>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-500/30 font-bold uppercase tracking-wider">
                            Confirmed
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Origin */}
                            <div className="text-left">
                              <p className="text-3xl font-black text-slate-800">
                                {getCityCode(
                                  currentTicket.flight?.departureCity
                                )}
                              </p>
                              <p className="text-xs text-slate-500 font-medium uppercase mt-1">
                                {currentTicket.flight?.departureCity}
                              </p>
                              <p className="text-lg font-bold text-sky-600 mt-1">
                                {getTime(currentTicket.flight?.departureTime)}
                              </p>
                            </div>

                            {/* Center Icon */}
                            <div className="flex-1 px-4 flex flex-col items-center">
                              
                              <div className="w-full relative flex items-center">
                                <div className="h-[2px] w-full bg-slate-200"></div>
                                <Plane
                                  className="absolute inset-0 m-auto text-sky-500 rotate-90 md:rotate-0 bg-white p-1"
                                  size={24}
                                  fill="currentColor"
                                />
                              </div>
                              <p className="text-xs text-slate-400 mt-2 font-medium">
                                {getDate(currentTicket.flight?.departureTime)}
                              </p>
                            </div>

                            {/* Destination */}
                            <div className="text-right">
                              <p className="text-3xl font-black text-slate-800">
                                {getCityCode(currentTicket.flight?.arrivalCity)}
                              </p>
                              <p className="text-xs text-slate-500 font-medium uppercase mt-1">
                                {currentTicket.flight?.arrivalCity}
                              </p>
                              <p className="text-lg font-bold text-sky-600 mt-1">
                                {getTime(currentTicket.flight?.arrivalTime)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-slate-50 p-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                              Gate
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              T3
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                              Amount
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              ₹{currentTicket.totalAmount}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                              Class
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              Eco
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Empty State
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
                        No upcoming trips found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DetailItem = ({ icon, label, value, isMono = false }) => (
  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
    <div className="p-3 bg-white border border-slate-100 rounded-lg text-sky-500 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm font-bold text-slate-800 mt-0.5 ${
          isMono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  </div>
);



export default Profile;
