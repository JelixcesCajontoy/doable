
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/App";

const Index = () => {
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);

  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/dashboard/admin');
    } else if (userRole === 'employee') {
      navigate('/dashboard/employee');
    }
  }, [userRole, navigate]);

  // Show loading state while determining role
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Loading dashboard...</h2>
        <p className="text-sm text-gray-500 mt-2">Please wait while we redirect you...</p>
      </div>
    </div>
  );
};

export default Index;

