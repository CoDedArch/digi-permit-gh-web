"use client";
import DigiLogo from "../../_component/images/digi-logo";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRef } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

// type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone" | "google";

const AuthForm = () => {
  const { refetch } = useAuth();
  // const [authMode, setAuthMode] = useState<AuthMode>("login");
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [otpSendSuccess, setOtpSendSuccess] = useState(false);
  const [otpVerifiedSuccess, setOtpVerifiedSuccess] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [otpHasExpired, setOtpHasExpired] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const otpRefs = useRef<HTMLInputElement[]>([]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, "").split("").slice(0, 6); // Only digits, max 6

    if (digits.length === 1) {
      // Single digit input, update current index
      const newOtp = formData.otp.split("");
      newOtp[index] = digits[0];
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));

      // Move to next box
      if (index < 5) otpRefs.current[index + 1]?.focus();
    } else if (digits.length === 6) {
      // Full OTP pasted
      setFormData((prev) => ({ ...prev, otp: digits.join("") }));

      // Fill inputs and blur last field
      digits.forEach((digit, i) => {
        otpRefs.current[i]?.setSelectionRange(1, 1);
      });
      otpRefs.current[5]?.blur();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (pasted.length === 6) {
      e.preventDefault(); // Stop default paste
      setFormData((prev) => ({ ...prev, otp: pasted }));

      pasted.split("").forEach((digit, i) => {
        if (otpRefs.current[i]) {
          otpRefs.current[i]!.value = digit;
        }
      });
      otpRefs.current[5]?.blur();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = formData.otp.split("");
      newOtp[index] = "";
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));

      if (index > 0 && !formData.otp[index]) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (!formData.otp) {
        // Phase 1: Send OTP
        const res = await fetch(`${NEXT_PUBLIC_API_URL}auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: authMethod === "phone" ? formData.phone : formData.email,
            channel: authMethod === "phone" ? "sms" : "email",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          // If the server provides a specific error message, show it
          const errorMessage =
            data?.detail ||
            "Failed to send Verification Code. Please try again.";
          setError(errorMessage);
          setSuccess("");
          return;
        }
        setSuccess(data.message);
        console.log("OTP Sent:", data.message);

        setOtpSendSuccess(true);

        // Reveal OTP input
        setFormData((prev) => ({ ...prev, otp: "" }));
      } else {
        const res = await fetch(`${NEXT_PUBLIC_API_URL}auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: authMethod === "phone" ? formData.phone : formData.email,
            otp: formData.otp,
            remember: formData.rememberMe,
          }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          // If the server provides a specific error message, show it
          const errorMessage =
            data?.detail || "OTP verification failed. Please try again.";
          if (data?.detail === "OTP has expired.") {
            setOtpHasExpired(true);
            setOtpSendSuccess(false);
            formData.otp = "";
          }
          setError(errorMessage);
          setSuccess("");
          return;
        }
        console.log("After Verification", data);
        setOtpVerifiedSuccess(true);
        setSuccess(data.message);
        setIsOnboarding(data.onboarding);
      }

      // You can handle email/Google methods separately if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // const toggleAuthMode = () => {
  //   setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
  //   setAuthMethod(null);
  //   setFormData({ email: "", phone: "", otp: "" });
  //   setError("");
  // };
  useEffect(() => {
    if (formData.otp.trim() === "" && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [formData.otp]);

  //redirect to onboarding if user is first time user
  useEffect(() => {
    if (otpVerifiedSuccess) {
      const contact = authMethod === "phone" ? formData.phone : formData.email;
      // Add a small delay to ensure cookie is set
      const timer = setTimeout(() => {
        refetch().then(() => {
          if (isOnboarding) {
            router.push(
              `/onboarding?method=${authMethod}&contact=${encodeURIComponent(
                contact,
              )}`,
            );
          } else {
            router.push("/");
          }
        });
      }, 1000); // 1000ms delay

      return () => clearTimeout(timer);
    }
  }, [otpVerifiedSuccess, isOnboarding, router, refetch, authMethod, formData]);

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50/20 to-purple-50/ rounded-2xl">
      <div className="bg-white backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="flex items-center justify-center gap-2">
              <DigiLogo />
              Digi-Permit
            </span>
          </h1>
          <p className="text-gray-600">
            Create an account or log in to discover <b>Digi-Permit</b> and{" "}
            <span className="text-blue-600">streamline</span> your{" "}
            <i>Building permit Application in minutes.</i>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        {authMethod === null ? (
          <div className="space-y-4">
            <button
              onClick={() => setAuthMethod("email")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Continue with Email
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              onClick={() => setAuthMethod("phone")}
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Continue with Phone
            </button>

            <button
              onClick={() => setAuthMethod("google")}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
          </div>
        ) : authMethod === "google" ? (
          <div className="text-center">
            <p className="mb-6 text-gray-600">
              Redirecting to Google for authentication...
            </p>
            <button
              onClick={() => setAuthMethod(null)}
              className="text-blue-600 hover:underline"
            >
              ← Back to other options
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!otpSendSuccess ? (
              authMethod === "email" ? (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="relative  justify-between flex">
                    <div className="inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-l-lg">
                        <img
                          src="https://flagcdn.com/w20/gh.png"
                          alt="Ghana flag"
                          className="w-5 h-3.5 rounded-sm"
                        />
                        <span className="text-gray-700 text-sm">+233</span>
                      </div>
                    </div>
                    <div className="">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required
                        className="w-full pl-20 px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="24 123 4567"
                        disabled={loading}
                        pattern="[0-9]{9,10}"
                        title="Enter 9-10 digit Ghanaian phone number"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your Ghanaian phone number without the country code
                  </p>
                </div>
              )
            ) : (
              ""
            )}

            {otpSendSuccess && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <div className="flex justify-between gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.otp[i] || ""}
                      onChange={(e) => handleOtpChange(e, i)}
                      onPaste={handleOtpPaste}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      ref={(el) => {
                        if (el) otpRefs.current[i] = el;
                      }}
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="flex items-center mt-4">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me on this device for 30 days
                  </label>
                </div>
                <p className="mt-2 text-sm text-green-900 text-center">
                  Enter the 6-digit code sent to your{" "}
                  {authMethod === "phone" ? "phone" : "email"}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : otpSendSuccess ? (
                "Verify Code"
              ) : (
                `Send ${authMethod === "email" ? "Email" : "SMS"} Code ${
                  otpHasExpired ? "Again" : ""
                }`
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod(null);
                setFormData({
                  email: "",
                  phone: "",
                  otp: "",
                  rememberMe: false,
                });
                setSuccess("");
                setError("");
              }}
              className="w-full text-center text-blue-600 hover:underline text-sm"
            >
              ← Back to other options
            </button>
          </form>
        )}

        {/* <div className="mt-6 text-center text-sm text-gray-600">
          {authMode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={toggleAuthMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {authMode === "login" ? "Sign up" : "Log in"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AuthForm;
