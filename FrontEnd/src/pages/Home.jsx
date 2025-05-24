import Popular from "../components/Popular";
import Latest from "../components/Latest";
import { motion } from "framer-motion";

function Home() {
  console.log("Home mount"); // <- jeśli nie zobaczysz tego, React nie startuje

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Popular />
      <Latest />
    </motion.div>
  );
}

export default Home;
