export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7 space-y-6">
      {children}
    </div>
  );
}


