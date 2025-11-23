import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">🐠 Ocean Breeze Aquarium</h1>
        <p className="text-lg max-w-xl opacity-90">
          Explore vibrant fish, peaceful tanks, and the beauty of the underwater world.
        </p>

        <div className="mt-8">
          <Image
            src="/fish-hero.jpg"
            alt="Colorful fish swimming"
            width={300}
            height={300}
            className="drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Featured Tanks */}
      <section className="px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Featured Tanks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tank Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg">
            <Image
              src="/clownfish.jpg"
              alt="Clownfish"
              width={400}
              height={250}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Clownfish Reef</h3>
            <p className="text-sm opacity-80">
              Bright, friendly, and iconic — home to clownfish and soft corals.
            </p>
          </div>

          {/* Tank Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg">
            <Image
              src="/jellyfish.jpg"
              alt="Jellyfish"
              width={400}
              height={250}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Jelly Drift</h3>
            <p className="text-sm opacity-80">
              A calming tank with moon jellyfish floating endlessly.
            </p>
          </div>

          {/* Tank Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg">
            <Image
              src="/seahorse.jpg"
              alt="Seahorse tank"
              width={400}
              height={250}
              className="rounded-xl"
            />
            <h3 className="text-xl font-semibold mt-3">Seahorse Garden</h3>
            <p className="text-sm opacity-80">
              Graceful seahorses swimming around a plant-filled habitat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
