"use client";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

interface DashboardChartsProps {
  userGrowth: any[];
  enrollmentTrends: any[];
  roleDistribution: any[];
}

const COLORS = ['#007C85', '#FFB300', '#1e293b'];

export default function DashboardCharts({ userGrowth, enrollmentTrends, roleDistribution }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      {/* Growth & Trends Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-brand-dark text-lg">Growth & Activity</h3>
            <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">Last 7 Days</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007C85" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#007C85" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10}}
                tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('default', { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#007C85" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-brand-dark text-lg">User Distribution</h3>
            <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">All Time</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
