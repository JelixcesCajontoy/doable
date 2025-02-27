
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "processing" | "completed";
  remarks: string | null;
  due_date: string | null;
  created_at: string;
  assigned_to: string | null;
  created_by: string;
  priority: string;
  updated_at: string | null;
}

export default function Employee() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"], remarks: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status, remarks })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });

      // Refresh tasks list
      fetchTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task status",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading tasks...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground mt-1">{task.description}</p>
              )}
              {task.due_date && (
                <p className="text-sm text-muted-foreground mt-2">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`status-${task.id}`}>Status</Label>
                <Select
                  value={task.status}
                  onValueChange={(value: Task["status"]) => {
                    const remarks = tasks.find(t => t.id === task.id)?.remarks || "";
                    updateTaskStatus(task.id, value, remarks);
                  }}
                >
                  <SelectTrigger id={`status-${task.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 shadow-lg">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`remarks-${task.id}`}>Remarks</Label>
                <Textarea
                  id={`remarks-${task.id}`}
                  placeholder="Add your remarks here..."
                  value={task.remarks || ""}
                  onChange={(e) => {
                    const updatedTasks = tasks.map(t => 
                      t.id === task.id ? { ...t, remarks: e.target.value } : t
                    );
                    setTasks(updatedTasks);
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => updateTaskStatus(task.id, task.status, task.remarks || "")}
                >
                  Update Remarks
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No tasks assigned to you</p>
          </div>
        )}
      </div>
    </div>
  );
}
