import { useEffect, useState } from "react";
import { callApi } from "../utils/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  
  const exportToExcel = () => {
    const excelData = enrollments.map((enrollment) => ({
      Student: enrollment.user,
      Course: enrollment.course,
      Date: enrollment.date
        ? new Date(enrollment.date).toLocaleDateString()
        : "N/A",
      Amount: `Rs ${enrollment.amount}`,
      Status: enrollment.status || "Completed",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Enrollments"
    );
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Enrollments_Report.xlsx");
  };
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
        <button
          type="button"
          onClick={exportToExcel}
          className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">
          Export Report
        </button>
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