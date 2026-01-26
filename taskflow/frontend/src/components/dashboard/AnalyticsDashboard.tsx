import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { analyticsService } from "@/services/api/analyticsService";
import type { TaskStats, WorkloadStat } from "@/services/api/analyticsService";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [workload, setWorkload] = useState<WorkloadStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, workloadData] = await Promise.all([
          analyticsService.getTaskStats(),
          analyticsService.getWorkloadStats(),
        ]);
        setStats(statsData);
        setWorkload(workloadData);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-red-500 p-4">{error || "No data available"}</div>
    );
  }

  const pieData = [
    { name: "Todo", value: stats.statusCounts.todo },
    { name: "In Progress", value: stats.statusCounts["in-progress"] },
    { name: "In Review", value: stats.statusCounts["in-review"] },
    { name: "Completed", value: stats.statusCounts.completed },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          color="bg-blue-50 text-blue-700"
          subtext="Total completed tasks"
        />
        <StatCard
          title="Total Tasks"
          value={stats.total}
          color="bg-gray-50 text-gray-700"
          subtext="Across all projects"
        />
        <StatCard
          title="Due Soon"
          value={stats.dueStats.dueSoon}
          color="bg-yellow-50 text-yellow-700"
          subtext="Due in next 7 days"
        />
        <StatCard
          title="Overdue"
          value={stats.dueStats.overdue}
          color="bg-red-50 text-red-700"
          subtext="Missed deadlines"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Status Distribution
          </h3>
          <div className="h-64 w-full" style={{ minHeight: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Workload Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Member Workload
          </h3>
          <div className="h-64 w-full" style={{ minHeight: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#00C49F"
                  name="Completed"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="inReview"
                  stackId="a"
                  fill="#8B5CF6"
                  name="In Review"
                />
                <Bar
                  dataKey="inProgress"
                  stackId="a"
                  fill="#FFBB28"
                  name="In Progress"
                />
                <Bar
                  dataKey="todo"
                  stackId="a"
                  fill="#0088FE"
                  name="Todo"
                  radius={[4, 0, 0, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Detailed Workload Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Team Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3 text-center">Completion Rate</th>
                <th className="px-6 py-3 text-center">Total Tasks</th>
                <th className="px-6 py-3 text-center">Completed</th>
                <th className="px-6 py-3 text-center">In Progress</th>
                <th className="px-6 py-3 text-center text-red-600">
                  Overdue Stats
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workload.map((user) => (
                <tr
                  key={user.userId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-gray-400 font-normal">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.completionRate >= 80
                          ? "bg-green-100 text-green-700"
                          : user.completionRate >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Math.round(user.completionRate)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {user.total}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {user.completed}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {user.inProgress}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  color,
  subtext,
}: {
  title: string;
  value: string | number;
  color: string;
  subtext: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`p-6 rounded-xl border border-gray-100 shadow-sm bg-white`}
  >
    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className={`mt-2 text-3xl font-bold ${color.split(" ")[1]}`}>
      {value}
    </div>
    <p className="mt-1 text-xs text-gray-400">{subtext}</p>
  </motion.div>
);
