import AuthForm from "../(auth)/_component/auth-form";
import BuildingPermit3D from "../_component/images/cadastral-map";

export const metadata = {
  title: "Login | Digi-Permit",
  description: "Sign in to Ghana's first digital building permit platform.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row items-center justify-center px-6 py-12 gap-8">
      {/* Left: Map + Tagline + Watermark */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center">
        {/* Watermark */}
        <div className="absolute inset-0 flex-1 items-center justify-center opacity-5 pointer-events-none">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-widest select-none">
            DIGI-PERMIT
          </h1>
        </div>

        {/* Map */}
        <div className="relative z-10">
          <BuildingPermit3D />
        </div>

      </div>

      {/* Right: Auth Form */}
      <div className="w-full max-w-md z-10">
        <AuthForm />
      </div>
    </div>
  );
}
