import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import WhyDeepML from "../components/WhyDeepML";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-[var(--color-bg)]">
        <Hero />
        <LearningCards/>
        <WhyDeepML/>
      </main>
      <Footer />
    </>
  )
}
export default Home;