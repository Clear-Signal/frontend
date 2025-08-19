import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-[var(--color-bg)]">
        <Hero />
      </main>
    </>
  )
}
export default Home;