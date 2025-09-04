import Lottie from "lottie-react";
import fireJson from "../assets/fire.json";
export default function FireLottie({ size = 36 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Lottie animationData={fireJson} loop={true} />
    </div>
  );
}
