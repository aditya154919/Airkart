import React, { useEffect, useState, useRef, useContext } from "react";
import { Appcontext } from "../Context/Appcontext";
import Barcode from "react-barcode";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Plane,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  Ticket as TicketIcon,
} from "lucide-react";

const getStableDetails = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);

  const rows = (positiveHash % 30) + 1;
  const cols = ["A", "B", "C", "D", "E", "F"];
  const col = cols[positiveHash % cols.length];

  const gates = (positiveHash % 20) + 1;
  const terminal = (positiveHash % 3) + 1;

  return {
    seat: `${rows}${col}`,
    gate: `G${gates}`,
    terminal: `T${terminal}`,
  };
};

const formatDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const BookedTicket = () => {
  const { user } = useContext(Appcontext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `https://airkart-backend.onrender.com/api/ticket/user/${user._id}`
        );
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 ">
        <TicketIcon size={48} className="text-slate-400" />
        <h2 className="text-xl font-bold text-slate-600">Please login to view tickets</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 ">
        <div className="bg-white p-4 rounded-full shadow mb-2">
          <Plane size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Upcoming Trips</h2>
        <p className="text-slate-500 text-sm">You haven't booked any flights yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">My Boarding Passes</h1>
        </div>

        <div className="space-y-6">
          {tickets.map((ticket, idx) => {
            const { flight, passengers, flightLogo } = ticket;

            return passengers.map((p, pIdx) => {
              const uniqueSeed = `${flight.flightNumber}-${p.firstName}-${pIdx}`;
              const { seat, gate, terminal } = getStableDetails(uniqueSeed);
              const depCode = flight.departureCity.substring(0, 3).toUpperCase();
              const arrCode = flight.arrivalCity.substring(0, 3).toUpperCase();

              return (
                <TicketCard
                  key={`${idx}-${pIdx}`}
                  passenger={p}
                  flight={flight}
                  seat={seat}
                  gate={gate}
                  terminal={terminal}
                  depCode={depCode}
                  arrCode={arrCode}
                  logo={flightLogo}
                />
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

const TicketCard = ({
  passenger,
  flight,
  seat,
  gate,
  terminal,
  depCode,
  arrCode,
  logo,
}) => {
  const barcodeValue = `${passenger.firstName}/${flight.flightNumber}/${seat}`;
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        // This filter excludes the button from the screenshot
        filter: (node) => !node.classList?.contains('hide-on-download')
      });

      const link = document.createElement("a");
      link.download = `BoardingPass_${passenger.firstName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row print:shadow-none border border-slate-200"
    >
      <div className="flex-1 p-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-6 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <Plane size={16} className="text-blue-600" />
            )}
            <p className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              {flight.airline}
            </p>
          </div>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">
            {flight.flightNumber}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-none">{depCode}</h2>
            <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
              {flight.departureCity}
            </p>
          </div>

          <div className="flex-1 px-4 flex flex-col items-center opacity-40">
            <Plane className="rotate-90 text-slate-800" size={20} />
            <div className="w-full h-px bg-slate-300 mt-1 border-b border-dashed border-slate-500"></div>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-800 leading-none">{arrCode}</h2>
            <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
              {flight.arrivalCity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-y-2 gap-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="col-span-2">
            <p className="text-[9px] uppercase font-bold text-slate-400">Passenger</p>
            <p className="font-bold text-slate-800 text-xs truncate">
              {passenger.firstName} {passenger.lastName}
            </p>
          </div>
          <div>
             <p className="text-[9px] uppercase font-bold text-slate-400">Date</p>
             <p className="font-bold text-slate-800 text-xs">{formatDate()}</p>
          </div>
          
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400">Flight Time</p>
            <p className="font-bold text-blue-600 text-xs">{flight.departureTime}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400">Gate</p>
            <p className="font-bold text-slate-800 text-xs">{gate}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400">Seat</p>
            <p className="font-black text-lg text-blue-600 leading-none">{seat}</p>
          </div>
        </div>
        <div className="absolute -right-2 top-1/2 w-4 h-4 bg-slate-100 rounded-full z-10 hidden md:block shadow-inner"></div>
      </div>

      <div className="relative md:w-56 bg-slate-800 text-white p-4 flex flex-col justify-between items-center md:border-l-2 md:border-dashed md:border-slate-600">
        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-slate-100 rounded-full z-10 hidden md:block shadow-inner"></div>
        <div className="w-full text-center">
            <div className="flex justify-center items-center gap-1 opacity-75 mb-1">
                <Clock size={12} />
                <span className="text-[10px] font-bold uppercase">Boarding</span>
            </div>
            <p className="text-xl font-bold">{flight.departureTime}</p>
        </div>

        <div className="bg-white p-1 rounded my-3 w-full flex justify-center overflow-hidden">
          <Barcode
            value={barcodeValue}
            format="CODE128"
            width={1}
            height={30} 
            displayValue={false}
            lineColor="#000"
            background="#fff"
            margin={0}
          />
        </div>
        <div className="w-full hide-on-download">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2 rounded text-[10px] font-bold transition-all active:scale-95"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <Download size={12} />
            )}
            {isDownloading ? "Saving..." : "Save Ticket"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookedTicket;