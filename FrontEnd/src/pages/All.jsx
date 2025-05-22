import { Card, Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./css/Category.css";

function All() {
  const [recipes, setRecipes] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let params = useParams();

  const getAll = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${
          import.meta.env.VITE_API_KEY
        }&number=${numRecipes}`
      );
      if (!response.ok) {
        throw new Error("Nie udało się pobrać przepisów z API.");
      }
      const data = await response.json();
      if (data.recipes) {
        setRecipes(data.recipes);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll();
    console.log("Typ przepisu:", params.type);
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
      {error ? (
        <div className="no-recipes-message">{error}</div>
      ) : loading ? (
        <div className="loading-container">
          <Spin />
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className="recipe-card"
                cover={<img alt={<Spin />} src={recipe.image} />}
              >
                <Link to={`/recipe/${recipe.id}`}>
                  <div className="ant-card-body">
                    <h4>{recipe.title}</h4>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default All;
