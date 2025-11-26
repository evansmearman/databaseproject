"use client";

import { SetStateAction, useState } from 'react';
import { Menu, X, Home, Fish, Info, MapPin, User, Users, BookOpen, Heart } from 'lucide-react';
import Image from 'next/image';

export default function AquariumPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [staffMode, setStaffMode] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exhibits', label: 'Exhibits & Tanks', icon: Fish },
    { id: 'animals', label: 'Our Animals', icon: Heart },
    { id: 'programs', label: 'Educational Programs', icon: BookOpen },
    { id: 'membership', label: 'Membership', icon: Users },
    { id: 'visit', label: 'Plan Your Visit', icon: MapPin },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'auth', label: 'Login', icon: User },
    { id: 'staff', label: 'Staff Dashboard', icon: User },
  ];

  const changePage = (pageId: SetStateAction<string>) => {
    setCurrentPage(pageId);
    setIsDrawerOpen(false);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage changePage={changePage} />;
      case 'exhibits':
        return <ExhibitsPage />;
      case 'animals':
        return <AnimalsPage />;
      case 'programs':
        return <ProgramsPage />;
      case 'membership':
        return <MembershipPage />;
      case 'visit':
        return <VisitPage />;
      case 'about':
        return <AboutPage />;
      case 'auth':
        return <AuthPage />;
      case 'staff':
        return <StaffDashboard staffMode={staffMode} />;
      default:
        return <HomePage changePage={changePage} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      <header className="fixed top-0 left-0 right-0 bg-blue-900/80 backdrop-blur-md z-40 px-4 py-3 flex items-center gap-4 justify-between">
  <div className="flex items-center gap-4">
    <button
      onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
    >
      {isDrawerOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
    </button>
    <h1 className="text-xl font-bold text-white">🐠 Inner Harbor Aquarium</h1>
  </div>

  {/* STAFF MODE TOGGLE */}
  <button
    onClick={() => setStaffMode(!staffMode)}
    className={`px-4 py-2 rounded-lg font-semibold transition ${
      staffMode ? "bg-green-600" : "bg-white/20"
    }`}
  >
    {staffMode ? "Staff Mode: ON" : "Staff Mode: OFF"}
  </button>
</header>


      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-950/95 backdrop-blur-md z-50 transform transition-transform duration-300 overflow-y-auto ${
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

function HomePage({ changePage }: { changePage: (page: string) => void }) {
  return (
    <>
      <section className="flex flex-col items-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to Inner Harbor Aquarium</h1>
        <p className="text-lg max-w-2xl opacity-90 mb-2">
          A non-profit aquarium dedicated to exhibition, conservation, and education of aquatic life.
        </p>
        <p className="text-base max-w-2xl opacity-80">
          Promoting public understanding of marine ecosystems while ensuring the health and welfare of aquatic life.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          <button
            onClick={() => changePage('exhibits')}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <Fish size={40} className="mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Explore Exhibits</h3>
            <p className="text-sm opacity-80">Marine and freshwater ecosystems</p>
          </button>

          <button
            onClick={() => changePage('programs')}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <BookOpen size={40} className="mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Educational Programs</h3>
            <p className="text-sm opacity-80">Feeding shows and tours</p>
          </button>

          <button
            onClick={() => changePage('membership')}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <Users size={40} className="mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Become a Member</h3>
            <p className="text-sm opacity-80">Support conservation efforts</p>
          </button>
        </div>
      </section>

      <section className="px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-6 text-center">Featured Exhibits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop"
              alt="Coral Reef"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Coral Reef Exhibit</h3>
            <p className="text-sm opacity-80">Vibrant tropical ecosystem</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1564053489984-317bbd824340?w=800&h=500&fit=crop"
              alt="Shark Tank"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Shark Tank</h3>
            <p className="text-sm opacity-80">Majestic shark species</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300">
            <Image
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop&sat=-100&hue=180"
              alt="Jellyfish"
              width={800}
              height={500}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Jellyfish Room</h3>
            <p className="text-sm opacity-80">Graceful jellyfish displays</p>
          </div>
        </div>
      </section>
    </>
  );
}

function ExhibitsPage() {
  const exhibits = [
    { 
      name: 'Coral Reef Exhibit', 
      location: 'Main Hall - East Wing',
      tanks: 3,
      species: '50+ species',
      type: 'Saltwater',
      temp: '78°F',
      description: 'Tropical ecosystem with clownfish, tangs, angelfish, and living coral.'
    },
    { 
      name: 'Shark Tank', 
      location: 'Main Hall - Center',
      tanks: 2,
      species: '15+ species',
      type: 'Saltwater',
      temp: '72°F',
      description: 'Features Sand Tigers, Nurse Sharks, rays, and underwater viewing tunnel.'
    },
    { 
      name: 'Jellyfish Room', 
      location: 'North Wing',
      tanks: 4,
      species: 'Moon Jellies, Sea Nettles',
      type: 'Saltwater',
      temp: '68°F',
      description: 'Cylindrical tanks with controlled currents for graceful jellyfish.'
    },
    { 
      name: 'Amazon River Exhibit', 
      location: 'South Wing',
      tanks: 5,
      species: '75+ freshwater species',
      type: 'Freshwater',
      temp: '78-82°F',
      description: 'Piranhas, electric eels, freshwater rays, and colorful cichlids.'
    },
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Exhibits & Tanks</h1>
      <p className="text-center opacity-90 mb-8 max-w-3xl mx-auto">
        Each exhibit replicates natural habitats with precise water parameters and tank conditions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {exhibits.map((exhibit, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all">
            <h3 className="text-2xl font-semibold mb-3">{exhibit.name}</h3>
            <div className="space-y-1 text-sm">
              <p className="opacity-90"><strong>Location:</strong> {exhibit.location}</p>
              <p className="opacity-90"><strong>Tanks:</strong> {exhibit.tanks}</p>
              <p className="opacity-90"><strong>Type:</strong> {exhibit.type}</p>
              <p className="opacity-90"><strong>Temperature:</strong> {exhibit.temp}</p>
              <p className="opacity-90"><strong>Species:</strong> {exhibit.species}</p>
              <p className="opacity-80 mt-2">{exhibit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimalsPage() {
  const animals = [
    { 
      id: 'anm001',
      name: 'Thunder', 
      species: 'Sand Tiger Shark', 
      group: 'Sharks',
      sex: 'Male', 
      dob: '2018-03-15', 
      exhibit: 'Shark Tank',
      feedingType: 'Carnivore'
    },
    { 
      id: 'anm002',
      name: 'Luna', 
      species: 'Nurse Shark', 
      group: 'Sharks',
      sex: 'Female', 
      dob: '2019-07-22', 
      exhibit: 'Shark Tank',
      feedingType: 'Carnivore'
    },
    { 
      id: 'anm011',
      name: 'Sheldon', 
      species: 'Green Sea Turtle', 
      group: 'Turtles',
      sex: 'Male', 
      dob: '2015-08-12', 
      exhibit: 'Coral Reef',
      feedingType: 'Herbivore'
    },
    { 
      id: 'anm021',
      name: 'Nemo Jr.', 
      species: 'Clownfish', 
      group: 'Tropical Fish',
      sex: 'Male', 
      dob: '2023-09-01', 
      exhibit: 'Coral Reef',
      feedingType: 'Omnivore'
    },
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Our Animals</h1>
      <p className="text-center opacity-90 mb-8 max-w-3xl mx-auto">
        Meet our aquatic residents receiving specialized care from dedicated aquarists.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {animals.map((animal) => (
          <div key={animal.id} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-3">{animal.name}</h3>
            <div className="space-y-1 text-sm">
              <p className="opacity-90"><strong>Animal ID:</strong> {animal.id}</p>
              <p className="opacity-90"><strong>Species:</strong> {animal.species}</p>
              <p className="opacity-90"><strong>Group:</strong> {animal.group}</p>
              <p className="opacity-90"><strong>Sex:</strong> {animal.sex}</p>
              <p className="opacity-90"><strong>Date of Birth:</strong> {animal.dob}</p>
              <p className="opacity-90"><strong>Exhibit:</strong> {animal.exhibit}</p>
              <p className="opacity-90"><strong>Feeding Type:</strong> {animal.feedingType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgramsPage() {
  const programs = [
    { 
      id: 'PRG001',
      name: 'Shark Feeding Show', 
      startTime: '11:00 AM',
      endTime: '11:30 AM',
      schedule: 'Daily (11:00 AM & 3:00 PM)',
      supervisor: 'Dr. Sarah Mitchell',
      location: 'Shark Tank'
    },
    { 
      id: 'PRG002',
      name: 'Penguin Talk', 
      startTime: '10:30 AM',
      endTime: '11:00 AM',
      schedule: 'Daily (10:30 AM & 2:30 PM)',
      supervisor: 'James Rodriguez',
      location: 'Penguin Cove'
    },
    { 
      id: 'PRG003',
      name: 'Behind the Scenes Tour', 
      startTime: '1:00 PM',
      endTime: '2:30 PM',
      schedule: 'Weekends Only',
      supervisor: 'Dr. Emily Chen',
      location: 'Research Lab'
    },
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Educational Programs</h1>
      <p className="text-center opacity-90 mb-8 max-w-3xl mx-auto">
        Programs supervised by experienced aquarists and marine biologists.
      </p>
      <div className="space-y-4 max-w-4xl mx-auto">
        {programs.map((program) => (
          <div key={program.id} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{program.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p className="opacity-90"><strong>Program ID:</strong> {program.id}</p>
              <p className="opacity-90"><strong>Time:</strong> {program.startTime} - {program.endTime}</p>
              <p className="opacity-90"><strong>Schedule:</strong> {program.schedule}</p>
              <p className="opacity-90"><strong>Location:</strong> {program.location}</p>
              <p className="opacity-90 md:col-span-2"><strong>Supervisor:</strong> {program.supervisor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembershipPage() {
  const memberships = [
    {
      type: 'Individual',
      price: '$65/year',
      benefits: ['Unlimited admission for 1', '10% gift shop discount', 'Member events', 'Free parking']
    },
    {
      type: 'Family',
      price: '$120/year',
      benefits: ['Admission for up to 4', '15% discounts', 'Priority registration', 'Member preview days']
    },
    {
      type: 'Corporate',
      price: '$500/year',
      benefits: ['Admission for up to 10', '20% discounts', 'Behind-scenes tour', 'Donor recognition']
    }
  ];

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Membership Plans</h1>
      <p className="text-center opacity-90 mb-8 max-w-3xl mx-auto">
        Support conservation while enjoying exclusive benefits.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {memberships.map((m, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">{m.type}</h3>
            <p className="text-4xl font-bold mb-4">{m.price}</p>
            <div className="text-left space-y-2">
              {m.benefits.map((b, i) => (
                <p key={i} className="text-sm opacity-90">✓ {b}</p>
              ))}
            </div>
            <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold transition-all">
              Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisitPage() {
  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Plan Your Visit</h1>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Hours</h3>
          <p className="opacity-90">Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p className="opacity-90">Saturday - Sunday: 8:00 AM - 8:00 PM</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Location</h3>
          <p className="opacity-90">123 Harbor Drive</p>
          <p className="opacity-90">Baltimore, MD 21202</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Admission</h3>
          <p className="opacity-90">Adults (13+): $25</p>
          <p className="opacity-90">Children (3-12): $15</p>
          <p className="opacity-90">Seniors (65+): $20</p>
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
          The Inner Harbor Aquarium is a non-profit organization dedicated to exhibition, conservation, and education of aquatic life.
        </p>
        <p className="text-lg mb-4 opacity-90">
          Our mission is to promote public understanding of marine ecosystems while ensuring the health and welfare of all aquatic organisms.
        </p>
        <p className="text-lg opacity-90">
          We support environmental awareness programs and sustainability initiatives to foster ocean conservation for future generations.
        </p>
      </div>
    </div>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<"member" | "staff" | "signup">("member");

  const [formData, setFormData] = useState({
    memberEmail: "",
    memberPassword: "",
    staffId: "",
    staffEmail: "",
    staffPassword: "",
    newMemberName: "",
    newMemberEmail: "",
    newMemberPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (mode === "member") {
      console.log("Member login:", {
        email: formData.memberEmail,
        password: formData.memberPassword,
      });
    } else if (mode === "staff") {
      console.log("Staff login:", {
        staffId: formData.staffId,
        email: formData.staffEmail,
        password: formData.staffPassword,
      });
    } else {
      console.log("New member account:", {
        name: formData.newMemberName,
        email: formData.newMemberEmail,
        password: formData.newMemberPassword,
      });
    }
  };

  return (
    <div className="px-6 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">

        {/* ---------------- HEADER ---------------- */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === "member" && "Member Login"}
          {mode === "staff" && "Staff Login"}
          {mode === "signup" && "Become a Member"}
        </h1>

        {/* ---------------- MEMBER LOGIN ---------------- */}
        {mode === "member" && (
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="memberEmail"
                value={formData.memberEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="memberPassword"
                value={formData.memberPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg 
              transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign In
            </button>

            <p className="mt-4 text-center">
              <button
                onClick={() => setMode("signup")}
                className="text-blue-300 hover:underline"
              >
                Become a Member
              </button>
              {" "} | {" "}
              <button
                onClick={() => setMode("staff")}
                className="text-blue-300 hover:underline"
              >
                Staff Login
              </button>
            </p>
          </div>
        )}

        {/* ---------------- STAFF LOGIN ---------------- */}
        {mode === "staff" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Staff ID</label>
              <input
                type="text"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your staff ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="staffEmail"
                value={formData.staffEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your staff email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="staffPassword"
                value={formData.staffPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg 
              transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Staff Sign In
            </button>

            <p className="mt-4 text-center">
              <button
                onClick={() => setMode("member")}
                className="text-blue-300 hover:underline"
              >
                Member Login
              </button>
            </p>
          </div>
        )}

        {/* ---------------- MEMBER SIGN UP ---------------- */}
        {mode === "signup" && (
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="newMemberName"
                value={formData.newMemberName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="newMemberEmail"
                value={formData.newMemberEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="newMemberPassword"
                value={formData.newMemberPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:border-white/50 
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Create a password"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg 
              transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Account
            </button>

            <p className="mt-4 text-center text-sm">
              Already a member?{" "}
              <button
                onClick={() => setMode("member")}
                className="text-blue-300 hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
interface Record {
  [key: string]: string | number;
}

function StaffDashboard({ staffMode }: { staffMode: boolean }) {
  const [animals, setAnimals] = useState<Record[]>([]);
  const [staff, setStaff] = useState<Record[]>([]);
  const [exhibits, setExhibits] = useState<Record[]>([]);
  const [tanks, setTanks] = useState<Record[]>([]);
  const [programs, setPrograms] = useState<Record[]>([]);
  const [visitors, setVisitors] = useState<Record[]>([]);
  const [memberships, setMemberships] = useState<Record[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<Record[]>([]);
  const [healthRecords, setHealthRecords] = useState<Record[]>([]);

  if (!staffMode) {
    return (
      <div className="px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Staff Dashboard</h1>
        <p className="text-lg opacity-80">You must enable Staff Mode to access this page.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Staff Dashboard (UI Only)</h1>

      <p className="text-center opacity-80 mb-10">
        These tools allow staff to add, update, and view aquarium records.
        <br />All data is temporary until database implementation.
      </p>

      {/* SECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ANIMAL FORM */}
        <StaffInputCard
          title="Add Animal"
          onSubmit={(data) => setAnimals([...animals, data])}
          fields={["id", "name", "species", "exhibit", "feedingType"]}
        />

        {/* STAFF FORM */}
        <StaffInputCard
          title="Add Staff Member"
          onSubmit={(data) => setStaff([...staff, data])}
          fields={["id", "name", "role", "phone"]}
        />

        {/* EXHIBIT FORM */}
        <StaffInputCard
          title="Add Exhibit"
          onSubmit={(data) => setExhibits([...exhibits, data])}
          fields={["id", "name", "location"]}
        />

        {/* TANK FORM */}
        <StaffInputCard
          title="Add Tank"
          onSubmit={(data) => setTanks([...tanks, data])}
          fields={["id", "name", "exhibit", "temperature"]}
        />

        {/* PROGRAM FORM */}
        <StaffInputCard
          title="Add Program"
          onSubmit={(data) => setPrograms([...programs, data])}
          fields={["id", "name", "schedule"]}
        />

        {/* VISITOR FORM */}
        <StaffInputCard
          title="Add Visitor"
          onSubmit={(data) => setVisitors([...visitors, data])}
          fields={["id", "name", "guardian", "emergencyPhone"]}
        />

        {/* MEMBERSHIP FORM */}
        <StaffInputCard
          title="Add Membership"
          onSubmit={(data) => setMemberships([...memberships, data])}
          fields={["id", "memberName", "tier"]}
        />

        {/* FEEDING RECORD */}
        <StaffInputCard
          title="Add Feeding Record"
          onSubmit={(data) => setFeedingRecords([...feedingRecords, data])}
          fields={["animalId", "food", "time"]}
        />

        {/* HEALTH RECORD */}
        <StaffInputCard
          title="Add Health Record"
          onSubmit={(data) => setHealthRecords([...healthRecords, data])}
          fields={["animalId", "condition", "notes"]}
        />

      </div>

      {/* DISPLAY LISTS */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-4">Generated Lists</h2>

        <ListDisplay label="Animals" data={animals} />
        <ListDisplay label="Staff" data={staff} />
        <ListDisplay label="Exhibits" data={exhibits} />
        <ListDisplay label="Tanks" data={tanks} />
        <ListDisplay label="Programs" data={programs} />
        <ListDisplay label="Visitors" data={visitors} />
        <ListDisplay label="Memberships" data={memberships} />
        <ListDisplay label="Feeding Records" data={feedingRecords} />
        <ListDisplay label="Health Records" data={healthRecords} />
      </div>
    </div>
  );
}
type StaffInputCardProps = {
  title: string;
  fields: string[];
  onSubmit: (data: Record) => void;
};

function StaffInputCard({ title, fields, onSubmit }: StaffInputCardProps) {
  const [form, setForm] = useState<Record>({});

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      <div className="space-y-3">
        {fields.map((f) => (
          <input
            key={f}
            placeholder={f}
            className="w-full p-2 rounded bg-white/20"
            onChange={(e) => handleChange(f, e.target.value)}
          />
        ))}
      </div>

      <button
        onClick={() => onSubmit(form)}
        className="mt-4 bg-blue-500 hover:bg-blue-600 w-full py-2 rounded-lg"
      >
        Save
      </button>
    </div>
  );
}
function ListDisplay({ label, data }: { label: string; data: Record[] }) {
  return (
    <div className="mb-8 bg-white/10 p-6 rounded-xl backdrop-blur">
      <h3 className="text-2xl font-bold mb-4">{label}</h3>
      {data.length === 0 ? (
        <p className="opacity-70">No entries.</p>
      ) : (
        <pre className="bg-black/20 p-4 rounded text-sm whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}