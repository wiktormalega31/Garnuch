import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "antd"; // Użycie komponentu Ant Design Card
import "./css/Category.css"; // Importuj plik CSS

function Searched() {
  const [searchedRecepies, setSearchedRecepies] = useState([]);
  const [numRecipes, setNumRecipes] = useState(10); // Domyślna liczba przepisów na stronie
  let params = useParams();

  const getSearched = async (name, number) => {
    const data = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${
        import.meta.env.VITE_API_KEY
      }&query=${name}&number=${number}`
    );
    const recipes = await data.json();
    setSearchedRecepies(recipes.results);
  };

  useEffect(() => {
    getSearched(params.search, numRecipes);
  }, [params.search, numRecipes]);

  return (
    <div className="latest-recipes-container">
      {/* Dodanie kontrolki wyboru liczby przepisów */}
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
      <motion.div
        className="recipe-grid"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {searchedRecepies.length > 0 ? (
          searchedRecepies.map((item) => (
            <Link to={`/recipe/${item.id}`} key={item.id}>
              <Card
                hoverable
                cover={<img alt={item.title} src={item.image} />}
                className="recipe-card"
              >
                <div className="ant-card-body">
                  <h4>{item.title}</h4>
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

export default Searched;
