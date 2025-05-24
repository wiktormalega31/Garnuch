import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Spin, Button, message } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { BACKEND } from "../axiosConfig";
import { addToFavorites } from "../hooks/useFavorites";
import "./css/Category.css";

function Cuisine() {
  const [list, setList] = useState([]);
  const [favIds, setFavIds] = useState(new Set()); // <── nowe
  const [num, setNum] = useState(10);
  const [loading, setLoading] = useState(true);
  const { type } = useParams();

  /* ---------- ulubione bieżącego użytkownika (dla gwiazdek) ---------- */
  const fetchFavorites = () =>
    fetch(`${BACKEND}/api/recipes/favorites/`, { credentials: "include" })
      .then((r) => r.json())
      .then((arr) => setFavIds(new Set(arr.map((x) => x.recipe_id))))
      .catch(() => {}); // cicho

  /* ---------- przepisy danej kuchni ---------- */
  const fetchCuisine = async (c, n) => {
    setLoading(true);
    const diet = c === "vege" ? "vegan" : "";
    try {
      const res = await fetch(
        `${BACKEND}/api/cuisine/?name=${c}&number=${n}&diet=${diet}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        if (res.status === 503) {
          message.info("Limit zapytań do serwisu wyczerpany, spróbuj później.");
        } else {
          message.error("Błąd pobierania przepisów.");
        }
        return setList([]);
      }
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];
      setList(arr);
    } catch {
      message.error("Nie udało się połączyć z serwerem.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuisine(type, num);
    fetchFavorites();
  }, [type, num]);

  /* ---------- render ---------- */
  return (
    <div className="latest-recipes-container">
      {/* wybór liczby przepisów */}
      <div className="select-container">
        <label>Liczba przepisów:&nbsp;</label>
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
      ) : !list.length ? (
        <div className="no-recipes-message">Brak przepisów.</div>
      ) : (
        <motion.div className="recipe-grid" animate={{ opacity: 1 }}>
          {list.map((r) => {
            const isFav = favIds.has(r.id);
            const handleFav = async (e) => {
              e.preventDefault(); // nie przechodź do /recipe
              if (
                await addToFavorites({
                  recipe_id: r.id,
                  title: r.title,
                  image: r.image,
                })
              )
                setFavIds((s) => new Set(s).add(r.id));
            };

            return (
              <Link to={`/recipe/${r.id}`} key={r.id}>
                <Card
                  hoverable
                  cover={<img src={r.image} alt={r.title} />}
                  className="recipe-card"
                >
                  <h4>{r.title}</h4>
                  <Button
                    type="text"
                    icon={isFav ? <StarFilled /> : <StarOutlined />}
                    onClick={handleFav}
                    className="fav-btn"
                  />
                </Card>
              </Link>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default Cuisine;
