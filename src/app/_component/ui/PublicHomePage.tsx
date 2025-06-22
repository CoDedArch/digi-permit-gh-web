import Link from "next/link";
import { Feature } from "../Feature";
import { ShieldCheck, Clock, Building, Globe } from "lucide-react";


export default function PublicHomepage() {
  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row justify-center px-6 py-12 gap-12 bg-gray-900">
      {/* Left Content */}
      <div className="container flex flex-col items-center max-w-[100%]">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-center">
            Welcome to <span className="text-purple-500">Digi-Permit</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 text-center">
            Ghana&apos;s first fully digital building permit platform. Apply, track,
            and manage your building permits with ease — all from your device.
          </p>
        </div>
        {/* CTA Section */}
        <div className="mt-10 flex flex-col items-center">
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-200 text-lg"
          >
            Join Digi-Permit Now
          </Link>
          <p className="mt-3 text-gray-400 text-sm text-center max-w-md">
            Sign up today to experience
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-10 mt-6">
          <Feature
            icon={<ShieldCheck className="text-purple-400" />}
            title="Secure & Transparent"
            desc="Your applications are encrypted, auditable, and trackable at every step."
          />
          <Feature
            icon={<Clock className="text-purple-400" />}
            title="Faster Approvals"
            desc="Automated workflows reduce delays and cut down paperwork."
          />
          <Feature
            icon={<Building className="text-purple-400" />}
            title="Agency Integrated"
            desc="Works seamlessly with MMDA, TCPD, and other urban agencies."
          />
          <Feature
            icon={<Globe className="text-purple-400" />}
            title="100% Digital"
            desc="From submission to inspection—no queues, no visits, no hassle."
          />
        </div>
        <p className="mt-10 text-3xl">To manage your building permits in Ghana.</p>
      </div>
    </div>
  );
}
