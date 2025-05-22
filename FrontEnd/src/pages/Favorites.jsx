import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Typography, Card } from "antd";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./css/Category.css";
const { Title } = Typography;

const Favorites = () => {
  const { isPremium } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10);

  useEffect(() => {
    if (isPremium) {
      fetch(`${process.env.REACT_APP_API_URL}/products/favorites/`, { credentials: "include" })
        .then(res => res.json())
        .then(setFavorites);

      // Pobierz ulubione przepisy użytkownika
      const userId = localStorage.getItem("userId");
      if (userId) {
        fetch(`http://localhost:5000/users/${userId}`)
          .then(res => res.json())
          .then(async user => {
            const favoriteIds = user.favoriteRecipes || [];
            if (favoriteIds.length > 0) {
              const recipes = await Promise.all(
                favoriteIds.map(async (recipeId) => {
                  const response = await fetch(
                    `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${import.meta.env.VITE_API_KEY}`
                  );
                  return response.json();
                })
              );
              setFavoriteRecipes(recipes);
            } else {
              setFavoriteRecipes([]);
            }
          });
      }
    }
  }, [isPremium]);

  if (!isPremium) {
    return <div>Dostęp do ulubionych tylko dla użytkowników premium.</div>;
  }

  return (
    <div>
      <Title level={3}>Twoje ulubione produkty</Title>
      <ul>
        {favorites.map((fav, idx) => (
          <li key={idx}>{fav.product}</li>
        ))}
      </ul>

      <Title level={3} style={{ marginTop: 32 }}>Twoje ulubione przepisy</Title>
      <div className="latest-recipes-container">
        <motion.div
          className="recipe-grid"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {favoriteRecipes.length > 0 ? (
            favoriteRecipes.slice(0, numRecipes).map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
                <Card
                  hoverable
                  cover={<img alt={recipe.title} src={recipe.image} />}
                  className="recipe-card"
                >
                  <div className="ant-card-body">
                    <h4>{recipe.title}</h4>
                  </div>
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
          <label htmlFor="numRecipes">Liczba przepisów na stronie: </label>
          <select
            id="numRecipes"
            value={numRecipes}
            onChange={(e) => setNumRecipes(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
