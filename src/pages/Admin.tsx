import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Plus } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/App";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  // Query for current pending tasks count
  const { data: pendingTasksCount = 0, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingTasksCount', 'current'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });

  // Query for previous week's pending tasks count
  const { data: previousPendingCount = 0 } = useQuery({
    queryKey: ['pendingTasksCount', 'previous'],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  // Query for current completed tasks count
  const { data: completedTasksCount = 0, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['completedTasksCount', 'current'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (error) throw error;
      return count || 0;
    },
  });

  // Query for previous week's completed tasks count
  const { data: previousCompletedCount = 0 } = useQuery({
    queryKey: ['completedTasksCount', 'previous'],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .lt('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  // Query for current projects count
  const { data: projectsCount = 0, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projectsCount', 'current'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Query for previous week's projects count
  const { data: previousProjectsCount = 0 } = useQuery({
    queryKey: ['projectsCount', 'previous'],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_employee:profiles!tasks_assigned_to_fkey(full_name),
          created_by_employee:profiles!tasks_created_by_fkey(full_name),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    fetchEmployees();
    fetchProjects();

    // Set up realtime subscription for tasks and projects
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          // Invalidate all tasks-related queries
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['pendingTasksCount'] });
          queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projectsCount'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [queryClient]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'employee');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch employees",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects",
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskTitle,
            description: taskDescription,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            created_by: user.id,
            assigned_to: selectedEmployee || null,
            project_id: selectedProject || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setTaskTitle("");
      setTaskDescription("");
      setDueDate("");
      setSelectedEmployee("");
      setSelectedProject("");
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task",
      });
    }
  };

  const stats = [
    {
      title: "Pending Tasks",
      value: isLoadingPending ? "Loading..." : pendingTasksCount.toString(),
      icon: FileText,
      change: calculatePercentageChange(pendingTasksCount, previousPendingCount),
      description: "Tasks awaiting completion",
    },
    {
      title: "Done Tasks",
      value: isLoadingCompleted ? "Loading..." : completedTasksCount.toString(),
      icon: FileText,
      change: calculatePercentageChange(completedTasksCount, previousCompletedCount),
      description: "Completed tasks",
    },
    {
      title: "Projects",
      value: isLoadingProjects ? "Loading..." : projectsCount.toString(),
      icon: FileText,
      change: calculatePercentageChange(projectsCount, previousProjectsCount),
      description: "Total active projects",
    },
    {
      title: "System Status",
      value: "98.5%",
      icon: Settings,
      change: "+0.5%",
      description: "System uptime",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2" />
          Create Task
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 shadow-lg">
                  {projects.map((project) => (
                    <SelectItem 
                      key={project.id} 
                      value={project.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign to Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 shadow-lg">
                  {employees.map((employee) => (
                    <SelectItem 
                      key={employee.id} 
                      value={employee.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {employee.full_name || 'Unnamed Employee'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Task</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
        <div className="space-y-4">
          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <Card key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.project && (
                      <p className="text-sm text-blue-600 mt-1">
                        Project: {task.project.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Assigned to: {task.assigned_employee?.full_name || 'Unassigned'}
                    </p>
                    {task.due_date && (
                      <p className="text-sm text-gray-600">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {task.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created by: {task.created_by_employee?.full_name}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <p>No tasks found</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Admin;
