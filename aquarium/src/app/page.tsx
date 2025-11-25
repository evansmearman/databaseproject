"use client";

import { SetStateAction, useState } from 'react';
import { Menu, X, Home, Fish, Calendar, Ticket, Info, MapPin, User } from 'lucide-react';
import Image from 'next/image';

export default function AquariumPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exhibits', label: 'Exhibits', icon: Fish },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'visit', label: 'Plan Your Visit', icon: MapPin },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'auth', label: 'Login / Register', icon: User },
  ];

  const changePage = (pageId: SetStateAction<string>) => {
    setCurrentPage(pageId);
    setIsDrawerOpen(false);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage />;
      case 'exhibits':
        return <ExhibitsPage />;
      case 'events':
        return <EventsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'visit':
        return <VisitPage />;
      case 'about':
        return <AboutPage />;
      case 'auth':
        return <AuthPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ocean Background with Bubbles */}
      <div className="ocean">
        <div className="bubble bubble--1"></div>
        <div className="bubble bubble--2"></div>
        <div className="bubble bubble--3"></div>
        <div className="bubble bubble--4"></div>
        <div className="bubble bubble--5"></div>
        <div className="bubble bubble--6"></div>
        <div className="bubble bubble--7"></div>
        <div className="bubble bubble--9"></div>
        <div className="bubble bubble--10"></div>
        <div className="bubble bubble--11"></div>
        <div className="bubble bubble--12"></div>
      </div>

      {/* Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 bg-blue-900/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isDrawerOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
        <h1 className="text-xl font-bold text-white">🐠 Ocean Breeze Aquarium</h1>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-950/95 backdrop-blur-md z-50 transform transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => changePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 pt-16 text-white">
        {renderPage()}
      </main>

      <style jsx global>{`
        .ocean {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(0deg, #182848, #2980b9);
          z-index: 0;
        }

        .bubble {
          width: 30px;
          height: 30px;
          border-radius: 100%;
          position: absolute;
          background-color: white;
          bottom: -30px;
          opacity: 0.2;
          animation: bubble 15s ease-in-out infinite,
            sideWays 4s ease-in-out infinite alternate;
        }

        @keyframes bubble {
          0% {
            transform: translateY(0%);
            opacity: 0.06;
          }
          100% {
            transform: translateY(-120vh);
          }
        }

        @keyframes sideWays {
          0% {
            margin-left: 0px;
          }
          100% {
            margin-left: 200px;
          }
        }

        .bubble--1 {
          left: 10%;
          animation-delay: 0.5s;
          animation-duration: 16s;
          opacity: 0.2;
        }

        .bubble--2 {
          width: 15px;
          height: 15px;
          left: 40%;
          animation-delay: 1s;
          animation-duration: 10s;
          opacity: 0.1;
        }

        .bubble--3 {
          width: 10px;
          height: 10px;
          left: 30%;
          animation-delay: 5s;
          animation-duration: 20s;
          opacity: 0.3;
        }

        .bubble--4 {
          width: 25px;
          height: 25px;
          left: 40%;
          animation-delay: 8s;
          animation-duration: 17s;
          opacity: 0.2;
        }

        .bubble--5 {
          width: 30px;
          height: 30px;
          left: 60%;
          animation-delay: 10s;
          animation-duration: 15s;
          opacity: 0.1;
        }

        .bubble--6 {
          width: 10px;
          height: 10px;
          left: 80%;
          animation-delay: 3s;
          animation-duration: 30s;
          opacity: 0.4;
        }

        .bubble--7 {
          width: 15px;
          height: 15px;
          left: 90%;
          animation-delay: -7s;
          animation-duration: 25s;
          opacity: 0.3;
        }

        .bubble--9 {
          width: 20px;
          height: 20px;
          left: 50%;
          bottom: 30px;
          animation-delay: -5s;
          animation-duration: 19s;
          opacity: 0.2;
        }

        .bubble--10 {
          width: 40px;
          height: 40px;
          left: 30%;
          bottom: 30px;
          animation-delay: -21s;
          animation-duration: 16s;
          opacity: 0.3;
        }

        .bubble--11 {
          width: 30px;
          height: 30px;
          left: 60%;
          bottom: 30px;
          animation-delay: -13.75s;
          animation-duration: 20s;
          opacity: 0.3;
        }

        .bubble--12 {
          width: 25px;
          height: 25px;
          left: 90%;
          bottom: 30px;
          animation-delay: -10.5s;
          animation-duration: 19s;
          opacity: 0.3;
        }

        @media (prefers-reduced-motion: reduce) {
          .bubble {
            animation: none;
            opacity: 0.12;
          }
        }
      `}</style>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <section className="flex flex-col items-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to Ocean Breeze</h1>
        <p className="text-lg max-w-xl opacity-90">
          Explore vibrant fish, peaceful tanks, and the beauty of the underwater world.
        </p>

        <div className="mt-8">
          <Image
            src="https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=600&fit=crop"
            alt="Colorful fish swimming"
            width={600}
            height={600}
            className="rounded-2xl drop-shadow-2xl"
          />
        </div>
      </section>

      <section className="px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-6 text-center">Featured Tanks</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop"
              alt="Clownfish"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Clownfish Reef</h3>
            <p className="text-sm opacity-80">
              Bright, friendly, and iconic — home to clownfish and soft corals.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop&sat=-100&hue=180"
              alt="Jellyfish"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Jelly Drift</h3>
            <p className="text-sm opacity-80">
              A calming tank with moon jellyfish floating endlessly.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&h=500&fit=crop"
              alt="Seahorse tank"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Seahorse Garden</h3>
            <p className="text-sm opacity-80">
              Graceful seahorses swimming around a plant-filled habitat.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

// Exhibit Card Component
interface ExhibitCardProps {
  name: string;
  species: string;
  temp: string;
  description?: string;
}

function ExhibitCard({ name, species, temp, description }: ExhibitCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
      <h3 className="text-2xl font-semibold mb-2">{name}</h3>
      <p className="opacity-80">Species: {species}</p>
      <p className="opacity-80">Temperature: {temp}</p>
      {description && (
        <p className="opacity-70 mt-3 text-sm">{description}</p>
      )}
    </div>
  );
}

function ExhibitsPage() {
  const exhibits = [
    { 
      name: 'Coral Reef', 
      species: '50+ species', 
      temp: '78°F',
      description: 'A vibrant ecosystem teeming with colorful fish and living corals.'
    },
    { 
      name: 'Deep Sea Zone', 
      species: '30+ species', 
      temp: '45°F',
      description: 'Explore the mysterious depths with bioluminescent creatures.'
    },
    { 
      name: 'Tropical Paradise', 
      species: '75+ species', 
      temp: '82°F',
      description: 'Experience the warmth and beauty of tropical marine life.'
    },
    { 
      name: 'Shark Tunnel', 
      species: '15+ species', 
      temp: '72°F',
      description: 'Walk through an underwater tunnel surrounded by sharks and rays.'
    },
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Exhibits</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {exhibits.map((exhibit, idx) => (
          <ExhibitCard
            key={idx}
            name={exhibit.name}
            species={exhibit.species}
            temp={exhibit.temp}
            description={exhibit.description}
          />
        ))}
      </div>
    </div>
  );
}

function EventsPage() {
  const events = [
    { title: 'Feeding Time', time: '11:00 AM & 3:00 PM', date: 'Daily' },
    { title: 'Dive with Sharks', time: '2:00 PM', date: 'Weekends' },
    { title: 'Kids Ocean Workshop', time: '10:00 AM', date: 'Saturdays' },
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Upcoming Events</h1>
      <div className="space-y-4 max-w-2xl mx-auto">
        {events.map((event, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p className="opacity-80">{event.time} - {event.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketsPage() {
  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Tickets & Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-2xl font-semibold mb-2">Adult</h3>
          <p className="text-4xl font-bold mb-2">$25</p>
          <p className="opacity-80">Ages 13+</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-2xl font-semibold mb-2">Child</h3>
          <p className="text-4xl font-bold mb-2">$15</p>
          <p className="opacity-80">Ages 3-12</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-2xl font-semibold mb-2">Senior</h3>
          <p className="text-4xl font-bold mb-2">$20</p>
          <p className="opacity-80">Ages 65+</p>
        </div>
      </div>
    </div>
  );
}

function VisitPage() {
  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Plan Your Visit</h1>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Hours</h3>
          <p className="opacity-80">Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p className="opacity-80">Saturday - Sunday: 8:00 AM - 8:00 PM</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Location</h3>
          <p className="opacity-80">123 Ocean Drive</p>
          <p className="opacity-80">Seaside, CA 90210</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Parking</h3>
          <p className="opacity-80">Free parking available on-site</p>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <p className="text-lg mb-4 opacity-90">
          Ocean Breeze Aquarium has been dedicated to marine conservation and education since 1995. 
          Our mission is to inspire wonder and respect for the ocean&apos;s incredible biodiversity.
        </p>
        <p className="text-lg mb-4 opacity-90">
          With over 10,000 animals representing 500+ species, we provide an immersive experience 
          that connects visitors with the beauty and fragility of marine ecosystems.
        </p>
        <p className="text-lg opacity-90">
          We are committed to conservation efforts, rescue and rehabilitation programs, and 
          educational initiatives that make a difference for our oceans.
        </p>
      </div>
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = () => {
    // Handle authentication logic here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="px-6 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm opacity-80 hover:opacity-100 transition-opacity underline"
            >
              {isLogin 
                ? "Don't have an account? Register here" 
                : "Already have an account? Login here"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}