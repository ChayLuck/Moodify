import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* GLOBAL TOAST JSX — her sayfada otomatik gösterilir */}
      {toast.open && (
        <div className="fixed top-48 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
          <div
            className={`
              flex items-start gap-3 px-5 py-3 rounded-xl shadow-2xl border 
              backdrop-blur bg-black/90 text-white
              ${toast.type === "success" ? "border-indigo-400" : ""}
              ${toast.type === "error" ? "border-red-400" : ""}
              ${toast.type === "info" ? "border-blue-400" : ""}
            `}
          >
            <div className="text-sm max-w-sm">{toast.message}</div>

            <button
              onClick={() =>
                setToast((prev) => ({ ...prev, open: false }))
              }
              className="text-gray-400 hover:text-gray-200 text-lg leading-none ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
