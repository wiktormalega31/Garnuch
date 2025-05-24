import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../axiosConfig";

const ConfirmEmail = () => {
  const { uid, token } = useParams();
  const [done, setDone] = useState(false);

  useEffect(() => {
    API.post(`/auth/registration/verify-email/`, {
      key: `${uid}/${token}`,
    }).finally(() => setDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // po weryfikacji przekieruj na login
  return done ? <Navigate to="/login?verified=1" replace /> : null;
};
export default ConfirmEmail;
