import React, { useState, useEffect } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { useNavigate } from "react-router-dom";
import Header from "../headers/light.js";
import { ReactComponent as SvgDecoratorBlob1 } from "../../images/svg-decorator-blob-1.svg";
import DesignIllustration from "../../images/design-illustration-2.svg";

// Styled Components
const Container = styled.div`
  ${tw`relative`}
`;

const TwoColumn = styled.div`
  ${tw`flex flex-col lg:flex-row lg:items-center max-w-screen-xl mx-auto py-20 md:py-24`}
`;

const LeftColumn = styled.div`
  ${tw`relative lg:w-5/12 text-center max-w-lg mx-auto lg:max-w-none lg:text-left`}
`;

const RightColumn = styled.div`
  ${tw`relative mt-12 lg:mt-0 flex-1 flex flex-col justify-center lg:self-end`}
`;

const Heading = styled.h1`
  ${tw`font-bold text-3xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-900 leading-tight`}
`;

const Paragraph = styled.p`
  ${tw`my-5 lg:my-8 text-base xl:text-lg`}
`;

const Actions = styled.div`
  ${tw`relative max-w-md text-center mx-auto lg:mx-0`}
  button {
    ${tw`w-full sm:absolute right-0 top-0 bottom-0 bg-primary-500 text-gray-100 font-bold mr-2 my-4 sm:my-2 rounded-full py-4 flex items-center justify-center sm:w-40 sm:leading-none focus:outline-none hover:bg-primary-900 transition duration-300`}
  }
`;

const ErrorMessage = styled.div`
  ${tw`text-red-500 mt-4 text-center`}
`;

const LoadingSpinner = styled.div`
  ${tw`inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2`}
`;

const IllustrationContainer = styled.div`
  ${tw`flex justify-center lg:justify-end items-center`}
`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none opacity-5 absolute left-0 bottom-0 h-64 w-64 transform -translate-x-2/3 -z-10`}
`;

// Custom Modal Styles (uncomment if using modal instead of alert)
/*
const ModalBackdrop = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
`;

const ModalContent = styled.div`
  ${tw`bg-white p-6 rounded-lg max-w-sm mx-auto`}
`;

const ModalButton = styled.button`
  ${tw`mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700 transition duration-300`}
`;
*/

export default ({ roundedHeaderButton }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For custom modal (uncomment if using)
  // const [showModal, setShowModal] = useState(false);
  // const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const email = sessionStorage.getItem("email");
      if (!email) {
        setError("Please login to access tests");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/users/profile?email=${email}`);
        if (!response.ok) throw new Error("Failed to load profile");
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error loading user:", error);
        setError("Error loading user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleStartTest = async () => {
    if (!userData) {
      setError("User data not loaded");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      console.log("Checking test for user:", userData._id);
      const testResponse = await fetch(
        `http://localhost:5000/api/has-test/${userData._id}`
      );
      
      if (!testResponse.ok) throw new Error("Failed to check test status");
      
      const result = await testResponse.json();
      console.log("Test check result:", result);
      
      if (result.has_test) {
        if (result.is_completed) {
          // For custom modal: 
          // setModalMessage("You've already completed this test");
          // setShowModal(true);
          window.alert("You've already completed this test");
          setError("You've already completed this test");
        } else {
          navigate("/form");
        }
      } else {
        // For custom modal:
        // setModalMessage("You have no test available. Please contact administrator.");
        // setShowModal(true);
        window.alert("You have no test available. Please contact administrator.");
        setError(result.message || "No test available. Please contact administrator.");
      }
    } catch (error) {
      console.error("Test check error:", error);
      // setModalMessage("Error checking test availability");
      // setShowModal(true);
      window.alert("Error checking test availability");
      setError(error.message || "Error checking test availability");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header roundedHeaderButton={roundedHeaderButton} />
      <Container>
        <TwoColumn>
          <LeftColumn>
            <Heading>
              Tests rapides en ligne pour<span tw="text-primary-500"> les employés.</span>
            </Heading>
            <Paragraph>
              Nos tests qui sont dynamiques, généré par l'IA, jugent la performance de vos employés.
            </Paragraph>
            
            <Actions>
              <button
                onClick={handleStartTest}
                disabled={isLoading || !userData}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Chargement...
                  </>
                ) : (
                  "Commencer le test"
                )}
              </button>
            </Actions>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </LeftColumn>

          <RightColumn>
            <IllustrationContainer>
              <img
                tw="min-w-0 w-full max-w-lg xl:max-w-3xl"
                src={DesignIllustration}
                alt="Design Illustration"
              />
            </IllustrationContainer>
          </RightColumn>
        </TwoColumn>
        <DecoratorBlob1 />
      </Container>

      {/* Uncomment for custom modal implementation
      {showModal && (
        <ModalBackdrop>
          <ModalContent>
            <p>{modalMessage}</p>
            <ModalButton onClick={() => setShowModal(false)}>
              OK
            </ModalButton>
          </ModalContent>
        </ModalBackdrop>
      )}
      */}
    </>
  );
};