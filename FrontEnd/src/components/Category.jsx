import { Button } from "antd";
import { NavLink } from "react-router-dom";
import "./css/Category.css";

function Category() {
  return (
    <div className="category-list">
      <NavLink to={"/cuisine/all"}>
        <Button className="category-button" block>
          <h4>Wszystkie</h4>
        </Button>
      </NavLink>
      <NavLink to={"/cuisine/italian"}>
        <Button className="category-button" block>
          <h4>Włoskie</h4>
        </Button>
      </NavLink>
      <NavLink to={"/cuisine/asian"}>
        <Button className="category-button" block>
          <h4>Azjatyckie</h4>
        </Button>
      </NavLink>
      <NavLink to={"/cuisine/vege"}>
        <Button className="category-button" block>
          <h4>Vege</h4>
        </Button>
      </NavLink>
      <NavLink to={"/shoppinglist"}>
        <Button className="category-button" block>
          <h4>Lista zakupów</h4>
        </Button>
      </NavLink>
    </div>
  );
}

export default Category;
