import Home from "./Home";
import Cuisine from "./Cuisine";
import { Route, Routes } from "react-router-dom";
import Searched from "./Searched";
import Recipe from "./Recipe";
import ShoppingList from "./ShoppingList";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Favorites from "./Favorites";
import All from "./All";
function Pages() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cuisine/:type" element={<Cuisine />} />
        <Route path="/cuisine/all" element={<All />} />
        <Route path="/searched" element={<Searched />} />
        <Route path="/searched/:search" element={<Searched />} />
        <Route path="/recipe/:name" element={<Recipe />} />
        <Route path="/shoppinglist" element={<ShoppingList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </AnimatePresence>
  );
}

export default Pages;
