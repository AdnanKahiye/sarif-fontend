import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  href: string;
}

export default function ServiceCard({ title, href }: Props) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-lg mx-auto"
    >
      {/* Top Accent Line */}
      <span
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#D51116] opacity-0 transition group-hover:opacity-100"  // Your primary color
      />

      {/* Service Title */}
      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#D51116] transition-all duration-300">
        {title}
      </h3>

      {/* Service Description */}
      <p className="mt-3 text-sm text-gray-600">
        Discover more about our {title.toLowerCase()} service and how it can help your business grow.
      </p>

      {/* "View Details" Button */}
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D51116]">
        View Details
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
