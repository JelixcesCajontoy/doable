
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  client_name: string;
  client_email: string;
  budget: number;
  deadline: string;
};

type ProjectFormData = {
  name: string;
  description: string;
  status: string;
  client_name: string;
  client_email: string;
  budget: string;
  deadline: string;
};

const initialFormData: ProjectFormData = {
  name: "",
  description: "",
  status: "Planning",
  client_name: "",
  client_email: "",
  budget: "",
  deadline: "",
};

const Projects = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const { data: projects = [], refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
        return [];
      }

      return data as Project[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const projectData = {
      ...formData,
      budget: parseFloat(formData.budget),
    };

    const { error } = editingProject
      ? await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject)
      : await supabase
          .from('projects')
          .insert([projectData]);

    if (error) {
      toast({
        title: "Error",
        description: editingProject 
          ? "Failed to update project" 
          : "Failed to create project",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: editingProject 
          ? "Project updated successfully" 
          : "Project created successfully",
      });
      refetch();
      handleCloseDialog();
    }
    setIsLoading(false);
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      client_name: project.client_name,
      client_email: project.client_email,
      budget: project.budget.toString(),
      deadline: project.deadline,
    });
    setEditingProject(project.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingProject(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) =>
                    setFormData({ ...formData, client_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) =>
                    setFormData({ ...formData, client_email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.client_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${project.budget.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(project.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditProject(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No projects found. Create your first project!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
