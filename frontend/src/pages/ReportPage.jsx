import React, { useState } from "react";
import { Flag, Mail, Phone, FileText, Award, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import API_BASE_URL from "../lib/api";
import FloatingAssistant from "../components/common/FloatingAssistant";

const ReportPage = () => {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (
      !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone.trim()) ||
      (form.phone.trim().match(/\d/g) || []).length < 10
    )
      return "Please enter a valid phone number (min. 10 digits).";
    if (!form.description.trim()) return "Please describe your complaint.";
    if (form.description.trim().length < 20) return "Description must be at least 20 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/course-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: "certificate",
          subType: "certificate_complaint",
          description: form.description,
          email: form.email,
          phone: form.phone,
          courseName: "Certificate Issue",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to submit report. Please try again.");
      }

      setSuccess(true);
      setForm({ email: "", phone: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-3xl p-12 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-main mb-3">
            Report Submitted
          </h2>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Your certificate complaint has been submitted successfully. Our admin team will review it shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-8 py-3 bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
            <Flag className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-main">
              Report
            </h1>
            <p className="text-muted text-xs uppercase tracking-widest mt-0.5">
              Certificate Issues
            </p>
          </div>
        </div>

        {/* Certificate badge */}
        <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-500">
            Certificate Report
          </span>
        </div>

        <p className="text-muted text-sm mt-5 leading-relaxed">
          Use this form to report any issues or complaints related to your certificates —
          such as incorrect details, missing certificates, or delivery problems.
          Our admin team will review your submission and respond promptly.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-canvas-alt border border-border rounded-2xl pl-11 pr-4 py-4 text-sm text-main placeholder:text-muted/50 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-canvas-alt border border-border rounded-2xl pl-11 pr-4 py-4 text-sm text-main placeholder:text-muted/50 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted mb-2">
              Report <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-muted pointer-events-none" />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Please describe your certificate issue in detail..."
                className="w-full bg-canvas-alt border border-border rounded-2xl pl-11 pr-4 py-4 text-sm text-main placeholder:text-muted/50 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all resize-none"
              />
            </div>
            <p className="text-[10px] text-muted mt-1.5 ml-1">
              Minimum 20 characters. Be as specific as possible.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>

      {/* Note */}
      <p className="text-center text-[11px] text-muted mt-6 leading-relaxed">
        Reports are reviewed within 24–48 hours. For urgent issues, contact support directly.
      </p>
    </div>
    <FloatingAssistant />
    </main>
  );
};

export default ReportPage;