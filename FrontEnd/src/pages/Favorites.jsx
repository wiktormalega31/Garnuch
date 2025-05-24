// src/pages/Favorites.jsx
import { useEffect, useState } from "react";
import { Typography, Card, Spin, message } from "antd";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../axiosConfig";
import "./css/Category.css";

const { Title } = Typography;
const { Meta } = Card;

const Favorites = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10);
  const [loadingRec, setLoadingRec] = useState(true);

  useEffect(() => {
    // Pobranie ulubionych produktów
    // Pobranie ulubionych produktów
    API.get("/api/products/favorites/").catch((err) => {
      if (err.response?.status === 403) return;
      else message.error("Nie udało się pobrać ulubionych produktów.");
    });
    // Pobranie ulubionych przepisów
    const fetchFavoriteRecipes = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/recipes/favorites/",
          {
            method: "GET",
            credentials: "include", // Wysyłanie ciasteczek dla autoryzacji
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFavoriteRecipes(data);
          setLoadingRec(false);
        } else {
          console.error("Nie udało się pobrać ulubionych przepisów.");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ulubionych przepisów:", error);
      }
    };

    fetchFavoriteRecipes();
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginTop: 32 }}>
        Twoje ulubione przepisy
      </Title>

      {loadingRec ? (
        <Spin />
      ) : (
        <div className="latest-recipes-container">
          <motion.div
            className="recipe-grid"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {favoriteRecipes.length ? (
              favoriteRecipes.slice(0, numRecipes).map((r) => (
                <Link to={`/recipe/${r.recipe_id}`} key={r.recipe_id}>
                  <Card
                    hoverable
                    cover={<img alt={r.title} src={r.image} />}
                    className="recipe-card"
                  >
                    <Meta title={r.title} />
                  </Card>
                </Link>
              ))
            ) : (
              <div className="no-recipes-message">
                Brak ulubionych przepisów do wyświetlenia.
              </div>
            )}
          </motion.div>
          <div className="select-container">
            <label htmlFor="numRecipes">
              Liczba przepisów na stronie:&nbsp;
            </label>
            <select
              id="numRecipes"
              value={numRecipes}
              onChange={(e) => setNumRecipes(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
