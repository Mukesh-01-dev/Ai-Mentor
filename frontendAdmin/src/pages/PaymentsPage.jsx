import { useEffect,useRef,  useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Filter,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import { callApi } from "../utils/api";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function PaymentsPage() {
  const [data, setData] = useState({ summary: {}, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

const [showFilterMenu, setShowFilterMenu] =useState(false);
const [filterType, setFilterType] =useState(null);
const [activeFilter, setActiveFilter] =useState("all");
const filterRef = useRef(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await callApi("/admin/payments?type=list");
        if (res.success) {
          setData({
            summary: res.summary || {},
            transactions: res.data || [],
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      exportRef.current &&
      !exportRef.current.contains(event.target)
    ) {
      setShowExportMenu(false);
    }
    if (
  filterRef.current &&
  !filterRef.current.contains(event.target)
  ) {
  setShowFilterMenu(false);
  setFilterType(null);
 }
  };
  document.addEventListener(
    "mousedown",
    handleClickOutside
  );
  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);
  const handleShowDetails = (payment) => {
  setSelectedPayment(payment);
  setShowModal(true);
  };

 const closeModal = () => {
   setShowModal(false);
   setSelectedPayment(null);
  };

 const exportToCSV = () => {
  const exportData = data.transactions.map((t) => ({
    Student: t.userName,
    Course: t.courseTitle,
    TransactionID: t.transactionId || t.paymentId,
    Date: t.purchaseDate
      ? new Date(t.purchaseDate).toLocaleString()
      : "Pending",
    Amount: t.amount,
    Status: t.status,
  }));
  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "payments-report.csv";
  link.click();
  setShowExportMenu(false);
};
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Payments Report", 14, 20);
  const rows = data.transactions.map((t) => [
    t.userName,
    t.courseTitle,
    t.transactionId || t.paymentId,
    t.purchaseDate
      ? new Date(t.purchaseDate).toLocaleString()
      : "Pending",
    `Rs ${t.amount}`,
    t.status,
  ]);
  autoTable(doc, {
    head: [[
      "Student",
      "Course",
      "Transaction ID",
      "Date",
      "Amount",
      "Status",
    ]],
    body: rows,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [20, 184, 166],
    },
    columnStyles: {
      2: {
        cellWidth: 45,
      },
    },
  });
  doc.save("payments-report.pdf");
  setShowExportMenu(false);
};

const filteredTransactions =
  data.transactions.filter((t) => {
    const amount = Number(t.amount || 0);
    const paymentDate = new Date(t.purchaseDate);
    const today = new Date();
    // TODAY
    if (activeFilter === "today") {
      return (
        paymentDate.toDateString() ===
        today.toDateString()
      );
    }
    // LAST 7 DAYS
    if (activeFilter === "last7days") {
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 7);
      return paymentDate >= last7Days;
    }
    // THIS MONTH
    if (activeFilter === "thisMonth") {
      return (
        paymentDate.getMonth() ===
          today.getMonth() &&
        paymentDate.getFullYear() ===
          today.getFullYear()
      );
    }
    if (activeFilter === "below500") {
      return amount < 500;
    }
    if (activeFilter === "between500And2000") {
      return amount >= 500 && amount <= 2000;
    }
    if (activeFilter === "above2000") {
      return amount > 2000;
    }
    return true;
  });

  if (loading)
    return (
      <div className="p-10 text-center text-muted">Loading payments...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Total Revenue
          </p>
          <p className="text-4xl font-black mt-2">
            Rs {data.summary.totalAmount || 0}
          </p>
        </article>
        <article className="rounded-2xl border border-border p-5">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Total Payments
          </p>
          <p className="text-4xl font-black mt-2 text-green-600">
            {data.summary.totalPayments || 0}
          </p>
        </article>
        <article className="rounded-2xl border border-border p-5 opacity-50">
          <p className="text-muted text-sm uppercase tracking-wider font-bold">
            Refunded
          </p>
          <p className="text-4xl font-black mt-2 text-red-600">Rs 0</p>
        </article>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight">
             Recent Transactions
            </h3>
       <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted bg-canvas-alt px-3 py-1 rounded-full uppercase tracking-widest">
               Live Updates
              </span>
              {/* FILTER DROPDOWN */}
   <div className="relative" ref={filterRef}>
     <button
       onClick={() => {
        setShowFilterMenu((prev) => !prev);
        setFilterType(null);
      }}
      className="h-11 px-5 rounded-2xl border border-border bg-card flex items-center gap-3 text-sm font-black uppercase tracking-widest text-main hover:bg-canvas-alt transition-all"
       >
      <Filter className="w-4 h-4 text-teal-500" />
      Filter
     <ChevronDown
      className={`w-4 h-4 transition-transform duration-200 ${
        showFilterMenu ? "rotate-180" : ""
      }`}
    />
  </button>
  {showFilterMenu && (
    <div className="absolute top-14 right-0 rounded-2xl border border-border bg-card shadow-2xl z-[400] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* MAIN FILTER OPTIONS */}
      {!filterType && (
        <div className="flex">
          <button
            onClick={() => setFilterType("date")}
            className="w-40 px-5 py-5 flex flex-col items-center justify-center gap-2 border-r border-border hover:bg-canvas-alt transition-all text-main"
          >
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-black uppercase tracking-widest">
              By Date
            </span>
          </button>
          <button
            onClick={() => setFilterType("amount")}
            className="w-40 px-5 py-5 flex flex-col items-center justify-center gap-2 hover:bg-canvas-alt transition-all text-main"
          >
            <IndianRupee className="w-5 h-5 text-green-500" />
            <span className="text-xs font-black uppercase tracking-widest">
              By Amount
            </span>
          </button>
        </div>
      )}
    {/* DATE FILTERS */}
    {filterType === "date" && (
     <div className="w-64">
       <button
          onClick={() => {
          setActiveFilter("today");
          setShowFilterMenu(false);
        }}
        className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
       >
         Today
      </button>
      <button
         onClick={() => {
          setActiveFilter("last7days");
          setShowFilterMenu(false);
        }}
       className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
      >
       Last 7 Days
    </button>
     <button
       onClick={() => {
         setActiveFilter("thisMonth");
         setShowFilterMenu(false);
       }}
       className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
      >
       This Month
     </button>
     <button
        onClick={() => {
         setActiveFilter("all");
         setShowFilterMenu(false);
       }}
       className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all border-t border-border"
      >
       Clear Filter
     </button>
    </div>
   )}
  {/* AMOUNT FILTERS */}
  {filterType === "amount" && (
   <div className="w-64">
     <button
        onClick={() => {
        setActiveFilter("below500");
        setShowFilterMenu(false);
       }}
       className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
      >
       Below ₹500
     </button>
     <button
        onClick={() => {
          setActiveFilter("between500And2000");
          setShowFilterMenu(false);
        }}
        className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
      >
      ₹500 - ₹2000
      </button>
      <button
        onClick={() => {
          setActiveFilter("above2000");
          setShowFilterMenu(false);
        }}
        className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
      >
         Above ₹2000
      </button>
       <button
          onClick={() => {
          setActiveFilter("all");
          setShowFilterMenu(false);
        }}
        className="w-full px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all border-t border-border"
        >
        Clear Filter
       </button>
       </div>
       )}
    </div>
  )}
</div>
    {/* EXPORT DROPDOWN */}
     <div className="relative" ref={exportRef}>
        <button
          onClick={() =>
           setShowExportMenu((prev) => !prev)
         }
         className="h-11 px-5 rounded-2xl border border-border bg-card flex items-center gap-3 text-sm font-black uppercase tracking-widest text-main hover:bg-canvas-alt transition-all"
       >
         <Download className="w-4 h-4 text-teal-500" />
         Export
         <ChevronDown
           className={`w-4 h-4 transition-transform duration-200 ${
             showExportMenu ? "rotate-180" : ""
           }`}
         />
       </button>
       {showExportMenu && (
         <div className="absolute top-14 right-0 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-[300] animate-in fade-in zoom-in-95 duration-200">
           <button
             onClick={exportToPDF}
             className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
           >
             <FileText className="w-4 h-4 text-red-500" />
             Download PDF
           </button>
           <button
             onClick={exportToCSV}
             className="w-full flex items-center gap-3 px-5 py-4 text-left text-sm font-bold text-main hover:bg-canvas-alt transition-all"
           >
             <FileSpreadsheet className="w-4 h-4 text-green-600" />
             Download CSV
           </button>
         </div>
       )}
     </div>
     </div>
   </div>

        <div className="divide-y divide-border/50">
          {data.transactions.length > 0 ? (
            filteredTransactions.map((t) => (
             
              <div
                key={t.paymentId}
                className="grid grid-cols-[1.5fr_1fr_auto] items-center gap-6 p-5 hover:bg-canvas-alt transition-colors"
              >
                {/* LEFT SECTION */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold uppercase text-[10px] shrink-0">
                    Pay
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-sm uppercase tracking-tight truncate">
                      {t.userName}
                    </p>

                    <p className="text-xs text-gray-500 font-medium truncate">
                      {t.courseTitle}
                    </p>

                    <p className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                      TXN ID: {t.transactionId || t.paymentId}
                    </p>
                  </div>
                </div>

                {/* MIDDLE SECTION */}
                <div className="text-center">
                  <p
                    className={`font-black text-sm ${
                      t.status === "paid" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    + Rs {t.amount}
                  </p>

                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {t.purchaseDate
                      ? new Date(t.purchaseDate).toLocaleDateString()
                      : "Pending"}
                  </p>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleShowDetails(t)}
                    className="h-10 px-4 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors font-semibold whitespace-nowrap"
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-muted italic text-sm">
              No transactions found.
            </div>
          )}
        </div>
      </div>
      {/* PAYMENT DETAILS MODAL */}
{showModal && selectedPayment && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* HEADER */}
      <div className="p-6 border-b border-border bg-linear-to-r from-teal-500/5 to-transparent flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-main">
            Payment Details
          </h2>
          <p className="text-xs text-muted mt-1 font-medium uppercase tracking-widest">
            Transaction Information
          </p>
        </div>
        <button
          onClick={closeModal}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>
      {/* BODY */}
      <div className="p-8 grid md:grid-cols-2 gap-6">
        {/* USER */}
        <div className="rounded-2xl border border-border bg-canvas p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
            User
          </p>
          <p className="text-lg font-bold text-main">
            {selectedPayment.userName}
          </p>
        </div>
        {/* COURSE */}
        <div className="rounded-2xl border border-border bg-canvas p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
            Course
          </p>
          <p className="text-lg font-bold text-main">
            {selectedPayment.courseTitle}
          </p>
        </div>
        {/* AMOUNT */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2">
            Amount
          </p>
          <p className="text-3xl font-black text-green-600">
            ₹ {selectedPayment.amount}
          </p>
        </div>
        {/* STATUS */}
        <div className="rounded-2xl border border-border bg-canvas p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
            Status
          </p>
          <span
            className={`inline-flex h-8 items-center px-4 rounded-xl text-[11px] font-black uppercase tracking-widest ${
              selectedPayment.status === "paid"
                ? "bg-green-500/10 text-green-600"
                : "bg-orange-500/10 text-orange-500"
            }`}
          >
            {selectedPayment.status}
          </span>
        </div>
        {/* TRANSACTION ID */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-canvas p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
            Transaction ID
          </p>
          <p className="font-mono text-sm break-all text-main">
            {selectedPayment.transactionId ||
              selectedPayment.paymentId}
          </p>
        </div>
        {/* DATE */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-canvas p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">
            Purchase Date
          </p>
          <p className="font-bold text-main">
            {selectedPayment.purchaseDate
              ? new Date(
                  selectedPayment.purchaseDate
                ).toLocaleString()
              : "Pending"}
          </p>
        </div>
      </div>
      {/* FOOTER */}
      <div className="border-t border-border p-6 flex justify-end">
        <button
          onClick={closeModal}
          className="h-12 px-6 rounded-2xl border border-border font-black uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
export default PaymentsPage;