import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import Footer from "../components/Footer";
import WhyClearSignal from "../components/WhyClearSignal";

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-[var(--color-bg)]">
        <Hero />
        <LearningCards/>
        <WhyClearSignal/>
      </main>
      <Footer />
    </>
  )
}
export default Home;