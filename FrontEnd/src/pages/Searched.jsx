import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, message } from "antd";
import { BACKEND } from "../axiosConfig";
import "./css/Category.css";

function Searched() {
  const [list, setList] = useState([]);
  const [num, setNum] = useState(10);
  const { search } = useParams();

  const fetchSearched = async (q, n) => {
    try {
      const r = await fetch(`${BACKEND}/api/search/?query=${q}&number=${n}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error();
      setList(await r.json());
    } catch {
      message.error("Błąd wyszukiwania.");
      setList([]);
    }
  };

  useEffect(() => {
    fetchSearched(search, num);
  }, [search, num]);

  return (
    <div className="latest-recipes-container">
      <div className="select-container">
        <label>Liczba przepisów: </label>
        <select value={num} onChange={(e) => setNum(+e.target.value)}>
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <motion.div className="recipe-grid" animate={{ opacity: 1 }}>
        {list.length ? (
          list.map((r) => (
            <Link to={`/recipe/${r.id}`} key={r.id}>
              <Card
                hoverable
                cover={<img alt={r.title} src={r.image} />}
                className="recipe-card"
              >
                <h4>{r.title}</h4>
              </Card>
            </Link>
          ))
        ) : (
          <div className="no-recipes-message">Brak wyników.</div>
        )}
      </motion.div>
    </div>
  );
}

export default Searched;
