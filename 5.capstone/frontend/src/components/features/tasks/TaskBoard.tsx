import React from "react";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { UnifiedTaskModal } from "./UnifiedTaskModal";

import type { User } from "@/types/user";

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskUpdate?: () => void;
  onUpdate?: (taskId: string, updates: Partial<Omit<Task, 'dueDate'>> & { dueDate?: string | Date | null }) => void;
  users?: User[];
  currentUserId?: string;
  isTenantAdmin?: boolean;
}

export const TaskBoard = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddTask,
  onTaskUpdate,
  onUpdate,
  users,
  currentUserId,
  isTenantAdmin = false,
}: TaskBoardProps) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Sync selectedTask with updated tasks prop
  React.useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks, selectedTask]);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: "To Do", color: "bg-gray-100/50" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50/50" },
    { id: "in-review", title: "In Review", color: "bg-purple-50/50" },
    { id: "completed", title: "Completed", color: "bg-green-50/50" },
  ];
// ... existing drag logic ...
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onStatusChange(taskId, newStatus);
    }
  };
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };
  const handleTaskUpdate = (taskId: string, updates: Partial<Omit<Task, 'dueDate'>> & { dueDate?: string | Date | null }) => {
    // Call the onUpdate prop to save all changes
    if (onUpdate) {
      onUpdate(taskId, updates);
    }
    
    // Also handle status change if status was updated
    if (updates.status) {
      onStatusChange(taskId, updates.status);
    }
    
    // Trigger refetch - this will update the tasks prop
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  return (
    <>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 h-full md:overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`flex flex-col min-h-[500px] md:h-full rounded-2xl ${col.color} p-4 border border-gray-200/60 transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                   <h3 className="font-bold text-gray-700">{col.title}</h3>
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                     {colTasks.length}
                   </span>
                </div>
              </div>

              <button 
                onClick={() => onAddTask(col.id)}
                className="mb-3 flex items-center justify-center w-full py-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm font-medium"
              >
                 + Add Task
              </button>
              
              <div className="h-px bg-gray-200/50 mb-3" />
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                 {colTasks.length === 0 ? (
                   <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                      <p className="text-gray-400 text-xs font-medium">Drop tasks here</p>
                   </div>
                 ) : (
                   colTasks.map((task) => (
                     <div 
                       key={task.id}
                       draggable
                       onDragStart={(e) => handleDragStart(e, task.id)}
                       onClick={() => handleTaskClick(task)}
                       className="cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-gray-400/20 transition-all duration-200 rounded-xl"
                     >
                       <TaskCard
                         task={task}
                         onEdit={onEdit}
                         onDelete={onDelete}
                         users={users}
                       />
                     </div>
                   ))
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <UnifiedTaskModal 
          task={selectedTask} 
          isOpen={!!selectedTask} 
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskUpdate}
          onTaskUpdate={onTaskUpdate}
          users={users}
          currentUserId={currentUserId}
          isTenantAdmin={isTenantAdmin}
        />
      )}
    </>
  );
};
