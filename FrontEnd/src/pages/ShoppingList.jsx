import { useState, useEffect } from "react";
import { Button, Checkbox, List, Space, Typography } from "antd";
import "./css/ShoppingList.css"; // Importuj plik CSS

const { Title, Text } = Typography;

function ShoppingList() {
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    const storedList = localStorage.getItem("shoppingList");
    if (storedList) {
      setShoppingList(JSON.parse(storedList));
    }
  }, []);

  const clearList = () => {
    setShoppingList([]);
    localStorage.removeItem("shoppingList");
  };

  const removeSelectedItems = () => {
    const updatedList = shoppingList.filter((item) => !item.selected);
    setShoppingList(updatedList);
    localStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const toggleItemSelection = (id) => {
    const updatedList = shoppingList.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setShoppingList(updatedList);
    localStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  return (
    <div className="shopping-list-wrapper">
      <Title level={2}>Lista Zakupów</Title>
      {shoppingList.length > 0 ? (
        <List
          dataSource={shoppingList}
          renderItem={(item) => (
            <List.Item key={item.id} className="shopping-list-item">
              <Checkbox
                checked={item.selected || false}
                onChange={() => toggleItemSelection(item.id)}
              />
              <div className="item-details">
                <Text>
                  {item.name} - {item.amount} {item.unit}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Text>Lista zakupów jest pusta.</Text>
      )}
      <Space>
        <Button onClick={clearList} type="primary">
          Wyczyść całą listę
        </Button>
        <Button onClick={removeSelectedItems} type="danger">
          Usuń zaznaczone
        </Button>
      </Space>
    </div>
  );
}

export default ShoppingList;
