import React, { useState, useEffect, useCallback } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import illustration from "images/signup-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as SignUpIcon } from "feather-icons/dist/icons/user-plus.svg";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";


const Container = tw(ContainerBase)`min-h-screen bg-primary-900 text-white font-medium flex justify-center -m-8`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow sm:rounded-lg flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-5/12 p-6 sm:p-12`;
const LogoLink = tw.a``;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-12 flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;
const Form = tw.form`mx-auto max-w-xs`;

const InputContainer = tw.div`mt-5`;
const Input = styled.input`
  ${tw`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
  ${({ hasError }) => hasError && tw`border-red-500`}
`;

const ErrorText = tw.p`text-red-500 text-xs mt-1`;

const SubmitButton = styled.button`
  ${tw`mt-5 tracking-wide font-semibold bg-primary-500 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
  .icon {
    ${tw`w-6 h-6 -ml-2`}
  }
  .text {
    ${tw`ml-3`}
  }
`;

const IllustrationContainer = tw.div`sm:rounded-r-lg flex-1 bg-purple-100 text-center hidden lg:flex justify-center`;
const IllustrationImage = styled.div`
  ${props => `background-image: url("${props.imageSrc}");`}
  ${tw`m-12 xl:m-16 w-full max-w-lg bg-contain bg-center bg-no-repeat`}
`;
const Select = styled.select`
  ${tw`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
  ${({ hasError }) => hasError && tw`border-red-500`}
`;

const Secteur = {
  INFORMATIQUE: "informatique",
  SANTE: "santé",
  ASSURANCE: "assurance"
};

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "Créer un compte d'entreprise chez Clyster",
  submitButtonText = "Sign Up",
  SubmitButtonIcon = SignUpIcon,
  tosUrl = "#",
  privacyPolicyUrl = "#",
  signInUrl = "#",
}) => {
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setTouchedFields((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateAllFields = useCallback(() => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword" && !formData[key] && touchedFields[key]) {
        newErrors[key] = "Ce champ est nécessaire";
      }
    });

    if (formData.password !== formData.confirmPassword && touchedFields.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne sont pas identiques";
    }

    setErrors(newErrors);
  }, [formData, touchedFields]);

  useEffect(() => {
    validateAllFields();
  }, [formData, touchedFields, validateAllFields]);

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Ce champ est nécessaire";
      }
    });

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne sont pas identiques";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const userData = {
        company_name: formData.company_name,
        email: formData.email,
        password: formData.password,
        secteur: formData.secteur,
      };
      fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Company added successfully!', data);
          navigate("/login");
        })
        .catch((error) => {
          console.error('There was an error adding the company!', error);
        });
    }
  };

  return (
    <AnimationRevealPage>
      <Container>
        <Content>
          <MainContainer>
            <LogoLink href={logoLinkUrl}>
              <LogoImage src={logo} />
            </LogoLink>
            <MainContent>
              <Heading>{headingText}</Heading>
              <FormContainer>
                <Form onSubmit={handleSubmit}>
                  <InputContainer>
                    <Input
                      type="text"
                      name="company_name"
                      placeholder="Nom de l'entreprise"
                      value={formData.company_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.company_name}
                    />
                    {errors.company_name && <ErrorText>{errors.company_name}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.email}
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </InputContainer>
                  <InputContainer>
                    <Select
                      name="secteur"
                      value={formData.secteur}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.secteur}
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {Object.entries(Secteur).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                    {errors.métier && <ErrorText>{errors.secteur}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.password}
                    />
                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirmer mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.confirmPassword}
                    />
                    {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                  </InputContainer>

                  <SubmitButton type="submit">
                    <SubmitButtonIcon className="icon" />
                    <span className="text">{submitButtonText}</span>
                  </SubmitButton>
                </Form>
              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer>
            <IllustrationImage imageSrc={illustrationImageSrc} />
          </IllustrationContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
};
