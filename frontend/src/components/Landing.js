import React from 'react';
import { Building, User, Heart, Star, Zap, DollarSign, ChartBar } from 'lucide-react';
import { GameCardCarousel } from './GameCard';
import { GameBoy } from './GameBoy';
import BombasticText from '../assets/fonts/mario';
import LoginButton from './LogInButton/LoginButton';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogOutButton/LogoutButton';
import org_dashboard from './org_dashboard';
import emp_dashboard from './emp_dashboard';

const Landing = () => {
  const { isAuthenticated } = useAuth0();

  const cards = [
    {
      title: "Receipt Scanner",
      description: "Automatically scan and process receipts using AI-powered OCR. Track expenses effortlessly!",
      year: "2025",
      Icon: Star,
      color: "from-green-100 to-green-200",
    },
    {
      title: "Fraud Detection",
      description: "Advanced AI algorithms to detect suspicious patterns and protect your finances.",
      year: "2025",
      Icon: Zap,
      color: "from-blue-100 to-blue-200",
    },
    {
      title: "Analytics Dashboard",
      description: "Visualize your spending patterns with interactive charts and insights.",
      year: "2025",
      Icon: ChartBar,
      color: "from-purple-100 to-purple-200",
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-purple-100 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BombasticText
              text="ExpenFlow"
              className="text-3xl text-gray-800"
              style={{ fontFamily: 'mario' }}
            />
          </div>

          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-12 border-b border-gray-200">
        <div className="col-span-6 p-20">
          <div className="text-[3.5rem] font-black mb-6 pt-14 leading-tight bg-gradient-to-r 
            from-purple-900 to-slate-900 text-transparent bg-clip-text">
            STREAMLINE
            <BombasticText
              text="EXPENSES"
              className="text-[3.5rem] text-purple-600"
              style={{ fontFamily: 'mario' }}
            />
            EFFORTLESSLY
          </div>
          <br></br>
          {/* <p className="text-gray-600 mb-8 text-2xl font-bold">Login </p> */}
          <div className="flex gap-4">
            <LoginButton
              link="orgdb"
              icon={<Building className="w-6 h-6" />}
              name="Organisation"
              design="bg-purple-900 text-white px-6 py-3 rounded-full hover:bg-purple-950 transition-colors text-lg font-medium flex items-center gap-2"
            />
            {/* <button className="bg-white border-2 border-purple-900 text-purple-900 px-8 py-4 rounded-full hover:bg-purple-50 transition-colors text-lg font-medium flex items-center gap-2">
              <User className="w-6 h-6" />
              Employee
            </button> */}
            <LoginButton
              link="userdb"
              icon={<User className="w-6 h-6" />}
              name="Employee"
              design="bg-white border-2 border-purple-900 text-purple-900 px-8 py-4 rounded-full hover:bg-purple-50 transition-colors text-lg font-medium flex items-center gap-2"
            />
          </div>
        </div>

        <GameBoy customContent={
          <div className="relative w-full h-full bg-black p-4">
            <div className="pixel-art-mario animate-walk"></div>
            <div className="floating-coins">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="pixel-art-coin animate-float" style={{
                  animationDelay: `${i * 0.5}s`,
                  left: `${20 + i * 20}%`
                }}></div>
              ))}
            </div>
          </div>
        } />
      </div>

      {/* Features Section with Auto-scroll Carousel */}
      <div className="py-24 bg-gradient-to-b from-purple-100 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-purple-900">FEATURES</h2>
          <div className="embla-carousel">
            <GameCardCarousel cards={cards} />
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .pixel-art-mario {
          width: 32px;
          height: 32px;
          background: url('/mario-sprite.png') no-repeat;
          position: absolute;
          bottom: 20%;
        }

        .pixel-art-coin {
          width: 50px;
          height: 50px;
          background: url('/coin-sprite.png') no-repeat;
          position: absolute;
          top: 40%;
        }

        @keyframes walk {
          from { transform: translateX(0); }
          to { transform: translateX(200px); }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }

        .animate-walk {
          animation: walk 3s infinite alternate;
        }

        .animate-float {
          animation: float 2s infinite ease-in-out;
        }

        .embla-carousel {
          position: relative;
          padding: 1.5rem;
        }

        .embla-carousel::before,
        .embla-carousel::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 5rem;
          z-index: 1;
          pointer-events: none;
        }

        .embla-carousel::before {
          left: 0;
          background: linear-gradient(to right, white, transparent);
        }

        .embla-carousel::after {
          right: 0;
          background: linear-gradient(to left, white, transparent);
        }
      `}</style>

      {/* Footer */}
      <footer className="bg-purple-200 text-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-purple-900 grid grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About ExpenFlow</h4>
              <p className="text-purple-900">Making expense tracking fun and secure.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-purple-900">
                <li>Receipt Scanner</li>
                <li>Fraud Detection</li>
                <li>Analytics</li>
                <li>Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-purple-900">
                <li>FAQ</li>
                <li>Contact</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-purple-900">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex justify-between items-center">
            <p className="text-purple-800">&copy; 2025 ExpenFlow. Bombastic X DJS ACM.</p>
            <div className="flex items-center gap-2 text-purple-800">
              <Heart className="w-4 h-4" />
              {/* <span className="text-purple-700">Made with love for smart spending</sp/an> */}
              Made with Love for Smart Spending
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;