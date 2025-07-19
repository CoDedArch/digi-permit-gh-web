"use client";

import { useEffect, useState } from "react";
import { getUserWithProfile, UserData } from "../../data/queries";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  FileTextIcon,
  ShieldCheckIcon,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";

const formatStage = (stage: string) => {
  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Title Case
};

const formatApplicantType = (type: string | null) => {
  if (!type) return "N/A";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function UserProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const data = await getUserWithProfile();
    setUserData(data);
  };

  const handleGhanaCardSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}auth/me/ghana-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ghana_card_number: ghanaCardNumber }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to submit Ghana Card");
      }

      fetchUserData(); // Refresh user data
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-500 bg-white min-h-screen">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Loading My Data...
      </div>
    );
  }

  const { user, profile, documents } = userData;
  const isVerified = user.verification_stage === "fully_verified";
  const isValidFormat = /^GHA-\d{9}-\d$/.test(ghanaCardNumber);

  return (
    <div className="container mx-auto bg-white flex-col p-6 items-center justify-center">
      <div className="max-w-4xl mx-auto space-y-8 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-600" /> User Profile
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-gray-700 text-sm">
            <p>
              <strong>Full Name:</strong> {user.first_name} {user.last_name}
            </p>
            <p className="flex space-x-2">
              <MailIcon className="w-6 h-6 text-black-600" />
              <span>{user.email}</span>
            </p>
            <p className="flex space-x-2">
              <PhoneIcon className="w-6 h-6 text-black-600" />
              <span>{user.phone}</span>
            </p>
            <p className="flex space-x-2">
              <PhoneIcon className="w-6 h-6 text-black-600" />
              <span>{user.alt_phone ? `+233${user.alt_phone}` : "—"}</span>
            </p>
            <p className="flex items-center gap-2">
              <strong>Role:</strong>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                  {
                    applicant: "bg-blue-100 text-blue-800",
                    review_officer: "bg-purple-100 text-purple-800",
                    inspection_officer: "bg-yellow-100 text-yellow-800",
                    admin: "bg-red-100 text-red-800",
                  }[user.role] || "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role.replace("_", " ")}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <strong>Status:</strong>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </p>

            <p>
              <strong>Address:</strong> {user.address || "—"}
            </p>
            <p>
              <strong>Gender:</strong>{" "}
              {user.gender === "M"
                ? "Male"
                : user.gender === "F"
                ? "Female"
                : "Other"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {new Date(user.date_of_birth!).toLocaleDateString()}
            </p>
            <p>
              <strong>Preferred Verification:</strong>{" "}
              {user.preferred_verification || "Email"}
            </p>
            <p>
              <strong>Applicant Type:</strong>{" "}
              {formatApplicantType(user.applicant_type_code)}
            </p>
            <p className="flex items-center gap-2">
              <strong>Verification Stage:</strong>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                  {
                    otp_pending: "bg-orange-100 text-orange-800",
                    otp_verified: "bg-yellow-100 text-yellow-800",
                    document_pending: "bg-blue-100 text-blue-800",
                    fully_verified: "bg-green-100 text-green-800",
                  }[user.verification_stage] || "bg-gray-100 text-gray-800"
                }`}
              >
                {user.verification_stage.replace(/_/g, " ")}
              </span>
            </p>
          </div>
        </div>

        {profile && (
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              Profile Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-gray-700 text-sm">
              <p>
                <strong>Ghana Card Number:</strong>{" "}
                {profile.ghana_card_number || "—"}
              </p>
              <p>
                <strong>Digital Address:</strong>{" "}
                {profile.digital_address || "—"}
              </p>

              {user.role !== "applicant" && (
                <>
                  <p>
                    <strong>Specialization:</strong>{" "}
                    {profile.specialization || "—"}
                  </p>
                  <p>
                    <strong>Work Email:</strong> {profile.work_email || "—"}
                  </p>
                  <p>
                    <strong>Staff Number:</strong> {profile.staff_number || "—"}
                  </p>
                  <p>
                    <strong>Designation:</strong> {profile.designation || "—"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-yellow-700">
              Ghana Card Verification
            </h2>
            <p className="text-sm text-yellow-700 mt-1">
              Please enter your Ghana Card number to complete verification.
            </p>

            <div className="mt-3 flex flex-col gap-2">
              <input
                type="text"
                value={ghanaCardNumber}
                onChange={(e) => setGhanaCardNumber(e.target.value)}
                placeholder="GHA-XXXXXXXXX-X"
                className="border rounded px-3 py-2 w-full"
              />
              <p className="text-xs text-gray-600">
                Format: <span className="font-mono">GHA-XXXXXXXXX-X</span> (e.g.
                GHA-123456789-0)
              </p>
              <button
                onClick={handleGhanaCardSubmit}
                disabled={isSubmitting || !isValidFormat}
                className={`mt-2 px-4 py-2 rounded self-start transition-colors duration-200
    ${
      isSubmitting || !isValidFormat
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700"
    }
  `}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-purple-600" /> Submitted
              Documents
            </h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <strong>{doc.document_type}:</strong>{" "}
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isVerified && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-blue-700">
              Complete Your Staff Onboarding
            </h2>
            <p className="text-sm text-blue-700 mt-1">
              As a {user.role.replace("_", " ")}, please complete your MMDA
              affiliation and committee assignment.
            </p>

            <button
              onClick={() => {
                router.push('/onboarding/staff-onboarding')
              }}
              className="mt-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Proceed to Staff Onboarding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
