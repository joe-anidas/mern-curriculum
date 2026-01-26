import type { Task } from "@/types/task";

interface TimelineViewProps {
  tasks: Task[];
}

export const TimelineView = ({ tasks }: TimelineViewProps) => {
  // Mock Sprints for visual demo
  const sprints = [
    { id: "s1", name: "Sprint 43 (Current)", start: "Nov 15", end: "Nov 29", color: "bg-blue-50 border-blue-100" },
    { id: "s2", name: "Sprint 44", start: "Dec 01", end: "Dec 14", color: "bg-gray-50 border-gray-100" },
  ];

  const weeks = ["Nov 13", "Nov 20", "Nov 27", "Dec 04", "Dec 11"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Timeline Header (Dates) */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <div className="w-64 p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide border-r border-gray-100 shrink-0">Sprint / Task</div>
        <div className="flex-1 flex">
          {weeks.map((week) => (
             <div key={week} className="flex-1 p-4 border-r border-gray-100 text-center text-xs font-medium text-gray-500 last:border-r-0">
                WK of {week}
             </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sprints.map((sprint) => (
           <div key={sprint.id}>
              {/* Sprint Header Row */}
              <div className={`flex items-center border-b border-gray-100 ${sprint.color}`}>
                 <div className="w-64 p-3 px-4 shrink-0 border-r border-gray-100/50">
                    <div className="font-bold text-gray-800 text-sm">{sprint.name}</div>
                    <div className="text-[10px] text-gray-500">{sprint.start} - {sprint.end}</div>
                 </div>
                 <div className="flex-1 relative h-12">
                    {/* Visual bar for sprint duration */}
                    <div className="absolute top-4 left-4 right-12 h-4 bg-blue-200/50 rounded-full"></div>
                 </div>
              </div>

              {/* Tasks Rows (Mocking some tasks to align with sprint) */}
              {tasks.slice(0, 3).map((task, i) => (
                 <div key={task.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-14">
                    <div className="w-64 p-3 px-4 shrink-0 border-r border-gray-100 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                       <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' : 
                          task.status === 'in-review' ? 'bg-purple-500' : 'bg-gray-300'
                       }`}></span>
                       {task.title}
                    </div>
                    <div className="flex-1 relative h-full">
                       {/* Random positioning for visual effect to mimic timeline bars */}
                       <div 
                         className={`absolute top-4 h-6 rounded-md shadow-sm border text-[10px] flex items-center px-2 text-white font-medium ${
                            task.status === 'completed' ? 'bg-green-500 border-green-600 left-[10%] w-[30%]' :
                            task.status === 'in-progress' ? 'bg-blue-500 border-blue-600 left-[30%] w-[40%]' : 
                            'bg-gray-400 border-gray-500 left-[50%] w-[20%]'
                         }`} 
                         style={{ left: `${(i * 15) + 5}%`, width: `${20 + (i * 5)}%` }} // Staggered mock visual
                       >
                          {task.status}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        ))}
      </div>
    </div>
  );
};
