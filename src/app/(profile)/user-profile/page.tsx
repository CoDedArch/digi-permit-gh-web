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
  ChevronDownIcon,
  EyeIcon,
  UserCircleIcon,
  PencilIcon,
  BriefcaseIcon,
  MapPinIcon,
  IdCardIcon,
  HashIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  VerifiedIcon,
  CakeIcon,
  VenetianMaskIcon,
  HomeIcon,
  ActivityIcon,
  ShieldIcon,
  PhoneCallIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header Section */}
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
              <p className="text-sm text-gray-500 mt-1">
                Personal and account information
              </p>
            </div>
          </div>

          {/* Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Personal Info */}
            <ProfileCardItem
              icon={<UserCircleIcon className="w-4 h-4" />}
              label="Full Name"
              value={`${user.first_name} ${user.last_name}`}
            />

            <ProfileCardItem
              icon={<MailIcon className="w-4 h-4" />}
              label="Email"
              value={user.email}
              isEmail={true}
            />

            <ProfileCardItem
              icon={<PhoneIcon className="w-4 h-4" />}
              label="Phone"
              value={user.phone}
              isPhone={true}
            />

            <ProfileCardItem
              icon={<PhoneCallIcon className="w-4 h-4" />}
              label="Alternate Phone"
              value={user.alt_phone ? `+233${user.alt_phone}` : null}
              isPhone={true}
            />

            {/* Account Info */}
            <ProfileCardItem
              icon={<ShieldIcon className="w-4 h-4" />}
              label="Role"
              value={user.role.replace("_", " ")}
              badgeVariant={
                (
                  {
                    applicant: "blue",
                    review_officer: "purple",
                    inspection_officer: "yellow",
                    admin: "red",
                  } as Record<string, BadgeVariant>
                )[user.role] || "gray"
              }
            />

            <ProfileCardItem
              icon={<ActivityIcon className="w-4 h-4" />}
              label="Status"
              value={user.is_active ? "Active" : "Inactive"}
              badgeVariant={user.is_active ? "green" : "red"}
            />

            <ProfileCardItem
              icon={<HomeIcon className="w-4 h-4" />}
              label="Address"
              value={user.address}
            />

            <ProfileCardItem
              icon={<VenetianMaskIcon className="w-4 h-4" />}
              label="Gender"
              value={
                user.gender === "M"
                  ? "Male"
                  : user.gender === "F"
                  ? "Female"
                  : "Other"
              }
            />

            {/* Additional Info */}
            <ProfileCardItem
              icon={<CakeIcon className="w-4 h-4" />}
              label="Date of Birth"
              value={
                user.date_of_birth
                  ? new Date(user.date_of_birth).toLocaleDateString()
                  : null
              }
            />

            <ProfileCardItem
              icon={<VerifiedIcon className="w-4 h-4" />}
              label="Verification Stage"
              value={user.verification_stage.replace(/_/g, " ")}
              badgeVariant={
                (
                  {
                    otp_pending: "orange",
                    otp_verified: "yellow",
                    document_pending: "blue",
                    fully_verified: "green",
                  } as Record<string, BadgeVariant>
                )[user.verification_stage] || "gray"
              }
            />

            <ProfileCardItem
              icon={<CheckCircleIcon className="w-4 h-4" />}
              label="Preferred Verification"
              value={user.preferred_verification || "Email"}
            />

            <ProfileCardItem
              icon={<ClipboardListIcon className="w-4 h-4" />}
              label="Applicant Type"
              value={formatApplicantType(user.applicant_type_code)}
            />
          </div>

          {/* Edit Button */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 text-sm"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Profile Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {user.role === "applicant"
                    ? "Applicant details"
                    : "Staff profile"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileInfoItem
                label="Ghana Card Number"
                value={profile.ghana_card_number}
                icon={<IdCardIcon className="w-4 h-4" />}
              />

              <ProfileInfoItem
                label="Digital Address"
                value={profile.digital_address}
                icon={<MapPinIcon className="w-4 h-4" />}
              />

              {user.role !== "applicant" && (
                <>
                  <ProfileInfoItem
                    label="Specialization"
                    value={profile.specialization}
                    icon={<BriefcaseIcon className="w-4 h-4" />}
                  />

                  <ProfileInfoItem
                    label="Work Email"
                    value={profile.work_email}
                    icon={<MailIcon className="w-4 h-4" />}
                    isEmail={true}
                  />

                  <ProfileInfoItem
                    label="Staff Number"
                    value={profile.staff_number}
                    icon={<HashIcon className="w-4 h-4" />}
                  />

                  <ProfileInfoItem
                    label="Designation"
                    value={profile.designation}
                    icon={<UserCircleIcon className="w-4 h-4" />}
                  />
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => router.push("/profile/edit")}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 text-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Submitted Documents
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {documents.length} document{documents.length > 1 ? "s" : ""}{" "}
                  uploaded
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-md">
                      <FileTextIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      {doc.document_type}
                    </span>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm rounded-md bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </a>
                </motion.div>
              ))}
            </div>

            {documents.length > 3 && (
              <div className="mt-4 text-right">
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 ml-auto">
                  Show all {documents.length} documents
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl mb-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-800">
                  Complete Your Staff Onboarding
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  As a {user.role.replace("_", " ")}, please complete your MMDA
                  affiliation and committee assignment to unlock all features.
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/onboarding/staff-onboarding")}
                  className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Proceed to Onboarding</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const ProfileInfoItem = ({
  label,
  value,
  icon,
  isEmail = false,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  isEmail?: boolean;
}) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="bg-blue-100 p-1.5 rounded-md mt-0.5">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 mt-1">
        {value ? (
          isEmail ? (
            <a
              href={`mailto:${value}`}
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </p>
    </div>
  </div>
);

type BadgeVariant =
  | "blue"
  | "purple"
  | "yellow"
  | "red"
  | "green"
  | "orange"
  | "gray";

const ProfileCardItem = ({
  icon,
  label,
  value,
  isEmail = false,
  isPhone = false,
  badgeVariant = null,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isEmail?: boolean;
  isPhone?: boolean;
  badgeVariant?: BadgeVariant | null;
}) => {
  const variantClasses = {
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="bg-blue-100 p-1.5 rounded-md mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {value ? (
          badgeVariant ? (
            <span
              className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${variantClasses[badgeVariant]}`}
            >
              {value}
            </span>
          ) : isEmail ? (
            <a
              href={`mailto:${value}`}
              className="text-sm text-blue-600 hover:underline block mt-1 truncate"
            >
              {value}
            </a>
          ) : isPhone ? (
            <a
              href={`tel:${value}`}
              className="text-sm text-gray-800 hover:text-blue-600 block mt-1 truncate"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm text-gray-800 mt-1 truncate">{value}</p>
          )
        ) : (
          <span className="text-sm text-gray-400 mt-1">—</span>
        )}
      </div>
    </div>
  );
};
