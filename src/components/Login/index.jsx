import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../../utils/firebase-config';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (email.endsWith('@wave.com')) {
        navigate('/');
      } else {
        alert("Accès réservé aux emails @wave.com");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  return (
    <div className="text-center mt-5">
      <h2>Connexion au simulateur</h2>
      <button className="btn btn-primary mt-3" onClick={handleLogin}>
        Se connecter avec Google
      </button>
    </div>
  );
};

export default Login;
