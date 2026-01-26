import type { Task } from "@/types/task";

interface SummaryCardsProps {
  tasks: Task[];
}

export const SummaryCards = ({ tasks }: SummaryCardsProps) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  // Assuming "overdue" is based on date, logic reused from TaskCard
  const overdue = tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const cards = [
    { label: "Total Tasks", value: total, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Completed", value: completed, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "In Progress", value: inProgress, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Overdue", value: overdue, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`p-4 rounded-xl border ${card.border} ${card.bg} shadow-sm transition-transform hover:scale-[1.02]`}>
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};
