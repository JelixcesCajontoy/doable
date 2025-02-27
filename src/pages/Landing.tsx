import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Mail, Phone, Users } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Doable</h1>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
              <a href="#services" className="text-gray-600 hover:text-primary transition-colors">Services</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
              <Link to="/login">
                <Button variant="default" size="sm" className="h-auto py-2">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Make It <span className="text-primary">Doable</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your ideas into reality with our comprehensive project management solution.
          </p>
          <Link to="/login">
            <Button size="lg" className="animate-fade-in">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">About Us</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              At Doable, we believe in turning complex challenges into manageable solutions. 
              Our platform empowers teams to collaborate effectively and deliver projects on time.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="h-screen flex items-center justify-center px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Project Management</h3>
              <p className="text-gray-600">Streamline your workflow with our intuitive project management tools.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
              <p className="text-gray-600">Connect your team and work together seamlessly in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Task Tracking</h3>
              <p className="text-gray-600">Keep track of progress with detailed task management features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8">
              Have questions? We're here to help!
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a href="mailto:contact@doable.com" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <Mail className="w-5 h-5" />
                contact@doable.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <Phone className="w-5 h-5" />
                (123) 456-7890
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Doable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;