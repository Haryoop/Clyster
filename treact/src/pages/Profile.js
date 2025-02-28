import React, { useEffect, useState } from "react";
import { css } from "styled-components/macro"; //eslint-disable-line
import styled from "styled-components";
import { SectionHeading } from "components/misc/Headings";
import tw from "twin.macro";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import { PrimaryButton } from "components/misc/Buttons"; // Assuming you have a button component
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory

const HeadingRow = tw.div`flex`;
const Heading = tw(SectionHeading)`text-gray-900 mb-10`;
const Text = styled.div`
  ${tw`text-lg  text-gray-800`}
  p {
    ${tw`mt-2 leading-loose`}
  }
  h1 {
    ${tw`text-3xl font-bold mt-10`}
  }
  h2 {
    ${tw`text-2xl font-bold mt-8`}
  }
  h3 {
    ${tw`text-xl font-bold mt-6`}
  }
  ul {
    ${tw`list-disc list-inside`}
    li {
      ${tw`ml-2 mb-3`}
      p {
        ${tw`mt-0 inline leading-normal`}
      }
    }
  }
`;

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

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

  const handleUpdateProfile = () => {
    if (user.type === "candidat")
      navigate("/UpdateUser");
    else navigate("/UpdateCompany");
  };

  return (
    <AnimationRevealPage>
      <Header />
      <Container>
        <ContentWithPaddingXl>
          <HeadingRow>
            <Heading>Votre profil</Heading>
          </HeadingRow>
          <Text>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
              {user ? (
                <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-3xl">
                  <div className="flex flex-col items-start space-y-4">
                    
                    <p className="text-lg"><strong>Type d'utilisateur :</strong> {user.type === "candidat" ? "Candidat" : "Entreprise"}</p>
                    {user.type === "candidat" ? (
                      <>
                        <p className="text-lg"><strong>Nom :</strong> {user.first_name} {user.last_name}</p>
                        <p className="text-lg"><strong>Email :</strong> {user.email}</p>
                        <p className="text-lg">
  <strong>Date de naissance :</strong>{" "}
  {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(user.birthdate))}
</p>
                        <p className="text-lg"><strong>Métier :</strong> {user.métier}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg"><strong>Nom de l'entreprise :</strong> {user.company_name}</p>
                        <p className="text-lg"><strong>Email :</strong> {user.email}</p>
                        <p className="text-lg"><strong>Secteur :</strong> {user.secteur}</p>
                      </>
                    )}
                    <PrimaryButton onClick={handleUpdateProfile} className="mt-6">
                      Mettre à jour le profil
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <p className="text-xl text-gray-600">Chargement du profil...</p>
              )}
            </div>
          </Text>
        </ContentWithPaddingXl>
      </Container>
      <Footer />
    </AnimationRevealPage>
  );
}