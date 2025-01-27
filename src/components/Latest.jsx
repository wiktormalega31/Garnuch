import { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import "./css/Latest.css";

import { Link } from "react-router-dom";
import { Card, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const { Title } = Typography;

function Latest() {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatest();
  }, []);

  const getLatest = async () => {
    let itemIDs = JSON.parse(localStorage.getItem("ItemIDs")) || [];
    const itemId = JSON.parse(localStorage.getItem("ItemID"));

    if (itemId && !itemIDs.includes(itemId)) {
      itemIDs.push(itemId);
      localStorage.setItem("ItemIDs", JSON.stringify(itemIDs));
    }

    if (itemIDs.length > 0) {
      try {
        const api = await fetch(
          `https://api.spoonacular.com/recipes/informationBulk?apiKey=${
            import.meta.env.VITE_API_KEY
          }&ids=${itemIDs.join(",")}`
        );

        const data = await api.json();
        if (data && Array.isArray(data)) {
          localStorage.setItem("Latest", JSON.stringify(data));
          setLatest(data);
        } else {
          console.warn("No valid recipes returned for the given IDs.");
        }
      } catch (error) {
        console.error("Error fetching data from the API:", error);
      }
    } else {
      console.warn("No ItemIDs found in localStorage.");
    }

    setLoading(false);
  };

  const fillCarousel = (items) => {
    const filledItems = [...items];
    while (filledItems.length < 4) {
      filledItems.push(...items);
    }
    return filledItems.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  const displayedItems = latest.length < 4 ? fillCarousel(latest) : latest;

  return (
    <div className="latest-recipes-container">
      <Title level={3}>Ostatnio Przeglądane</Title>
      {latest.length === 0 ? (
        <Typography.Paragraph className="no-recipes-message">
          Może coś zjemy??
        </Typography.Paragraph>
      ) : (
        <Splide
          options={{
            perPage: 4,
            perMove: 1,
            gap: "3rem",
            width: "100%",
            autoWidth: true,
            type: "loop",
            arrows: true,
            pagination: false,
            drag: "free",
            focus: "center",
            snap: true,
            padding: "2rem",
            breakpoints: {
              1200: {
                gap: "1rem",
              },
              992: {
                gap: "0.5rem",
              },
              768: {
                gap: "0.25rem",
              },
              576: {
                gap: "0.1rem",
              },
            },
            slideFocus: false,
          }}
        >
          {displayedItems.map((recipe) => (
            <SplideSlide key={recipe.id} inert={loading ? "true" : undefined}>
              <Card
                className="recipe-card"
                hoverable
                cover={<img alt={recipe.title} src={recipe.image} />}
              >
                <Link to={`/recipe/${recipe.id}`}>
                  <Card.Meta
                    title={recipe.title}
                    description={
                      <Typography.Text className="recipe-title"></Typography.Text>
                    }
                  />
                </Link>
              </Card>
            </SplideSlide>
          ))}
        </Splide>
      )}
    </div>
  );
}

export default Latest;
