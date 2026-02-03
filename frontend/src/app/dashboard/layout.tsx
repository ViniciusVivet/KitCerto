import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}


