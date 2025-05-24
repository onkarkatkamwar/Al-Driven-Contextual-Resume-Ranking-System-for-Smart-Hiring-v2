
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser(null);
    // In a real app, you would also clear tokens/cookies
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-brand-blue">ResumeMatch</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Hello, {user.name}</span>
                <Link to={user.role === "HR" ? "/dashboard/hr" : "/dashboard/job-seeker"}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
