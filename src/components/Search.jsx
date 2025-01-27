import { useState } from "react";
import { Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./css/Search.css"; // Zaimportuj plik CSS

function Search() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      navigate(`/searched/${input}`);
    }
  };

  return (
    <form className="search-form" onSubmit={submitHandler}>
      <div className="input-container">
        <Input
          className="search-input"
          prefix={<FaSearch />} // Ikona w polu input
          onChange={(e) => setInput(e.target.value)} // Aktualizacja stanu
          value={input} // Związywanie wartości z input
          placeholder="Znajdź coś pysznego"
        />
      </div>
    </form>
  );
}

export default Search;
