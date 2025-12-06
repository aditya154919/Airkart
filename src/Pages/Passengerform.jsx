
import React, { useState, useEffect, useContext } from "react";
import { useFlights } from "../Context/ApiContext";
import { GoArrowRight } from "react-icons/go";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Appcontext } from "../Context/Appcontext";
import { 
  Loader2, 
  User, 
  Mail, 
  CreditCard, 
  Users, 
  Calendar,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast"; 

const Passengerform = () => {
  const { city, passenger, setPassenger, discount, setBookedTickets } = useFlights();
  const { user, loggedIn } = useContext(Appcontext);
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, item } = location.state || {};

  //flght data
  const departureCity = city?.[0]?.departure?.[0]?.city || "Unknown";
  const arrivalCity = city?.[0]?.arrival?.[0]?.city || "Unknown";
  const flightLogo = item?.airline_logo;
  const farePrice = item?.price || 0;
  const departureTime = item?.flights[0]?.departure_airport?.time;
  const arrivalTime = item?.flights?.[item.flights.length - 1]?.arrival_airport?.time;
  const airline = flight?.airline;
  const flightNumber = flight?.flight_number;
 
  const basePrice = Math.floor((farePrice * 88) / 2);
  const gstRate = 0.07;
  const offer = discount || 0;
  const subtotal = passenger * basePrice;
  const gst = subtotal * gstRate;
  const total = subtotal + gst - offer;

  const [passengerData, setPassengerData] = useState([]);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    setPassengerData((prev) => {
      const newData = [...prev];
      while (newData.length < passenger) newData.push({});
      return newData.slice(0, passenger);
    });
  }, [passenger]);

  const handleInputChange = (index, field, value) => {
    const updated = [...passengerData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerData(updated);
  };

  const plusHandler = () => setPassenger(passenger + 1);
  const minusHandler = () => passenger > 1 && setPassenger(passenger - 1);

   //payment
  const paymentHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      allert("Please login to continue booking");
      return;
    }

    // Validation
    for (let i = 0; i < passenger; i++) {
      const p = passengerData[i] || {};
      if (!p.firstName || !p.lastname || !p.email || !p.age || !p.gender || !p.aadharNo) {
        toast.error(`Please fill all details for Passenger ${i + 1}`);
        return;
      }
    }

    setLoading(true); 

    try {
      const amountPaise = Math.round(total * 100);
      const payload = {
        amount: amountPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { passengers: passengerData },
      };

      const token = localStorage.getItem("accesstoken");
      const res = await axios.post(
        "https://airkart-backend.onrender.com/api/payment/createorder",
        payload,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (!data?.order?.id) throw new Error("Order ID missing");

      const options = {
        key: "rzp_test_Rmn6CDzCI0s7ZL", 
        amount: amountPaise,
        currency: "INR",
        name: "Airkart",
        description: "Flight Booking Transaction",
        image: "https://www.freeiconspng.com/uploads/airplane-png-25.png",
        order_id: data.order.id,
        
        handler: async function (response) {
          try {
             //Ticket Data
            const newTicket = {
              userid: user?._id,
              orderId: data.order.id,
              passengers: passengerData,
              flight: {
                departureCity,
                arrivalCity,
                airline,
                flightNumber,
                departureTime,
                arrivalTime,
              },
              bookingDate: new Date().toISOString(),
              totalAmount: total.toFixed(2),
            };

            const result = await axios.post(
              "https://airkart-backend.onrender.com/api/v1/book",
              newTicket
            );

            if (result.data.success) {
              setBookedTickets({
                flight,
                passengers: passengerData,
                total,
                departureCity,
                arrivalCity,
                flightLogo,
                departureTime,
                arrivalTime,
              });
              toast.success("Booking Confirmed!");
              navigate("/bookedticket", { state: { newTicket } });
            }
          } catch (error) {
            console.error(error);
            toast.error("Booking verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false); 
            toast("Payment Cancelled");
          }
        },
        prefill: {
          name: passengerData[0]?.firstName || user?.name,
          email: passengerData[0]?.email || user?.email,
          contact: user?.mobileNo || "",
        },
        theme: { color: "#2563eb" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        toast.error(response.error.description);
        setLoading(false);
      });
      
      rzp1.open();

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen backdrop-blur-2xl py-10 px-4 sm:px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-10 text-center"
      >
        <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-md border border-slate-100">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{departureCity}</h1>
          <div className="bg-blue-50 p-2 rounded-full text-blue-600">
             <GoArrowRight size={24} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{arrivalCity}</h1>
        </div>
        <p className="mt-4 text-slate-500 font-medium">Complete passenger details to proceed</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Users className="text-blue-600" size={20}/>
              <span>Passengers</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={minusHandler} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors">-</button>
              <span className="w-4 text-center font-bold text-lg">{passenger}</span>
              <button onClick={plusHandler} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-200">+</button>
            </div>
          </div>

          {passengerData.map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden"
            >
              <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-slate-700">Passenger Details</h3>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-5">
                <div className="space-y-4">
                    <InputField 
                        icon={<User size={18} />} 
                        placeholder="First Name" 
                        onChange={(e) => handleInputChange(idx, "firstName", e.target.value)} 
                    />
                     <InputField 
                        icon={<User size={18} />} 
                        placeholder="Last Name" 
                        onChange={(e) => handleInputChange(idx, "lastname", e.target.value)} 
                    />
                </div>
                
                <div className="space-y-4">
                    <InputField 
                        icon={<Mail size={18} />} 
                        placeholder="Email Address" 
                        type="email"
                        onChange={(e) => handleInputChange(idx, "email", e.target.value)} 
                    />
                    <div className="grid grid-cols-2 gap-4">
                         <InputField 
                            icon={<Calendar size={18} />} 
                            placeholder="Age" 
                            type="number"
                            onChange={(e) => handleInputChange(idx, "age", e.target.value)} 
                        />
                         <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            onChange={(e) => handleInputChange(idx, "gender", e.target.value)}
                         >
                             <option value="">Gender</option>
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                         </select>
                    </div>
                </div>
                <div className="md:col-span-2">
                     <InputField 
                        icon={<CreditCard size={18} />} 
                        placeholder="Aadhar Number (12 digits)" 
                        onChange={(e) => handleInputChange(idx, "aadharNo", e.target.value)} 
                        maxLength={12}
                    />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-10">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-green-500"/> Fare Summary
              </h2>
              
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Base Fare ({passenger} x ₹{basePrice})</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes & GST (7%)</span>
                  <span className="font-semibold">₹{gst.toFixed(2)}</span>
                </div>
                {offer > 0 && (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg">
                    <span className="font-medium">Discount Applied</span>
                    <span className="font-bold">- ₹{offer}</span>
                  </div>
                )}
                
                <div className="h-px bg-slate-200 my-4"></div>
                
                <div className="flex justify-between items-center text-lg md:text-xl font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={paymentHandler}
                disabled={loading }
                className={`w-full mt-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95
                  ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Proceed to Pay</>
                )}
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const InputField = ({ icon, className, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
      {icon}
    </div>
    <input 
      className={`w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700 ${className}`}
      {...props}
    />
  </div>
);

export default Passengerform;