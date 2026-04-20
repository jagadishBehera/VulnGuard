import StatsCard from "../../Components/Admin/StatsCard";
import {
  ShieldCheck,
  AlertTriangle,
  Bug,
  Globe,
  Home,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">

      {/*  Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Home size={16} className="mr-2 text-gray-400" />
        <span className="hover:text-gray-700 cursor-pointer">Home</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-800 font-medium">Dashboard</span>
      </div>

     

      {/*  Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Total Scans"
          value="24"
          icon={<Globe size={22} />}
          color="blue"
        />
        <StatsCard
          title="Vulnerabilities"
          value="67"
          icon={<Bug size={22} />}
          color="yellow"
        />
        <StatsCard
          title="Critical Issues"
          value="12"
          icon={<AlertTriangle size={22} />}
          color="red"
        />
        <StatsCard
          title="Safe Domains"
          value="8"
          icon={<ShieldCheck size={22} />}
          color="green"
        />
      </div>
    </div>
  );
}