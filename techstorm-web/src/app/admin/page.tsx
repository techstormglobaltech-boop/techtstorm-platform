import { getAdminStats } from "@/app/actions/stats";
import DashboardCharts from "@/components/admin/DashboardCharts";
import AdminStatsCard from "@/components/admin/dashboard/AdminStatsCard";
import PendingTasks from "@/components/admin/dashboard/PendingTasks";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import QuickActions from "@/components/admin/dashboard/QuickActions";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-brand-dark">Dashboard</h2>
                <p className="text-slate-500 mt-1">Platform overview and recent activity.</p>
            </div>
            <QuickActions />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard 
                title="Active Courses" 
                value={stats.coursesCount} 
                icon="fa-book-open" 
                color="border-brand-teal"
                trend="12%"
            />
            <AdminStatsCard 
                title="Total Mentors" 
                value={stats.mentorsCount} 
                icon="fa-chalkboard-teacher" 
                color="border-brand-amber"
                trend="5%"
            />
            <AdminStatsCard 
                title="Active Students" 
                value={stats.menteesCount} 
                icon="fa-user-graduate" 
                color="border-indigo-500"
                trend="8%"
            />
            <AdminStatsCard 
                title="Revenue (Est)" 
                value={`GH₵${stats.revenue.toLocaleString()}`} 
                icon="fa-chart-line" 
                color="border-green-500"
                trend="15%" 
            />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Col: Charts & Tasks */}
            <div className="xl:col-span-2 space-y-8">
                <DashboardCharts 
                    userGrowth={stats.userGrowth} 
                    enrollmentTrends={stats.enrollmentTrends} 
                    roleDistribution={stats.roleDistribution} 
                />
                
                <div className="grid md:grid-cols-2 gap-8">
                    <PendingTasks stats={stats.pendingTasks} />
                    
                    {/* Top Course Widget */}
                    <div className="bg-gradient-to-br from-brand-dark to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Top Performing Course</h3>
                            <p className="text-brand-amber text-sm mb-4">Highest engagement all time</p>
                            <div className="text-2xl font-bold truncate pr-8">{stats.topCourse.title}</div>
                            <p className="text-slate-300 text-sm mt-1">{stats.topCourse.enrollments} active students</p>
                        </div>
                        <i className="fas fa-trophy absolute bottom-4 right-4 text-6xl text-white/5"></i>
                    </div>
                </div>
            </div>

            {/* Right Col: Feed */}
            <div className="xl:col-span-1">
                <ActivityFeed feed={stats.activityFeed} />
            </div>
        </div>
    </div>
  );
}
