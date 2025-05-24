// src/components/Latest.jsx
import { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import "./css/Latest.css";

import { Link } from "react-router-dom";
import { Card, Spin, Typography, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { BACKEND } from "../axiosConfig";

const { Title, Paragraph } = Typography;

export default function Latest() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ───────── INIT ───────── */
  useEffect(() => {
    (async () => {
      try {
        // Pobieranie ostatnich przepisów z backendu
        const res = await fetch(`${BACKEND}/api/recipes/latest/`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Backend error");
        const data = await res.json();
        setRecipes(data);
      } catch {
        message.error("Nie udało się pobrać historii przepisów.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── helper: min. 4 slajdy ───────── */
  const slides =
    recipes.length >= 4
      ? recipes
      : Array.from({ length: 4 }, (_, i) => recipes[i % recipes.length]);

  /* ───────── RENDER ───────── */
  if (loading)
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );

  if (!recipes.length)
    return (
      <div className="latest-recipes-container">
        <Title level={3}>Ostatnio przeglądane</Title>
        <Paragraph className="no-recipes-message">
          Brak historii – zacznij przeglądać przepisy!
        </Paragraph>
      </div>
    );

  return (
    <div className="latest-recipes-container">
      <Title level={3}>Ostatnio przeglądane</Title>

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
        {slides.map((r, idx) => (
          <SplideSlide key={`${r.id}-${idx}`}>
            <Link to={`/recipe/${r.id}`}>
              <Card
                hoverable
                className="recipe-card"
                cover={<img alt={r.title} src={r.image} />}
              >
                <Card.Meta title={r.title} />
              </Card>
            </Link>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
