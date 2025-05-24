import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Typography, Space, Tabs, message } from "antd";
import StepByStep from "../components/StepByStep";
import API, { BACKEND, ensureCsrfCookie } from "../axiosConfig";
import "./css/Recipe.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Recipe() {
  const [details, setDetails] = useState({});
  const [showStep, setShowStep] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [shopping, setShopping] = useState([]);
  const { name } = useParams();

  /* ───────── szczegóły przepisu ───────── */
  const fetchDetails = async () => {
    try {
      const r = await fetch(`${BACKEND}/api/recipes/${name}/`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error();
      const json = await r.json();
      setDetails(json);
      setShopping(json.extendedIngredients || []);
    } catch {
      message.error("Nie udało się pobrać szczegółów przepisu.");
    }
  };

  /* ───────── ulubione (local json-server) ───────── */
  const toggleFavorite = async () => {
    try {
      await ensureCsrfCookie(); // zapewnij CSRF

      if (isFav) {
        // Usuń z ulubionych
        await API.delete("/api/recipes/favorites/", { params: { id: +name } });
        message.success("Usunięto z ulubionych");
      } else {
        // Dodaj do ulubionych
        await API.post("/api/recipes/favorites/", {
          recipe_id: +name,
          title: details.title,
          image: details.image,
        });
        message.success("Dodano do ulubionych");
      }
      setIsFav(!isFav);
    } catch {
      message.error("Nie udało się zaktualizować ulubionych");
    }
  };

  const checkIfFavorite = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/recipes/favorites/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const favorites = await res.json();
      setIsFav(favorites.some((fav) => fav.recipe_id === +name));
    } catch {
      message.error("Nie udało się sprawdzić ulubionych");
    }
  };

  /* ───────── efekty ───────── */
  useEffect(() => {
    fetchDetails();
    checkIfFavorite();
    localStorage.setItem("ItemID", name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  /* ───────── render ───────── */
  return (
    <div className="recipe-container">
      <div className="left-column">
        <Title level={2}>{details.title}</Title>
        <img src={details.image} alt={details.title} className="recipe-image" />
        <Space direction="vertical">
          <Button onClick={toggleFavorite} type="primary">
            {isFav ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          </Button>
          <div className="signature">
            <Text>Porcje: {details.servings}</Text>
            <br />
            <Text>Gotowe w&nbsp;{details.readyInMinutes} min</Text>
          </div>
        </Space>
      </div>

      <div className="right-column">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Lista zakupów" key="1">
            {shopping.length ? (
              <>
                <ul>
                  {shopping.map((ing) => (
                    <li key={ing.id}>{ing.name}</li>
                  ))}
                </ul>
                <Button
                  onClick={() =>
                    localStorage.setItem(
                      "shoppingList",
                      JSON.stringify(shopping)
                    )
                  }
                  type="primary"
                >
                  Zapisz listę
                </Button>
              </>
            ) : (
              <Text>Brak składników</Text>
            )}
          </TabPane>

          <TabPane tab="Szczegóły" key="2">
            <div dangerouslySetInnerHTML={{ __html: details.summary }} />
          </TabPane>

          <TabPane tab="Przepis" key="3">
            <div dangerouslySetInnerHTML={{ __html: details.instructions }} />
            <Button onClick={() => setShowStep(true)} type="primary">
              Krok po kroku
            </Button>
            {showStep && (
              <StepByStep
                instructions={details.analyzedInstructions}
                onClose={() => setShowStep(false)}
              />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default Recipe;
