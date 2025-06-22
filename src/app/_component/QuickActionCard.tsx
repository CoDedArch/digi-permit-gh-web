import Link from "next/link";

export default function QuickActionCard({
  title,
  description,
  icon,
  buttonText,
  href,
  fullWidth,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  href: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
