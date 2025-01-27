import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "antd";
import "./css/Category.css"; // Importuj plik CSS

function FavoriteRecipes() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10);

  const userId = localStorage.getItem("userId"); // Pobieranie userId z localStorage

  const getFavoriteRecipes = async () => {
    try {
      if (!userId) {
        console.error("Brak zalogowanego użytkownika.");
        return;
      }

      // Pobierz liste z ulubionymi przepisami użytkownika
      const userResponse = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await userResponse.json();

      // Sprawdzamy, czy użytkownik ma zapisane ulubione przepisy
      const favoriteIds = user.favoriteRecipes || [];

      if (favoriteIds.length > 0) {
        // Jeśli `favoriteIds` zawiera obiekty, wyciągnij ID
        const recipesPromises = favoriteIds.map(async (recipeId) => {
          const response = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${
              import.meta.env.VITE_API_KEY
            }`
          );
          const recipe = await response.json();
          return recipe;
        });

        // Czekamy na wszystkie odpowiedzi z API
        const recipes = await Promise.all(recipesPromises);

        console.log("Szczegóły przepisów:", recipes); // Logowanie szczegółów przepisów
        setFavoriteRecipes(recipes);
      } else {
        setFavoriteRecipes([]); // Jeśli brak ulubionych, ustaw pustą tablicę
      }
    } catch (error) {
      console.error("Błąd podczas pobierania ulubionych przepisów:", error);
    }
  };

  useEffect(() => {
    getFavoriteRecipes();
  }, [userId]);

  return (
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
  );
}

export default FavoriteRecipes;
