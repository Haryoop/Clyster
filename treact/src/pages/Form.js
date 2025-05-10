import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { SectionHeading } from "components/misc/Headings";
import tw from "twin.macro";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import { PrimaryButton } from "components/misc/Buttons"; 
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { useNavigate } from "react-router-dom";

const HeadingRow = tw.div`flex`;
const Heading = tw(SectionHeading)`text-gray-900 mb-10`;
const Text = styled.div`
  ${tw`text-lg text-gray-800`}
`;
const FormContainer = styled.div`
  ${tw`bg-white shadow-xl rounded-lg p-8 w-full max-w-3xl mx-auto`}
`;
const QuestionContainer = styled.div`
  ${tw`mb-8`}
`;
const QuestionText = styled.h3`
  ${tw`text-xl font-bold mb-4`}
`;
const AnswerField = styled.textarea`
  ${tw`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
  min-height: 150px;
`;
const SubmitButton = styled(PrimaryButton)`
  ${tw`mt-6 w-full sm:w-auto`}
`;
const ErrorMessage = styled.div`
  ${tw`text-red-500 mt-4 text-center`}
`;
const SuccessMessage = styled.div`
  ${tw`text-green-500 mt-4 text-center`}
`;

export default function TestForm() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const email = sessionStorage.getItem("email");
      if (!email) {
        setError("Please login to access tests");
        navigate("/login");
        return;
      }

      try {
        // Fetch user profile
        const userResponse = await fetch(`http://localhost:5000/api/users/profile?email=${email}`);
        if (!userResponse.ok) throw new Error("Failed to fetch user profile");
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's form
        const formResponse = await fetch(`http://localhost:5000/api/has-test/${userData._id}`);
        if (!formResponse.ok) throw new Error("Failed to fetch form");
        const formData = await formResponse.json();
        
        if (!formData.has_test) {
          throw new Error("No test form found for this user");
        }
        
        // Fetch full form details
        const fullFormResponse = await fetch(`http://localhost:5000/api/forms/${formData.form_id}`);
        if (!fullFormResponse.ok) throw new Error("Failed to fetch form details");
        const fullFormData = await fullFormResponse.json();
        setForm(fullFormData);

        // Initialize answers object
        const initialAnswers = {};
        for (let i = 1; i <= 5; i++) {
          initialAnswers[`reponse${i}`] = fullFormData[`reponse${i}`] || "";
        }
        setAnswers(initialAnswers);

      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAnswerChange = (questionNumber, value) => {
    setAnswers(prev => ({
      ...prev,
      [`reponse${questionNumber}`]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation - check if all questions are answered
      const unanswered = Object.entries(answers)
        .filter(([key, value]) => key.startsWith('reponse') && !value.trim())
        .map(([key]) => key.replace('reponse', 'Question '));
      
      if (unanswered.length > 0) {
        throw new Error(`Please answer: ${unanswered.join(', ')}`);
      }

      const response = await fetch(`http://localhost:5000/api/forms/${form._id}/responses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }
      
      setSuccess("Test submitted successfully!");
      setTimeout(() => navigate("/profile"), 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !form) {
    return (
      <AnimationRevealPage>
        <Header />
        <Container>
          <ContentWithPaddingXl>
            <Text>
              <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl text-gray-600">Loading form...</p>
              </div>
            </Text>
          </ContentWithPaddingXl>
        </Container>
        <Footer />
      </AnimationRevealPage>
    );
  }

  return (
    <AnimationRevealPage>
      <Header />
      <Container>
        <ContentWithPaddingXl>
          <HeadingRow>
            <Heading>Test for: {form.metier}</Heading>
          </HeadingRow>
          <Text>
            <FormContainer>
              <form onSubmit={handleSubmit}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <QuestionContainer key={num}>
                    <QuestionText>
                      Question {num}: {form[`question${num}`]}
                    </QuestionText>
                    <AnswerField
                      value={answers[`reponse${num}`] || ""}
                      onChange={(e) => handleAnswerChange(num, e.target.value)}
                      placeholder={`Your answer to question ${num}...`}
                      required
                    />
                  </QuestionContainer>
                ))}

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <div className="flex justify-center">
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Submitting...</span>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      "Submit Test"
                    )}
                  </SubmitButton>
                </div>
              </form>
            </FormContainer>
          </Text>
        </ContentWithPaddingXl>
      </Container>
      <Footer />
    </AnimationRevealPage>
  );
}