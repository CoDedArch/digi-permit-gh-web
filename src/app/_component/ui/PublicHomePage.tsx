import React from "react";
import {
  ShieldCheck,
  Clock,
  Building,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Search,
  ClipboardCheck,
} from "lucide-react";
import DigiLogo from "../images/digi-logo";

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const Feature = ({ icon, title, desc }: FeatureProps) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

type StatCardProps = {
  number: string | number;
  label: string;
};

const StatCard = ({ number, label }: StatCardProps) => (
  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
    <div className="text-3xl font-bold text-indigo-700">{number}</div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);

type TestimonialCardProps = {
  name: string;
  role: string;
  content: string;
  rating?: number;
};

const TestimonialCard = ({
  name,
  role,
  content,
  rating = 5,
}: TestimonialCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="flex mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 mb-4 italic">&quot;{content}&quot;</p>
    <div>
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-sm text-gray-600">{role}</div>
    </div>
  </div>
);

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2 className="text-[10rem] lg:text-[16rem] font-extrabold text-white/5 tracking-tight whitespace-nowrap select-none">
            Digi-Permit
          </h2>
        </div>

        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-white/90 text-sm font-medium">
                  🇬🇭 Ghana&apos;s First Digital Building Permit Platform
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Transform Your
                <span className="block text-indigo-200">Building Permits</span>
                <span className="block">Experience</span>
              </h1>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl">
                Skip the queues, reduce paperwork, and get your building permits
                approved faster with Ghana&apos;s most trusted digital platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group">
                  Let&apos;s Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {/* <button className="border-2 border-white/30 text-white font-medium py-4 px-8 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button> */}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Checklist */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle className="w-6 h-6 text-emerald-300" />
                    <span>Application Submitted</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle className="w-6 h-6 text-emerald-300" />
                    <span>Documents Verified</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                    <div className="w-6 h-6 border-2 border-white/30 rounded-full animate-pulse"></div>
                    <span>Under Review</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/50">
                    <div className="w-6 h-6 border-2 border-white/20 rounded-full"></div>
                    <span>Final Approval</span>
                  </div>
                </div>

                {/* Visual Column */}
                <div className="space-y-6 text-white/80">
                  <div className="flex items-center space-x-4">
                    <ClipboardCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Submit Your Application</p>
                      <p className="text-sm text-white/60">
                        Begin the process by submitting your building permit
                        request online.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Upload Documents</p>
                      <p className="text-sm text-white/60">
                        Attach architectural drawings, site plans, and other
                        required files.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Search className="w-8 h-8 text-yellow-300" />
                    <div>
                      <p className="font-semibold">Under Review</p>
                      <p className="text-sm text-white/60">
                        Your documents and application are carefully reviewed by
                        officials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <ShieldCheck className="w-8 h-8 text-white/50" />
                    <div>
                      <p className="font-semibold">Get Final Approval</p>
                      <p className="text-sm text-white/60">
                        Receive your digitally signed permit once all checks are
                        complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50 border-t border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
              Trusted by Government Agencies and Citizens Across Ghana
            </h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Digi-Permit is proudly used by local assemblies, professionals,
              and everyday Ghanaians.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="500+" label="Applications Processed" />
            <StatCard number="All 264" label="MMDAs" />
            <StatCard number="98%" label="Customer Satisfaction" />
            <StatCard number="50%" label="Faster Processing" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
              Why Choose Our Platform?
            </h2>

            {/* Digi-Permit Name & Logo */}
            <div className="flex justify-center items-center gap-3">
              <DigiLogo />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Digi-Permit
              </span>
            </div>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
              Discover a smarter, faster, and more secure way to manage building
              permit applications across Ghana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Feature
              icon={
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              }
              title="Secure & Transparent Process"
              desc="Bank-level encryption with full audit trails and real-time updates. Your data is protected, your progress is visible."
            />
            <Feature
              icon={
                <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              }
              title="50% Faster Approvals"
              desc="Automated routing and digital verifications eliminate manual delays. Go from submission to approval in record time."
            />
            <Feature
              icon={
                <div className="bg-purple-100 text-purple-700 p-3 rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
              }
              title="Integrated with All Agencies"
              desc="MMDA, TCPD, EPA, Lands Commission — all in one place. No more back-and-forth or repeated submissions."
            />
            <Feature
              icon={
                <div className="bg-orange-100 text-orange-700 p-3 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
              }
              title="Smart Document Management"
              desc="Drag-and-drop uploads, automatic validation, and document reuse make your experience effortless and efficient."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600">
              Get your building permit in just a few clicks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-10 relative">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up instantly using your Ghana Card — no waiting. It's 20x faster than traditional methods.",
              },
              {
                step: "02",
                title: "Submit Application",
                desc: "Upload required documents and complete smart forms.",
              },
              {
                step: "03",
                title: "Track Progress",
                desc: "Monitor your application's real-time status updates.",
              },
              {
                step: "04",
                title: "Receive Permit",
                desc: "Get your approved permit digitally and securely. 10x faster than traditional methods.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {/* Step bubble */}
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-md flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                {/* Title and description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-[15px] leading-relaxed px-2 font-medium">
                  {item.desc}
                </p>

                {/* Arrow to next step */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <svg
                      className="w-6 h-6 mx-auto animate-pulse"
                      viewBox="0 0 24 24"
                      fill="url(#gradientArrow)"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="gradientArrow"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#4f46e5" />{" "}
                          {/* indigo-600 */}
                          <stop offset="100%" stopColor="#2563eb" />{" "}
                          {/* blue-600 */}
                        </linearGradient>
                      </defs>
                      <path
                        d="M13 5l7 7-7 7M5 12h14"
                        stroke="url(#gradientArrow)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from citizens and public officials who trust{" "}
              <span className="font-semibold text-indigo-700">Digi-Permit</span>{" "}
              to streamline their building application process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="Kwame Asante"
              role="Property Developer"
              content="Digi-Permit saved me 3 months on my last project. The transparency and speed are incredible. I always know exactly what’s happening."
            />
            <TestimonialCard
              name="Mary Osei"
              role="Homeowner"
              content="Finally, no more queues! I submitted my application from home and tracked every step. The experience was smooth and stress-free."
            />
            <TestimonialCard
              name="John Mensah"
              role="MMDA Official"
              content="The platform has revolutionized how we process permits. Everything is streamlined, secure, and easy to manage — it’s a game-changer."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-800 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Join thousands of Ghanaians already using Digi-Permit to simplify
            and speed up their building permit process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center group">
              Create Your Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white/30 text-white font-medium py-4 px-8 rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
              Contact Client Service Unit
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
        >
          <span className="font-extrabold tracking-tight text-white/5 text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] leading-none whitespace-nowrap">
            Digi-Permit
          </span>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Branding */}
            <div>
              <div className="flex items-center gap-3">
                <DigiLogo />
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Digi-Permit
                </span>
              </div>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Ghana&apos;s premier digital building permit platform, making
                permitting fast, secure, and transparent.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>New Construction Permit</li>
                <li>Renovation &amp; Alteration Permit</li>
                <li>Change of Use Permit</li>
                <li>Demolition Permit</li>
                <li>Temporary Structure Permit</li>
                <li>Sign Permit</li>
                <li>Subdivision Permit</li>
                <li>Fittings Installation Permit</li>
                <li>Hoarding Permit</li>
                <li>Sand Weaning Permit</li>
                <li>Inspection Services Permit</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>User Guide</li>
                <li>FAQ</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Data Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm relative">
            <p>
              &copy; 2025 Digi-Permit. All rights reserved. | Proudly serving
              Ghana 🇬🇭
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
