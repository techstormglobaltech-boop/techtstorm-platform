import ReportsManager from "@/components/admin/ReportsManager";
import { getPlatformReports } from "@/app/actions/reports";

export const metadata = {
  title: "TechStorm Admin | Reports",
  description: "View platform analytics and generate reports.",
};

export default async function ReportsPage() {
  const data = await getPlatformReports();
  if (!data) return null;

  return <ReportsManager initialData={data} />;
}
