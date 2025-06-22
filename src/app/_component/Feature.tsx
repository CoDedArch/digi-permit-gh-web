export const Feature = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-800 rounded-xl">{icon}</div>
    <div>
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-lg text-gray-400">{desc}</p>
    </div>
  </div>
);