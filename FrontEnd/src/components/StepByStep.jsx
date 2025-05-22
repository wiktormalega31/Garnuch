/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import "./css/StepByStep.css";

const StepByStep = ({ instructions, onClose }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    document.body.classList.add("hidden-footer");
    return () => {
      document.body.classList.remove("hidden-footer");
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  if (!instructions || instructions.length === 0) {
    return (
      <p>
        Brak szczegółowych instrukcji krok po kroku. Sprawdź pełne instrukcje w
        sekcji Przepis&quot;.
      </p>
    );
  }

  const steps = instructions.flatMap((instruction) =>
    instruction.steps.map((step) => ({
      section: instruction.name || "Ogólne",
      number: step.number,
      text: step.step,
      image: step.image,
    }))
  );

  if (!steps || steps.length === 0) {
    return <p>Brak szczegółowych kroków przepisu.</p>;
  }

  return (
    <div className="modal-wrapper">
      <div
        className={`modal-content ${
          isDarkTheme ? "dark-theme" : "light-theme"
        }`}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Kroki przepisu</h2>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkTheme ? "Jasny Motyw" : "Ciemny Motyw"}
        </button>
        <Splide
          options={{
            type: "loop",
            gap: "1rem",
            pagination: true,
            arrows: true,
            autoplay: false,
          }}
        >
          {steps.map((step, index) => (
            <SplideSlide key={index}>
              <div className="step-card">
                <p>
                  <strong>Krok {step.number}:</strong> {step.text}
                </p>
                {step.image && (
                  <img src={step.image} alt={`Krok ${step.number}`} />
                )}
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default StepByStep;
