import { useEffect, useState } from "react";
import { callApi } from "../utils/api";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);

        const response = await callApi("/admin/enrollments?type=list");

        const enrollmentsList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        setEnrollments(enrollmentsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

 const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Enrollments");

  worksheet.columns = [
    { header: "Student", key: "student", width: 20 },
    { header: "Course", key: "course", width: 20 },
    { header: "Date", key: "date", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  enrollments.forEach((enrollment) => {
    worksheet.addRow({
      student: enrollment.user,
      course: enrollment.course,
      date: enrollment.date
        ? new Date(enrollment.date).toLocaleDateString()
        : "N/A",
      amount: `Rs ${enrollment.amount}`,
      status: enrollment.status || "Completed",
    });
  });

  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Enrollments_Report.xlsx");
};

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Student",
      "Course",
      "Date",
      "Amount",
      "Status",
    ];

    const tableRows = enrollments.map((enrollment) => [
      enrollment.user,
      enrollment.course,
      enrollment.date
        ? new Date(enrollment.date).toLocaleDateString()
        : "N/A",
      `Rs ${enrollment.amount}`,
      enrollment.status || "Completed",
    ]);

    doc.text("Enrollments Report", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("Enrollments_Report.pdf");
  };

  // CSV Export
  const exportToCSV = () => {
  const csv = Papa.unparse(
    enrollments.map((e) => ({
      Student: e.user,
      Course: e.course,
      Date: e.date
        ? new Date(e.date).toLocaleDateString()
        : "N/A",
      Amount: `Rs ${e.amount}`,
      Status: e.status || "Completed",
    }))
  );

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "Enrollments_Report.csv");
}

  if (loading)
    return (
      <div className="p-10 text-center text-muted">
        Loading enrollments...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">
          All Enrollments
        </h2>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors"
          >
            Export Report
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border rounded-xl shadow-lg z-10 overflow-hidden">
              
              <button
                onClick={async() => {
                  await exportToExcel();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-3 hover:bg-canvas-alt transition-colors"
              >
                Download Excel
              </button>

              <button
                onClick={async() => {
                 await exportToPDF();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-3 hover:bg-canvas-alt transition-colors"
              >
                Download PDF
              </button>

              <button
                onClick={() => {
                  exportToCSV();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-3 hover:bg-canvas-alt transition-colors"
              >
                Download CSV
              </button>

            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-215">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Student</th>
              <th>Course</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment, index) => (
                <tr
                  key={`${enrollment.user}-${enrollment.course}-${index}`}
                  className="border-b border-border hover:bg-canvas-alt transition-colors"
                >
                  <td className="p-5">
                    <div className="font-medium">
                      {enrollment.user}
                    </div>

                    <div className="text-xs text-muted">
                      {enrollment.email}
                    </div>
                  </td>

                  <td>{enrollment.course}</td>

                  <td>
                    {enrollment.date
                      ? new Date(
                          enrollment.date
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="font-semibold">
                    Rs {enrollment.amount}
                  </td>

                  <td className="text-green-600">
                    {enrollment.status || "Completed"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-10 text-center text-muted italic"
                >
                  No enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default EnrollmentsPage;