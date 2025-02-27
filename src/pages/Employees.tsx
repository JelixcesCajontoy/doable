
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Employee {
  id: string;
  full_name: string | null;
  created_at: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch employees",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newEmployee.email,
        password: newEmployee.password,
        options: {
          data: {
            full_name: newEmployee.full_name,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Success",
        description: "Employee account created successfully",
      });

      setIsOpen(false);
      setNewEmployee({ email: '', password: '', full_name: '' });
      // Refresh the employee list
      fetchEmployees();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create employee account",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading employees...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your employee accounts</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Employee</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleCreateEmployee} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newEmployee.full_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Employee Account
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {employee.full_name || "Unnamed Employee"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(employee.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
        
        {employees.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
