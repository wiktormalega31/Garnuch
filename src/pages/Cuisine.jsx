import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "antd"; // Komponent Card z Ant Design
import "./css/Category.css"; // Import stylów CSS

function Cuisine() {
  const [cuisine, setCuisine] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10); // Liczba przepisów na stronie
  let params = useParams();

  const getCuisine = async (name, number) => {
    try {
      const diet = name === "vege" ? "vegan" : ""; // Ustawienie diety, jeśli kuchnia to "vege"
      const data = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${
          import.meta.env.VITE_API_KEY
        }&cuisine=${name}&number=${number}&diet=${diet}`
      );
      const recipes = await data.json();
      setCuisine(recipes.results);
    } catch (error) {
      console.error("Błąd podczas pobierania przepisów:", error);
    }
  };

  useEffect(() => {
    getCuisine(params.type, numRecipes);
  }, [params.type, numRecipes]);

  return (
    <div className="latest-recipes-container">
      <div className="select-container">
        <label htmlFor="numRecipes">Liczba przepisów na stronie: </label>
        <select
          id="numRecipes"
          value={numRecipes}
          onChange={(e) => setNumRecipes(parseInt(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>

      {/* Siatka przepisów */}
      <motion.div
        className="recipe-grid"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {cuisine.length > 0 ? (
          cuisine.map((recipe) => (
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
            Brak przepisów do wyświetlenia.
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Cuisine;
