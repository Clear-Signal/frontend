import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import WhyClearSignal from "../components/WhyClearSignal";

const Home = () => {
  return (
      <main className="w-full min-h-screen bg-[var(--color-bg)]">
        <Hero />
        <LearningCards/>
        <WhyClearSignal/>
      </main>
  )
}
export default Home;