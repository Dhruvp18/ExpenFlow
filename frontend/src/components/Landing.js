import React, { useEffect } from "react";
import {
  Bot,
  Building,
  Clipboard,
  User,
  Heart,
  Star,
  Zap,
  DollarSign,
  ChartBar,
  Receipt,
  Shield,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LogInButton/LoginButton";
import Navbar from "./Navbar"; 
import LogoutButton from "./LogOutButton/LogoutButton";

const Landing = () => {
  const { isAuthenticated } = useAuth0();

  const features = [
    {
      icon: <Receipt className="w-8 h-8" />,
      title: "Smart Receipt Processing",
      description:
        "AI-powered OCR technology automatically extracts and organizes receipt data with high accuracy",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Fraud Detection",
      description:
        "Advanced anomaly detection algorithms identify suspicious patterns and duplicate submissions",
    },
    {
      icon: <ChartBar className="w-8 h-8" />,
      title: "Interactive Analytics",
      description:
        "Real-time dashboards and insights to track spending patterns across departments",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automated Compliance",
      description:
        "Policy violation checks and automated flagging ensure adherence to company guidelines",
    },
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".fade-in-section").forEach((elem) => {
      observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100">
      
      <Navbar /> 
     
      <div className="pt-32 pb-20 px-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-section opacity-0">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight py-8 mb-6 bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Expense Management
              </h1>
              <p className="text-xl text-purple-900 mb-8">
                Streamline your expense reporting with automated receipt
                processing, fraud detection, and real-time analytics. <br />
                <br />
                <div className=" text-purple-900">Get Started Now</div>
              </p>
              <div className="flex gap-4">
                <LoginButton
                  link=""
                  icon={<Building className="w-6 h-6" />}
                  name="Organisation"
                  design="bg-purple-900 text-white px-6 py-3 rounded-full hover:bg-purple-950 transition-colors text-lg font-medium flex items-center gap-2"
                />
                <LoginButton
                  link=""
                  icon={<User className="w-6 h-6" />}
                  name="Employee"
                  design="bg-white border-2 border-purple-900 text-purple-900 px-8 py-4 rounded-full hover:bg-purple-50 transition-colors text-lg font-medium flex items-center gap-2"
                />
                <LogoutButton />
              </div>
            </div>
            <div className="fade-in-section opacity-0 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative pl-20">
                  <img
                    src="https://blogimage.vantagecircle.com/content/images/2023/05/Office-break-room-ideas-1.png"
                    alt="Dashboard Preview"
                    className="rounded-lg shadow-2xl float-smooth"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="fade-in-section opacity-0 p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors duration-300"
              >
                <div className="text-purple-900 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-purple-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      <footer className="bg-purple-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ExpenFlow</h3>
              <p className="text-purple-200 pb-100">
                Making expense management smarter and more secure.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-purple-200">
                <li>Features</li>
                <li>Security</li>
                <li>Enterprise</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-purple-200">
                <li>About Us</li>
                <li>Contact</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-purple-200">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800 mt-8 pt-8 flex justify-between items-center">
            <p className="text-purple-200">&copy; 2025 DJS ACM X BOMBASTICC</p>
            <div className="flex items-center gap-2 text-purple-200">
              <Heart className="w-4 h-4" />
              Made with Love
            </div>
          </div>
        </div>
      </footer>
      <style jsx>{`
        @keyframes subtleFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .float-smooth {
          animation: subtleFloat 3s ease-in-out infinite;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
