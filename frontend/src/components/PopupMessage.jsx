export default function PopupMessage({
  type,
  title,
  message,
  buttonText,
  onClose,
}) {
  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300">

      <div className="relative w-[420px] bg-white rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.25)] p-8 text-center overflow-hidden">

        {/* Glow */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl ${
            isSuccess ? "bg-primary/20" : "bg-red-500/20"
          }`}
        ></div>

        {/* Icon */}
        <div
          className={`mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full shadow-lg ${
            isSuccess
              ? "bg-gradient-to-br from-primary to-primary shadow-primary/40"
              : "bg-red-600 shadow-red-400/40"
          }`}
        >
          {isSuccess ? (
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
          {title}
        </h2>

        <p className="text-gray-500 mb-6 text-[15px] leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-3 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 ${
            isSuccess
              ? "bg-gradient-to-r from-primary to-primary shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03]"
              : "bg-red-600 shadow-red-400/40 hover:shadow-red-500/50 hover:scale-[1.03] hover:bg-red-700"
          }`}
        >
          {buttonText}
        </button>

      </div>
    </div>
  );
}