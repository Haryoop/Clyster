import React, { useState, useEffect, useCallback } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import illustration from "images/signup-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as SignUpIcon } from "feather-icons/dist/icons/user-plus.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears } from "date-fns";
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

const InputContainer = tw.div`mt-5 flex items-center space-x-2`;
const Input = styled.input`
  ${tw`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
  ${({ hasError }) => hasError && tw`border-red-500`}
`;
const Select = styled.select`
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

const Secteur = {
    INFORMATIQUE : "informatique",
    SANTE : "santé",
    ASSURANCE : "assurance",

};

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "Modifier le profil de votre entreprise",
  submitButtonText = "Enregistrer",
  SubmitButtonIcon = SignUpIcon,
  tosUrl = "#",
  privacyPolicyUrl = "#",
  signInUrl = "#",
}) => {
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    secteur: "",
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();
  const [editableFields, setEditableFields] = useState({
    company_name: false,
    email: false,
    password: false,
    confirmPassword: false,
    secteur: false,
  });

  useEffect(() => {
    let userEmail = sessionStorage.getItem("email");
    console.log("Prepopulating with email:", userEmail);
    if (userEmail) {
      fetch(`http://localhost:5000/api/users/profile?email=${encodeURIComponent(userEmail)}`)
        .then((response) => response.json())
        .then((data) => {
          setFormData({
            companyName: company_name || "",
            email: data.email || "",
            password: "",
            confirmPassword: "",
            secteur: data.secteur || "",
            userId: data._id || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  const toggleEdit = (field) => {
    if (field === "password") {
      setEditableFields((prev) => ({
        ...prev,
        password: true,
        confirmPassword: true,
      }));
    } else {
      setEditableFields((prev) => ({
        ...prev,
        [field]: true,
      }));
    }
  };

  const cancelEdit = (field) => {
    if (field === "password") {
      setEditableFields((prev) => ({
        ...prev,
        password: false,
        confirmPassword: false,
      }));
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setErrors((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } else if (field === "birthDate") {
      setEditableFields((prev) => ({
        ...prev,
        birthDate: false,
      }));
      setFormData((prev) => ({
        ...prev,
        birthDate: null,
      }));
      setErrors((prev) => ({
        ...prev,
        birthDate: "",
      }));
    } else if (field === "métier") {
      setEditableFields((prev) => ({
        ...prev,
        métier: false,
      }));
      setFormData((prev) => ({
        ...prev,
        métier: "",
      }));
      setErrors((prev) => ({
        ...prev,
        métier: "",
      }));
    } else {
      setEditableFields((prev) => ({
        ...prev,
        [field]: false,
      }));
      setFormData((prev) => ({
        ...prev,
        [field]: "",
      }));
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

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

  const handleDateChange = (date) => {
    setFormData({ ...formData, birthDate: date });
    setErrors((prevErrors) => ({
      ...prevErrors,
      birthDate: "",
    }));
  };

  const validateAllFields = useCallback(() => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (editableFields[key] && !formData[key] && touchedFields[key]) {
        newErrors[key] = "Ce champ est nécessaire";
      }
    });

    if (
      editableFields.password &&
      editableFields.confirmPassword &&
      formData.password !== formData.confirmPassword &&
      touchedFields.confirmPassword
    ) {
      newErrors.confirmPassword = "Les mots de passe ne sont pas identiques";
    }

    setErrors(newErrors);
  }, [formData, touchedFields, editableFields]);

  useEffect(() => {
    validateAllFields();
  }, [formData, touchedFields, validateAllFields]);

  const handleBlur = (e) => {
    const { name } = e.target;
    if (editableFields[name]) {
      setTouchedFields((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (editableFields[key] && !formData[key]) {
        newErrors[key] = "Ce champ est nécessaire";
      }
    });
  
    if (
      editableFields.password &&
      editableFields.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Les mots de passe ne sont pas identiques";
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      const userData = {
        company_name: formData.companyName,
        email: formData.email,
        password: formData.password,
        secteur: formData.secteur,
      };
  
      const userId = formData.userId;
      if (!userId) {
        console.error("User ID not found!");
        return;
      }
  // change to /companies
      fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User updated successfully!", data);
          navigate("/profile");
        })
        .catch((error) => {
          console.error("There was an error updating the user!", error);
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
                      name="companyName"
                      placeholder="Nom l'entreprise"
                      value={formData.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.companyName}
                      readOnly={!editableFields.companyName}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.companyName
                          ? cancelEdit("companyName")
                          : toggleEdit("companyName")
                      }
                    >
                      {editableFields.companyName ? "Annuler" : "Modifier"}
                    </button>
                    {errors.companyName && <ErrorText>{errors.companyName}</ErrorText>}
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
                      readOnly={!editableFields.email}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.email ? cancelEdit("email") : toggleEdit("email")
                      }
                    >
                      {editableFields.email ? "Annuler" : "Modifier"}
                    </button>
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
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
                      readOnly={!editableFields.password}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.password
                          ? cancelEdit("password")
                          : toggleEdit("password")
                      }
                    >
                      {editableFields.password ? "Annuler" : "Modifier"}
                    </button>
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
                      readOnly={!editableFields.confirmPassword}
                    />
                    {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <Select
                      name="secteur"
                      value={formData.secteur}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.secteur}
                      disabled={!editableFields.secteur}
                    >
                      <option value="">Sélectionnez votre secteur principal</option>
                      {Object.entries(Secteur).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.secteur ? cancelEdit("secteur") : toggleEdit("secteur")
                      }
                    >
                      {editableFields.secteur ? "Annuler" : "Modifier"}
                    </button>
                    {errors.secteur && <ErrorText>{errors.secteur}</ErrorText>}
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
