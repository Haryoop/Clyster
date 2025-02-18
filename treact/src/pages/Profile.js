import React, { useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const email = sessionStorage.getItem("email");
      if (!email) {
        console.error("No email found in session storage.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/profile?email=${email}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <AnimationRevealPage>
      <Header />
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        {user ? (
          <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-3xl">
            <h2 className="text-3xl font-semibold text-center text-primary-500 mb-6">Votre profil</h2>
            <div className="flex flex-col items-start space-y-4">
              <p className="text-lg"><strong>Type d'utilisateur :</strong> {user.type === "candidat" ? "Candidat" : "Entreprise"}</p>
              {user.type === "candidat" ? (
                <>
                  <p className="text-lg"><strong>Nom :</strong> {user.first_name} {user.last_name}</p>
                  <p className="text-lg"><strong>Email :</strong> {user.email}</p>
                  <p className="text-lg"><strong>Métier :</strong> {user.métier}</p>
                </>
              ) : (
                <>
                  <p className="text-lg"><strong>Nom de l'entreprise :</strong> {user.company_name}</p>
                  <p className="text-lg"><strong>Email :</strong> {user.email}</p>
                  <p className="text-lg"><strong>Secteur :</strong> {user.secteur}</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xl text-gray-600">Chargement du profil...</p>
        )}
      </div>

      <Footer />
    </AnimationRevealPage>
  );
}
