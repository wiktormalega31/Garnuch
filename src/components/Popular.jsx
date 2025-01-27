import { useEffect, useState } from "react";
import styled from "styled-components";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import { Link } from "react-router-dom";

function Popular() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopular();
  }, []);

  const getPopular = async () => {
    const check = localStorage.getItem("popular");
    if (check) {
      setPopular(JSON.parse(check));
      setLoading(false);
    } else {
      const api = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${
          import.meta.env.VITE_API_KEY
        }&number=12`
      );
      const data = await api.json();
      localStorage.setItem("popular", JSON.stringify(data.recipes));
      setPopular(data.recipes);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
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
          {popular.map((recipe) => {
            return (
              <SplideSlide key={recipe.id}>
                <Card>
                  <Link to={`/recipe/${recipe.id}`}>
                    <p>{recipe.title} </p>
                    <img src={recipe.image} alt={recipe.title} />
                  </Link>
                </Card>
              </SplideSlide>
            );
          })}
        </Splide>
      </Wrapper>
    </div>
  );
}

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

export default Popular;
