// src/components/Popular.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import { Link } from "react-router-dom";
import { Card as Spin, message } from "antd";
import { BACKEND } from "../axiosConfig";

function Popular() {
  const [list, setList] = useState([]);
  const [loading, setL] = useState(true);

  useEffect(() => {
    fetchPopular();
  }, []);

  /* ---- główna logika ---- */
  const fetchPopular = async () => {
    try {
      /* Zawsze pobieraj losowe przepisy z backendu */
      console.log("Fetching from backend...");
      const r = await fetch(`${BACKEND}/api/random/?number=12`);
      if (!r.ok) throw new Error("Backend response not OK");
      const data = await r.json(); // lista obiektów
      console.log("Fetched from backend:", data); // Logowanie
      setList(data);
    } catch (error) {
      console.error("Error fetching popular recipes:", error); // Logowanie błędu
      message.error("Nie udało się pobrać popularnych przepisów.");
    } finally {
      setL(false);
    }
  };

  /* ---- render ---- */
  if (loading)
    return (
      <Center>
        <Spin />
      </Center>
    );
  if (!list.length) return <Center>Brak popularnych przepisów.</Center>;

  return (
    <Wrapper>
      <h3>Ostatnio popularne</h3>
      <Splide
        options={{
          perPage: 3,
          perMove: 2,
          gap: "5rem",
          autoWidth: false,
          type: "loop",
          arrows: true,
          pagination: false,
          drag: "free",
          focus: "center",
          snap: true,
          padding: "2rem",
          breakpoints: {
            1200: {
              gap: "4rem",
            },
            992: {
              gap: "3rem",
            },
            768: {
              gap: "2rem",
            },
            576: {
              gap: "1rem",
            },
          },
        }}
      >
        {list.map((r) => (
          <SplideSlide key={r.id}>
            <Card>
              <Link to={`/recipe/${r.id}`}>
                <p>{r.title}</p>
                <img src={r.image} alt={r.title} />
              </Link>
            </Card>
          </SplideSlide>
        ))}
      </Splide>
    </Wrapper>
  );
}

/* ---- styled ---- */
const Wrapper = styled.div`
  margin: 2rem;
`;

const Card = styled.div`
  min-height: 25rem;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;

  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  p {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
    padding: 0.5rem;
    font-weight: 600;
    font-size: 1.2rem;
    z-index: 10;
    @media (max-width: 768px) {
      display: none;
    }
  }

  @media (max-width: 1200px) {
    min-height: 20rem;
  }

  @media (max-width: 992px) {
    min-height: 18rem;
  }

  @media (max-width: 768px) {
    min-height: 15rem;
  }

  @media (max-width: 576px) {
    min-height: 12rem;
  }

  @media (max-width: 450px) {
    min-height: 9rem;
  }
`;

const Center = styled.p`
  text-align: center;
  margin: 2rem 0;
`;

export default Popular;
