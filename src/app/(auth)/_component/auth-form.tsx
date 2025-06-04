"use client";
import DigiLogo from "./images/digi-logo";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone" | "google";

const AuthForm = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Here you would implement your OTP sending logic
      // or Google authentication based on the authMethod
      console.log("Authentication data:", { authMode, authMethod, formData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
    setAuthMethod(null);
    setFormData({ email: "", phone: "", otp: "" });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="flex items-center justify-center gap-2">
              <DigiLogo/>
              Digi-Permit
            </span>
          </h1>
          <p className="text-gray-600">
            Create an account or log in to discover <b>Digi-Permit</b> and apply for your Permit with ease.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {authMethod === null ? (
          <div className="space-y-4">
            <button
              onClick={() => setAuthMethod("email")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              disabled={loading}
            >
              Continue with Email
            </button>
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              onClick={() => setAuthMethod("phone")}
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
              disabled={loading}
            >
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
            <div>
              <label
                htmlFor={authMethod}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {authMethod === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                id={authMethod}
                name={authMethod}
                type={authMethod === "email" ? "email" : "tel"}
                value={authMethod === "email" ? formData.email : formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder={
                  authMethod === "email"
                    ? "your@email.com"
                    : "+1 (123) 456-7890"
                }
                disabled={loading}
              />
            </div>

            {formData.otp && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter 6-digit code"
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : formData.otp
                ? "Verify Code"
                : `Send ${authMethod === "email" ? "Email" : "SMS"} Code`}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod(null);
                setFormData({ email: "", phone: "", otp: "" });
              }}
              className="w-full text-center text-blue-600 hover:underline text-sm"
            >
              ← Back to other options
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {authMode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={toggleAuthMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {authMode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
