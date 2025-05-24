// src/pages/All.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Spin, message } from "antd";
import { motion } from "framer-motion";
import { BACKEND } from "../axiosConfig";
import "./css/Category.css";

function All() {
  const [recipes, setRecipes] = useState([]);
  const [num, setNum] = useState(10);
  const [loading, setLoading] = useState(true);
  const { type } = useParams(); // obecnie nieużywane, ale zostawiamy

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/random/?number=${num}`, {
        credentials: "include",
      });
      if (!r.ok) {
        if (r.status === 503) {
          message.info(
            "Limit zapytań do przepisu wyczerpany – spróbuj za chwilę."
          );
        } else {
          message.error("Nie udało się pobrać przepisów.");
        }
        setRecipes([]);
        return;
      }
      const json = await r.json(); // backend zwraca {recipes:[…]}
      setRecipes(json);
    } catch {
      message.error("Błąd sieci podczas pobierania przepisów.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, num]);

  /* ---------- render ---------- */
  return (
    <div className="latest-recipes-container">
      <div className="select-container">
        <label>Liczba przepisów na stronie:&nbsp;</label>
        <select value={num} onChange={(e) => setNum(+e.target.value)}>
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin />
        </div>
      ) : !recipes.length ? (
        <div className="no-recipes-message">
          Brak przepisów do wyświetlenia.
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="recipe-card"
                hoverable
                cover={<img src={recipe.image} alt={recipe.title} />}
              >
                <Link to={`/recipe/${recipe.id}`}>
                  <h4>{recipe.title}</h4>
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
