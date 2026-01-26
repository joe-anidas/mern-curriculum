import { Tasks } from "@/components";
import { Navbar } from "@/components/common";

export const TasksPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Tasks />
      </main>
    </div>
  );
};

export default TasksPage;
