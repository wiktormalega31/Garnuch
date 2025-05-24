import { message } from "antd";
import API, { ensureCsrfCookie } from "../axiosConfig";

export const addToFavorites = async ({ recipe_id, title, image }) => {
  try {
    await ensureCsrfCookie();
    const res = await API.post("/api/recipes/favorites/", {
      recipe_id,
      title,
      image,
    });
    message.success("Dodano do ulubionych ✅");
    return true;
  } catch (e) {
    if (e.response?.status === 400) {
      message.info("Przepis już jest w ulubionych");
    } else if (e.response?.status === 403) {
      message.warning("Zaloguj się, aby dodać do ulubionych");
    } else {
      message.error("Błąd przy dodawaniu do ulubionych");
    }
    return false;
  }
};
