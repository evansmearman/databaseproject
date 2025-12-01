"use client";

// ADD useEffect to the list of imports
import { SetStateAction, useState, useEffect } from 'react';
import { Menu, X, Home, Fish, Info, MapPin, User, Users, BookOpen, Heart } from 'lucide-react';
import Image from 'next/image';

// Add this near the top of page.tsx
interface ListDisplayProps {
    label: string;
    endpoint: string; // The URL path (e.g., 'animals', 'tanks')
}

// Define the expected structure for Exhibits Page data from the database
interface ExhibitDetail {
  exhibit_id: string;
  exhibit_name: string;
  location: string;
  lead_aquarist_name: string; 
  total_tanks: number;        // Calculated from DB
  total_animals: number;      // Calculated from DB
}

// ==========================================================
// 1. Data Structure Interface (Type Definition)
// Define the expected structure for Animal data from the database
// ==========================================================
interface AnimalDetail {
  animal_id: number;
  common_name: string;
  species: string;
  birth_date: string; // e.g., "2018-03-15T00:00:00.000Z"
  sex: 'M' | 'F' | 'Unknown';
  exhibit_name: string;
  // Assuming the API endpoint includes these fields, or we use placeholders.
  animal_group: string; 
  feeding_type: string;
}

interface TankDetail {
  tank_id: string;
  tank_type: string;
  tank_size: number;
  water_type: string;
  // This name MUST match the alias in the SQL query above!
}

interface FullExhibitDetail {
  exhibit_name: string;
  location: string;
  lead_aquarist_name: string;
  tanks: TankDetail[];
}

// Function to handle the API call for the Exhibits Page
async function fetchExhibitDetails(): Promise<ExhibitDetail[]> {
  const API_URL = "http://localhost:5000/exhibits-details"; 
  
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: ExhibitDetail[] = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching exhibit details:", error);
    return []; // Return an empty array on failure
  }
}

export default function AquariumPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [userType, setUserType] = useState<string | null>(null);
  
  // keep auth state in sync with localStorage and listen for auth changes
  useEffect(() => {
    const syncAuth = () => {
      if (typeof window === 'undefined') return;
      const ut = localStorage.getItem('userType');
      setUserType(ut);

      const cp = localStorage.getItem('currentPage');
      if (cp) setCurrentPage(cp as string);
    };

    syncAuth();

    const onAuthChange = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      if (typeof detail.userType === 'string') setUserType(detail.userType);
      if (typeof detail.page === 'string') setCurrentPage(detail.page);
    };

    window.addEventListener('authChange', onAuthChange as EventListener);
    return () => window.removeEventListener('authChange', onAuthChange as EventListener);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exhibits', label: 'Exhibits & Tanks', icon: Fish },
    { id: 'animals', label: 'Our Animals', icon: Heart },
    { id: 'programs', label: 'Educational Programs', icon: BookOpen },
    { id: 'membership', label: 'Membership', icon: Users },
    { id: 'visit', label: 'Plan Your Visit', icon: MapPin },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'auth', label: 'Login', icon: User },
    ...(userType === 'staff' ? [{ id: 'staff', label: 'Staff Dashboard', icon: User }] : []),
  ];

  const changePage = (pageId: SetStateAction<string>) => {
    setCurrentPage(pageId);
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentPage');
    setUserType(null);
    setCurrentPage('home');
    window.dispatchEvent(new CustomEvent('authChange', { detail: { userType: null, page: 'home' } }));
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
        return <StaffDashboard />;
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
  {userType && (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 transition"
    >
      Logout
    </button>
  )}
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

// Define the expected structure for our Exhibit data from the database
interface FeaturedExhibit {
  exhibit_id: string;
  exhibit_name: string;
  location: string;
  lead_aquarist_name: string; // Fetched from the JOIN query
  image_url: string;          // Will be determined client-side as it's not in the DB
}

// Function to handle the API call
async function fetchFeaturedExhibits(): Promise<FeaturedExhibit[]> {
  // Your Express server is running on port 5000
  const API_URL = "http://localhost:5000/featured-exhibits"; 
  
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: FeaturedExhibit[] = await res.json();
    
    // Client-side logic to map API data to a display structure (including a placeholder image)
    return data.map(item => ({
        ...item,
        // Simple mapping to use one of the placeholder images based on the exhibit name
        image_url: 
            item.exhibit_name.includes("Coral") ? "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop" : 
            item.exhibit_name.includes("Shark") ? "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=800&h=500&fit=crop" :
            item.exhibit_name.includes("Penguin") ? "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop&sat=-100&hue=180" :
            "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=600&fit=crop"
    }));
    
  } catch (error) {
    console.error("Error fetching featured exhibits:", error);
    return []; // Return an empty array on failure
  }
}

function HomePage({ changePage }: { changePage: (page: string) => void }) {
  const [featuredExhibits, setFeaturedExhibits] = useState<FeaturedExhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch data when the component mounts
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchFeaturedExhibits();
      setFeaturedExhibits(data);
      setIsLoading(false);
    }
    loadData();
  }, []); // Empty array ensures this runs only once
  
  return (
    <>
      <section className="flex flex-col items-center text-center py-20 px-4">
        {/* ... (Existing static content - Welcome, Buttons) ... */}
        <h1 className="text-5xl font-bold mb-4">Welcome to Inner Harbor Aquarium</h1>
        <p className="text-lg max-w-2xl opacity-90 mb-2">
          A non-profit aquarium dedicated to exhibition, conservation, and education of aquatic life.
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

      {/* 3. Dynamic Rendering of Featured Exhibits */}
      <section className="px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-6 text-center">Featured Exhibits</h2>
        
        {isLoading ? (
          <p className="text-center opacity-80">Loading featured exhibits...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredExhibits.map((exhibit) => (
              <div 
                key={exhibit.exhibit_id} 
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300"
              >
                <Image
                  src={exhibit.image_url}
                  alt={exhibit.exhibit_name}
                  width={800}
                  height={500}
                  className="rounded-xl object-cover h-48 w-full"
                />
                <h3 className="text-xl font-semibold mt-3">{exhibit.exhibit_name}</h3>
                <p className="text-sm opacity-80">Location: {exhibit.location}</p>
                <p className="text-xs opacity-60">Lead Aquarist: {exhibit.lead_aquarist_name}</p>
              </div>
            ))}
            {featuredExhibits.length === 0 && <p className="text-center opacity-80 col-span-3">No featured exhibits found or API connection failed.</p>}
          </div>
        )}
      </section>
    </>
  );
}

// ADDED IMPORTS: Ensure 'useEffect' is imported from 'react' at the top of page.tsx.
// import { SetStateAction, useState, useEffect } from 'react';


export function ExhibitsPage() {
  const [exhibits, setExhibits] = useState<ExhibitDetail[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Modal Management
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<FullExhibitDetail | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchExhibitDetails() 
      .then(data => {
        setExhibits(data);
        setError(null);
      })
      .catch(e => {
        console.error("Failed to load exhibits:", e);
        setError("Failed to load exhibit data. Please check server connection (port 5000) and API route."); 
        setExhibits([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const showDetails = async (exhibitId: string) => {
    setIsModalLoading(true);
    const details = await fetchFullExhibitDetails(exhibitId);
    setSelectedExhibit(details);
    setIsModalLoading(false);
  };

  const closeModal = () => {
    setSelectedExhibit(null);
  };
  
  // --- RENDERING LOGIC ---

  if (error) {
    return (
      <div className="p-6 text-white text-center">
        <div className="text-red-400 p-8 bg-red-900/50 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Data Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-4xl font-bold mb-8">Exhibits & Tanks</h2>
      <p className="text-lg opacity-80 mb-6">
        Explore our diverse ecosystems and the tanks that house our aquatic residents.
      </p>

      {/* Dynamic Rendering with Loading State */}
      {isLoading ? (
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-lg">Loading exhibit data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibits.map((exhibit) => (
            <div 
              key={exhibit.exhibit_id} 
              className="bg-white/10 p-6 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/20"
            >
              <h3 className="text-2xl font-semibold mb-2">{exhibit.exhibit_name}</h3>
              <p className="text-sm opacity-80 mb-4">{exhibit.location}</p>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Total Tanks:</span> {exhibit.total_tanks}
                </p>
                <p>
                  <span className="font-medium">Total Animals:</span> {exhibit.total_animals}
                </p>
                <p>
                  <span className="font-medium">Lead Aquarist:</span> {exhibit.lead_aquarist_name}
                </p>
              </div>

              {/* Button to open the modal */}
              <button 
                onClick={() => showDetails(exhibit.exhibit_id)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                disabled={isModalLoading}
              >
                {isModalLoading && selectedExhibit === null ? 'Loading...' : 'View Details'}
              </button>
            </div>
          ))}
          {exhibits.length === 0 && (
            <div className="col-span-full text-center p-10 bg-white/10 rounded-xl">
                <p className="text-lg font-bold">No exhibits were found.</p>
            </div>
          )}
        </div>
      )}

      {/* Renders the modal when a details object is available */}
      {selectedExhibit && <ExhibitDetailModal exhibit={selectedExhibit} onClose={closeModal} />}
    </div>
  );
}

async function fetchFullExhibitDetails(exhibitId: string): Promise<FullExhibitDetail | null> {
  const API_URL = `http://localhost:5000/exhibits-details/${exhibitId}`; 
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      // **CRITICAL: If the server returns a 404 or 500, this path is hit.**
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json() as Promise<FullExhibitDetail>;
  } catch (error) {
    // **This block is executed on failure (e.g., connection refusal, 404)**
    console.error(`Fetch error for exhibit ${exhibitId}:`, error); 
    return null; // This 'null' prevents the modal from opening
  }
}



// ==========================================================
// 2. API Fetching Function
// This mimics the fetchExhibitDetails function structure.
// ==========================================================
async function fetchAnimalDetails(): Promise<AnimalDetail[]> {
  // The API endpoint is derived from the server.js root list: "animals": "/animals"
  const API_URL = "http://localhost:5000/animals"; 
  
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: AnimalDetail[] = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching animal details:", error);
    return []; // Return an empty array on failure
  }
}

function ExhibitDetailModal({ exhibit, onClose }: { exhibit: FullExhibitDetail | null, onClose: () => void }) {
  // Since X is imported at the top of page.tsx, we can use it directly.

  if (!exhibit) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 text-white"
      onClick={onClose} 
    >
      <div 
        className="bg-blue-950/90 backdrop-blur-md p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
          <h3 className="text-3xl font-extrabold text-blue-300">{exhibit.exhibit_name}</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:text-red-400 transition-colors"
          >
            {/* Using the X component directly */}
            <X size={24} />
          </button>
        </div>

        <p className="text-lg mb-4">
          <span className="font-bold">Location:</span> {exhibit.location} | <span className="font-bold">Lead Aquarist:</span> {exhibit.lead_aquarist_name}
        </p>

        <h4 className="text-2xl font-semibold mt-6 mb-4 border-b border-white/10 pb-2">
          Associated Tanks ({exhibit.tanks.length})
        </h4>

        {exhibit.tanks.length === 0 ? (
          <p className="opacity-70 italic">This exhibit does not currently have any tanks recorded.</p>
        ) : (
          <div className="space-y-4">
            {exhibit.tanks.map(tank => (
              <div key={tank.tank_id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="font-bold text-xl mb-1">Tank ID: {tank.tank_id}</p>
                <div className="grid grid-cols-2 gap-x-4 text-sm opacity-80">
                  <p>Type: **{tank.tank_type}**</p>
                  <p>Water: **{tank.water_type}**</p>
                  {/* Update the key used here */}
                  <p className="col-span-2">Volume: **{tank.tank_size.toString()}** gallons</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// 3. Animals Page Component
// ==========================================================

// NOTE: We do NOT redefine the 'Record' type to avoid the build error.
// We rely on the existing ListDisplay definition: 
// function ListDisplay({ label, data }: { label: string; data: Record[] }) { ... } 

// We rely on the existing ListDisplay definition: 
// function ListDisplay({ label, data }: { label: string; data: Record[] }) { ... } 

export function AnimalsPage() {
  const [animals, setAnimals] = useState<AnimalDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchAnimalDetails()
      .then(data => {
        setAnimals(data);
        setError(null);
      })
      .catch(e => {
        console.error("Failed to load animals:", e);
        setError("Failed to load animal data. Check the server connection and API endpoint.");
        setAnimals([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // --- RENDERING LOGIC ---

  if (isLoading) {
    return (
      <div className="text-white text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <p>Loading Animal Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-8 bg-red-900/50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error!</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="text-white text-center p-8">
        <p className="text-xl font-bold">No Animals Found</p>
        <p className="text-gray-400">The API returned an empty list of animals.</p>
      </div>
    );
  }
  
  // Map fetched data to the display keys requested in the output format
  const mappedAnimals = animals.map(animal => ({
    id: `ANM${String(animal.animal_id).padStart(3, '0')}`, // Format ID like 'anm001'
    name: animal.common_name, 
    species: animal.species, 
    group: animal.animal_group || 'Unspecified', // Use fallback if API doesn't return
    sex: animal.sex === 'M' ? 'Male' : (animal.sex === 'F' ? 'Female' : 'Unknown'),
    dob: animal.birth_date ? animal.birth_date.split('T')[0] : 'N/A', // Clean up date
    exhibit: animal.exhibit_name,
    feedingType: animal.feeding_type || 'N/A', // Use fallback if API doesn't return
  }));


  return (
    <div className="px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center text-white">Our Animals 🐬</h1>
      <p className="text-center opacity-90 mb-8 max-w-3xl mx-auto text-white">
        Meet our aquatic residents receiving specialized care from dedicated aquarists.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {mappedAnimals.map((animal) => (
          <div key={animal.id} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-white">
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
      type: 'Silver',
      price: '$50/year',
      benefits: ['Unlimited admission for 1', '10% gift shop discount', 'Member events', 'Free parking']
    },
    {
      type: 'Gold',
      price: '$100/year',
      benefits: ['Admission for up to 4', '15% discounts', 'Priority registration', 'Member preview days']
    },
    {
      type: 'Platinum',
      price: '$200/year',
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
    // Member Login
    memberEmail: "",
    memberPassword: "",
    
    // Staff Login
    staffUsername: "",
    staffPassword: "",
    
    // Member Signup - All Fields
    firstName: "",
    middleInitial: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    sex: "",
    ssn: "",
    membershipType: "Silver", // Default
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (mode === "member") {
      // Member Login
      try {
        const response = await fetch("http://localhost:5000/auth/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.memberEmail,
            password: formData.memberPassword,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Member login successful:", data);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userType", "member");
          // update app state and navigate to home
          localStorage.setItem('currentPage', 'home');
          window.dispatchEvent(new CustomEvent('authChange', { detail: { userType: 'member', page: 'home' } }));
        } else {
          console.error("Login failed:", data.error);
          alert(data.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to server");
      }
    } else if (mode === "staff") {
      // Staff Login
      try {
        const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.staffUsername,
            password: formData.staffPassword,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Staff login successful:", data);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userType", "staff");
          // update app state and go to staff dashboard
          localStorage.setItem('currentPage', 'staff');
          window.dispatchEvent(new CustomEvent('authChange', { detail: { userType: 'staff', page: 'staff' } }));
        } else {
          console.error("Login failed:", data.error);
          alert(data.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to server");
      }
    } else {
      // Member Signup
      // Generate membership ID (e.g., M + timestamp)
      const membershipId = "M" + Date.now().toString().slice(-6);
      
      try {
        const response = await fetch("http://localhost:5000/auth/member/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membership_id: membershipId,
            first_name: formData.firstName,
            middle_initial: formData.middleInitial || null,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone_number: formData.phoneNumber || null,
            address: formData.address || null,
            date_of_birth: formData.dateOfBirth || null,
            sex: formData.sex || null,
            ssn: formData.ssn || null,
            membership_type: formData.membershipType,
            visitor_id: null,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Registration successful:", data);
          alert("Account created successfully! Please log in.");
          setMode("member");
          // Clear form
          setFormData({
            ...formData,
            firstName: "",
            middleInitial: "",
            lastName: "",
            email: "",
            password: "",
            phoneNumber: "",
            address: "",
            dateOfBirth: "",
            sex: "",
            ssn: "",
            membershipType: "Silver",
          });
        } else {
          console.error("Registration failed:", data.error);
          alert(data.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to server");
      }
    }
  };

  return (
    <div className="px-6 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">

        {/* ---------------- HEADER ---------------- */}
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          {mode === "member" && "Member Login"}
          {mode === "staff" && "Staff Login"}
          {mode === "signup" && "Become a Member"}
        </h1>

        {/* ---------------- MEMBER LOGIN ---------------- */}
        {mode === "member" && (
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email</label>
              <input
                type="email"
                name="memberEmail"
                value={formData.memberEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <input
                type="password"
                name="memberPassword"
                value={formData.memberPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
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

            <p className="mt-4 text-center text-white">
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
              <label className="block text-sm font-medium mb-2 text-white">Username</label>
              <input
                type="text"
                name="staffUsername"
                value={formData.staffUsername}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <input
                type="password"
                name="staffPassword"
                value={formData.staffPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
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

            <p className="mt-4 text-center text-white">
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
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Middle Initial</label>
              <input
                type="text"
                name="middleInitial"
                value={formData.middleInitial}
                onChange={handleChange}
                maxLength={1}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="john.doe@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="555-0123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="123 Ocean Ave, Miami FL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Sex</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white
                  focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                >
                  <option value="" className="bg-blue-900">Select...</option>
                  <option value="M" className="bg-blue-900">Male</option>
                  <option value="F" className="bg-blue-900">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Social Security Number</label>
              <input
                type="text"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                maxLength={11}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="XXX-XX-XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Membership Type *</label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white
                focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="Silver" className="bg-blue-900">Silver - $50/year</option>
                <option value="Gold" className="bg-blue-900">Gold - $100/year</option>
                <option value="Platinum" className="bg-blue-900">Platinum - $200/year</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg 
              transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Account
            </button>

            <p className="mt-4 text-center text-sm text-white">
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



function StaffDashboard() {
  const [animals, setAnimals] = useState<Record[]>([]);
  const [exhibits, setExhibits] = useState<Record[]>([]);
  const [tanks, setTanks] = useState<Record[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<Record[]>([]);
  const [healthRecords, setHealthRecords] = useState<Record[]>([]);

  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

  const handleFormSubmission = async (endpoint: string, data: Record) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication token missing. Please log in.");
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass JWT
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      alert(`${endpoint.split('/')[0]} added successfully!`);
      // Optional: Trigger a refresh of the list display here
      // e.g., if endpoint === 'animals', call a function to refresh animal list
        
    } catch (error) {
      const err = error as Error; // cast safely

      alert(`Failed to add record: ${err.message}`);
      console.error("Submission Error:", err);
    }
  };

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
          onSubmit={(data) => handleFormSubmission("animals", data)} // <--- UPDATED
          fields={["animal_id (AXXX)", "name", "species", "date_of_birth (YYYY-MM-DD)", "sex (M/F)", "food_type", "feeding_type", "exhibit_id (EXXX)", "tank_id (TXXX)"]}
        />

        {/* EXHIBIT FORM */}
        <StaffInputCard
          title="Add Exhibit"
          onSubmit={(data) => handleFormSubmission("exhibits", data)} // <--- UPDATED
          fields={["id (EXXX)", "name", "location", "lead_aquarist_id"]}
        />

        {/* TANK FORM */}
        <StaffInputCard
          title="Add Tank"
          onSubmit={(data) => handleFormSubmission("tanks", data)} // <--- UPDATED
          fields={["tank_id (TXXX)", "tank_size", "tank_type", "water_type", "exhibit_id (EXXX)"]}// tank id	tank size	tank type	water type	exhibit i
        />


        {/* FEEDING RECORD */}
        <StaffInputCard
          title="Add Feeding Record"
          onSubmit={(data) => handleFormSubmission("feedingRecords", data)} // <--- UPDATED
          fields={["feeding_id", "animal_id (AXXX)", "aquarist_id (SXXX)", "food_amount", "feeding_time (YYYY-MM-DD HH:MM:SS)"]}
        />

        {/* HEALTH RECORD */}
        <StaffInputCard
          title="Add Health Record"
          onSubmit={(data) => handleFormSubmission("healthRecords", data)} // <--- UPDATED
          fields={["record_id", "animal_id (AXXX)", "vet_id (SXXX)", "date (YYYY-MM-DD)", "conditions", "notes"]}
        />

      </div>

      {/* DISPLAY LISTS */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-4">Generated Lists</h2>

        {/* UPDATED CALLS (Functions 6-10) */}
        <ListDisplay label="Animals" endpoint="animals" />
        <ListDisplay label="Exhibits" endpoint="exhibits" />             
        <ListDisplay label="Tanks" endpoint="tanks" />                    
        <ListDisplay label="Feeding Records" endpoint="feeding-records" />
        <ListDisplay label="Health Records" endpoint="health-records" />  
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

function ListDisplay({ label, endpoint }: ListDisplayProps) {
    const [data, setData] = useState<Record[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // This effect runs once on component mount (and only if the endpoint changes)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            
            try {
                const res = await fetch(`http://localhost:5000/${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
                }

                const fetchedData: Record[] = await res.json();
                setData(fetchedData);
            } catch (error) {
                console.error(`Fetch Error for ${label}:`, error);
                // Only show a simple error message to the user
                alert(`Failed to load ${label}. Check server connection.`);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [endpoint]); // Fetch when the component mounts or the endpoint changes

    if (isLoading) {
        return (
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p>Loading {label}...</p>
            </div>
        );
    }
    
    // --- Aesthetic Table Generation ---
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mt-4">
            <h3 className="text-xl font-bold mb-3 border-b border-white/20 pb-2">{label}</h3>
            
            {data.length === 0 ? (
                <p className="text-sm opacity-70">No {label.toLowerCase()} found in the database.</p>
            ) : (
                <div className="mt-4 max-h-60 overflow-y-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-black/30 sticky top-0">
                            <tr>
                                {headers.map(header => (
                                    <th key={header} scope="col" className="px-3 py-2 whitespace-nowrap">{header.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/10">
                                    {headers.map(header => (
                                        <td key={header} className="px-3 py-2 whitespace-nowrap">
                                            {String(row[header] ?? 'N/A')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}