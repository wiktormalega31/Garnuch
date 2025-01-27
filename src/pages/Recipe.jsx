import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Typography, Space, Tabs } from "antd";
import StepByStep from "../components/StepByStep";
import "./css/Recipe.css"; // Importuj plik CSS

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Recipe() {
  const [details, setDetails] = useState({});
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  let params = useParams();

  const fetchDetails = async () => {
    const data = await fetch(
      `https://api.spoonacular.com/recipes/${params.name}/information?apiKey=${
        import.meta.env.VITE_API_KEY
      }`
    );
    const detailData = await data.json();
    setDetails(detailData);
    // Ustawienie listy składników w stanie shoppingList
    setShoppingList(detailData.extendedIngredients || []);
  };

  const userId = localStorage.getItem("userId"); // Pobierz userId z localStorage

  const checkIfFavorite = async () => {
    const response = await fetch(`http://localhost:5000/users/${userId}`);
    const userData = await response.json();
    const favoriteRecipes = userData.favoriteRecipes || [];
    setIsFavorite(favoriteRecipes.includes(parseInt(params.name)));
  };

  const toggleFavorite = async () => {
    const url = `http://localhost:5000/users/${userId}`;
    const recipeId = parseInt(params.name);

    try {
      // Pobierz aktualne dane użytkownika
      const response = await fetch(url);
      const userData = await response.json();

      let updatedFavorites;

      if (isFavorite) {
        // Usuń przepis z ulubionych
        updatedFavorites = userData.favoriteRecipes.filter(
          (id) => id !== recipeId
        );
      } else {
        // Dodaj przepis do ulubionych
        updatedFavorites = [...userData.favoriteRecipes, recipeId];
      }

      // Zaktualizuj użytkownika w db.json
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteRecipes: updatedFavorites }),
      });

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Błąd podczas aktualizacji ulubionych przepisów:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
    checkIfFavorite();
    localStorage.setItem("ItemID", params.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.name]);

  return (
    <div className="recipe-container">
      <div className="left-column">
        <Title level={2}>{details.title}</Title>
        <img src={details.image} alt={details.title} className="recipe-image" />
        <Space direction="vertical" size="middle">
          <Button type="primary" onClick={toggleFavorite} className="button">
            {isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          </Button>
          <div className="signature">
            <Text>Liczba porcji: {details.servings}</Text> <br />
            <Text>Gotowe w: {details.readyInMinutes} min</Text>
          </div>
        </Space>
      </div>

      <div className="right-column">
        <Tabs defaultActiveKey="1" className="recipe-tabs">
          <TabPane tab="Lista Zakupów" key="1">
            {shoppingList.length > 0 ? (
              <div>
                <ul>
                  {shoppingList.map((ingredient, index) => (
                    <li key={index}>{ingredient.name}</li>
                  ))}
                </ul>
                <Button
                  onClick={() => {
                    localStorage.setItem(
                      "shoppingList",
                      JSON.stringify(shoppingList)
                    );
                    alert("Lista zakupów została zapisana!");
                  }}
                  className="button"
                  type="primary"
                >
                  Zapisz listę zakupów
                </Button>
              </div>
            ) : (
              <Text>Brak pozycji na liście zakupów</Text>
            )}
          </TabPane>

          <TabPane tab="Szczegóły" key="2" className="recipe-tabs">
            <div
              dangerouslySetInnerHTML={{ __html: details.summary }}
              className="tabs"
            />
          </TabPane>
          <TabPane tab="Przepis" key="3" className="recipe-tabs">
            <div dangerouslySetInnerHTML={{ __html: details.instructions }} />
            <Button
              onClick={() => setShowStepByStep(true)}
              className="button"
              type="primary"
              style={{ height: "4rem" }}
            >
              Krok po kroku
            </Button>
            {showStepByStep && (
              <StepByStep
                instructions={details.analyzedInstructions}
                onClose={() => setShowStepByStep(false)}
              />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default Recipe;
