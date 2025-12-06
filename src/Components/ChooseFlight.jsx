
import React, { useContext, useState } from "react";
import { GoArrowRight } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";
import { useFlights } from "../Context/ApiContext";
import { GiSchoolBag } from "react-icons/gi";
import { BsFillSuitcaseFill, BsClockHistory } from "react-icons/bs";
import { RiCoupon3Fill } from "react-icons/ri";
import { Appcontext } from "../Context/Appcontext";
import { Plane, Tag, CheckCircle2 } from "lucide-react"; 

const ChooseFlight = () => {
  const { city, setDiscount } = useFlights();
  const location = useLocation();
  const { flight, item } = location.state || {};
  const navigate = useNavigate();
  const { loggedIn } = useContext(Appcontext);

  const [selectedOffer, setSelectedOffer] = useState("");

  if (!flight && !item)
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        No flight selected. Please go back.
      </div>
    );


  const departureCity = city?.[0]?.departure?.[0]?.city || "Unknown";
  const arrivalCity = city?.[0]?.arrival?.[0]?.city || "Unknown";
  
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const offers = [
    {
      code: "INSTANT",
      discountLabel: "₹305 Off",
      amount: 305,
      description: "Get instant discount + Hotel voucher.",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      code: "NEWFLY",
      discountLabel: "₹190 Off",
      amount: 190,
      description: "Special discount for new flyers.",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      code: "IXYESD",
      discountLabel: "8% Off",
      amount: 465,
      description: "Flat 8% Off with Yes Bank Credit Card.",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
  ];

  const handleOfferSelect = (offer) => {
    if (selectedOffer === offer.code) {
      // Deselect
      setSelectedOffer("");
      setDiscount(0);
    } else {
      setSelectedOffer(offer.code);
      setDiscount(offer.amount);
    }
  };

  const handleProceed = () => {
    if (loggedIn) {
      navigate("/flightdetails", { state: { flight, item } });
    } else {
      navigate("/login");
    }
  };

  const basePrice = item?.price ? Math.floor((item.price * 88) / 2) : 0;

  return (
    <div className="min-h-screen backdrop-blur-lg py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-slate-800">
                <h1>{departureCity}</h1>
                <GoArrowRight className="text-slate-400" />
                <h1>{arrivalCity}</h1>
              </div>
              <p className="text-slate-500 font-medium mt-1">
                {formatDate(flight?.departure_airport?.time || item?.flights?.[0]?.departure_airport?.time)} 
                <span className="mx-2">•</span> 
                {item?.layovers?.length > 0 ? `${item.layovers.length} Stop(s)` : "Non-stop"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100/50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Departure Flight</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Confirmed</span>
            </div>
            <div className="p-6 space-y-8">
              {item?.flights && item.flights.length > 0 ? (
                item.flights.map((segment, index) => (
                  <div key={index}>
                    <FlightSegment 
                      data={segment} 
                      logo={item.airline_logo} 
                    />
                    {index < item.flights.length - 1 && item.layovers[index] && (
                      <div className="relative py-6">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>
                        <div className="relative z-10 ml-16 bg-orange-50 border border-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
                           <BsClockHistory />
                           Layover at <span className="font-bold">{item.layovers[index]?.name}</span> 
                           for {formatDuration(item.layovers[index]?.duration)}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <FlightSegment 
                  data={flight} 
                  logo={item.airline_logo} 
                  isNonStop={true}
                  duration={item.total_duration}
                />
              )}
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
               <div className="flex items-center gap-2">
                  <BsFillSuitcaseFill className="text-blue-500"/>
                  <span>Check-in: <strong>15kg</strong></span>
               </div>
               <div className="flex items-center gap-2">
                  <GiSchoolBag className="text-blue-500"/>
                  <span>Cabin: <strong>7kg</strong></span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">Class:</span>
                  <span>{flight?.travel_class || "Economy"}</span>
               </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Fare Summary</h2>
             
             <div className="flex justify-between items-center mb-2 text-slate-600">
                <span>Base Fare</span>
                <span className="font-semibold">₹{basePrice.toLocaleString()}</span>
             </div>
             
             {selectedOffer && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                   <span className="flex items-center gap-1"><RiCoupon3Fill/> Discount</span>
                   <span className="font-semibold">- ₹{offers.find(o => o.code === selectedOffer)?.amount}</span>
                </div>
             )}
             
             <div className="h-px bg-slate-200 my-4"></div>
             
             <div className="flex justify-between items-center text-xl font-bold text-slate-900 mb-6">
                <span>Total</span>
                <span>₹{(basePrice - (selectedOffer ? offers.find(o => o.code === selectedOffer)?.amount : 0)).toLocaleString()}</span>
             </div>

             <button 
               onClick={handleProceed}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95"
             >
               {loggedIn ? "Proceed to Book" : "Login to Continue"}
               <GoArrowRight size={20}/>
             </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-blue-500" /> 
              Offers & Promo Codes
            </h3>

            <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Enter Code" 
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
                <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition">Apply</button>
            </div>

            <div className="space-y-3">
               {offers.map((offer) => {
                  const isSelected = selectedOffer === offer.code;
                  return (
                    <div 
                      key={offer.code}
                      onClick={() => handleOfferSelect(offer)}
                      className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 group
                        ${isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                      `}
                    >
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                                {isSelected && <CheckCircle2 size={12} className="text-white"/>}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800">{offer.code}</h4>
                                <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
                             </div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${offer.color}`}>
                             {offer.discountLabel}
                          </span>
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const FlightSegment = ({ data, logo, isNonStop, duration }) => {
   return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-3 md:w-1/4">
             <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-md bg-white p-1 border border-slate-100" />
             <div>
                <p className="font-bold text-slate-800">{data?.airline}</p>
                <p className="text-xs text-slate-500 font-medium">{data?.flight_number}</p>
             </div>
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
             <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{formatTime(data?.departure_airport?.time)}</p>
                <p className="text-sm text-slate-500 font-bold">{data?.departure_airport?.id}</p>
             </div>
             <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-xs text-slate-400 mb-1">
                   {isNonStop && duration ? duration : (data?.duration ? `${Math.floor(data.duration/60)}h ${data.duration%60}m` : '')}
                </p>
                <div className="w-full flex items-center relative">
                   <div className="h-[2px] w-full bg-slate-200"></div>
                   <Plane className="absolute left-1/2 -translate-x-1/2 text-blue-500 bg-white p-0.5 rotate-90" size={20} fill="currentColor"/>
                   <div className="h-2 w-2 rounded-full bg-slate-300 absolute left-0"></div>
                   <div className="h-2 w-2 rounded-full bg-slate-300 absolute right-0"></div>
                </div>
                <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-wide">
                   {isNonStop ? "Non Stop" : "Flight"}
                </p>
             </div>

             <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{formatTime(data?.arrival_airport?.time)}</p>
                <p className="text-sm text-slate-500 font-bold">{data?.arrival_airport?.id}</p>
             </div>
          </div>
      </div>
   );
};
const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
};

export default ChooseFlight;