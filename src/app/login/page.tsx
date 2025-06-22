import AuthForm from "../(auth)/_component/auth-form";
import CadastralMap from "../_component/images/cadastral-map";


export const metadata = {
    title: "Login | Digi-Permit",
    description: "Sign in to Ghana's first digital building permit platform.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex  items-center gap-1">
      <div className="flex-1 flex flex-col gap-2 items-center justify-center">
        <CadastralMap />
        <p className="text-white font-bold text-2xl">
          Ghana&apos;s first digital building permit platform{" "}
          <span className="text-3xl font-extrabold">!!</span>{" "}
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
