"use client";
import { useState, useContext } from "react";
import { X } from "lucide-react";
import { db, auth } from "../app/fconfig";
import { addDoc, collection } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../context/ThemeContext";

// TypeScript interface for form data
interface MemberFormData {
  name: string;
  email: string;
  password: string;
  membership: string;
  status: string;
  statusColor: string;
}

interface RegisterMemberProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterMember({ isOpen, onClose }: RegisterMemberProps) {
  const context = useContext(ThemeContext);
  const { theme } = context || { theme: 'light' }; // Fallback to light theme
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MemberFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      membership: "Subadmin",
      status: "Active",
      statusColor: "text-green-500",
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    setFormError(null);
    try {
      // Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Add member to Firestore
      await addDoc(collection(db, "members"), {
        ...data,
        userId: user.uid,
        timestamp: new Date(),
      });

      // Add notification to Firestore
      await addDoc(collection(db, "notifications"), {
        text: `New member registered: ${data.name}`,
        timestamp: new Date(),
      });

      toast.success("Member registered successfully!");
      reset();
      onClose();
    } catch (error: any) {
      let errorMessage = error.message || "Failed to register member.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters.";
      } else if (error.code === "permission-denied") {
        errorMessage = "Permission denied: Unable to save data.";
      } else if (error.code === "unavailable") {
        errorMessage = "Firestore service is unavailable.";
      }
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-black/60'} flex items-center justify-center z-50 transition-opacity duration-300`}>
        <div
          className={`max-w-md w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-2xl p-6 shadow-2xl border relative transform transition-all duration-300 scale-100 animate-fade-in`}
        >
          <button
            onClick={() => {
              onClose();
              reset();
              setFormError(null);
            }}
            className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>Register New Member</h3>

          {formError && (
            <p className={`text-center mb-4 ${theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-500'} p-3 rounded-md`}>
              {formError}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} transition-all duration-200 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter name"
                aria-label="Name"
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                })}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email"
                aria-label="Email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Password</label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter password"
                aria-label="Password"
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Membership Type</label>
              <select
                {...register("membership", { required: "Membership type is required" })}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} transition-all duration-200 ${errors.membership ? 'border-red-500' : ''}`}
                aria-label="Membership Type"
                aria-describedby={errors.membership ? "membership-error" : undefined}
              >
                <option value="">Select Membership</option>
                <option value="Subadmin">Subadmin</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
              {errors.membership && (
                <p id="membership-error" className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.membership.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  reset();
                  setFormError(null);
                }}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-2 focus:ring-yellow-400' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Cancel registration"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-2 focus:ring-yellow-400' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Register member"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} theme={theme} />
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}