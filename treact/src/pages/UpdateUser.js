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
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
// Métier Enum (for dropdown options)
const Metier = {
  DEVELOPPEUR: "développeur",
  RH: "responsable RH",
  MARKETING: "marketing",
  VENTE: "vente",
};

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "Créer un compte d'utilisateur chez Clyster",
  submitButtonText = "Sign Up",
  SubmitButtonIcon = SignUpIcon,
  tosUrl = "#",
  privacyPolicyUrl = "#",
  signInUrl = "#",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: null,
    métier: "",
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  // New state to control which fields are editable (false = read-only)
  const [editableFields, setEditableFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    métier: false,
    birthDate: false,
  });

  // Pre-populate the form with logged in user's full info by fetching from the backend.
  useEffect(() => {
    // Retrieve the email from session storage (try both keys if needed)
    let userEmail = sessionStorage.getItem("email");
    console.log("Prepopulating with email:", userEmail);
    if (userEmail) {
      // Fetch the user details from your backend.
      fetch(`http://localhost:5000/api/users/profile?email=${encodeURIComponent(userEmail)}`)
        .then((response) => response.json())
        .then((data) => {
          // Expected fields: first_name, last_name, email, birth_date, métier
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            password: "", // Leave passwords empty for security.
            confirmPassword: "",
            birthDate: data.birth_date ? new Date(data.birth_date) : null,
            métier: data.métier || "",
            userId: data._id || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  // Function to toggle edit mode for a field.
  // For password, we also enable the confirmPassword field.
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

  // Function to cancel editing for a field.
  // It will set the field back to non-editable and clear its value.
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

  const maxDate = subYears(new Date(), 14);

  // Handle input change
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

    // Clear the error when the user types something
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Handle date change for birthDate
  const handleDateChange = (date) => {
    setFormData({ ...formData, birthDate: date });
    setErrors((prevErrors) => ({
      ...prevErrors,
      birthDate: "",
    }));
  };

  // Validate all fields in real-time (only if field is editable)
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

  // Run validation whenever formData or touchedFields changes
  useEffect(() => {
    validateAllFields();
  }, [formData, touchedFields, validateAllFields]);

  // Only mark as touched if the field is editable.
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
  
    // Validate password and confirm password only if they are editable
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
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        métier: formData.métier,
        birth_date: formData.birthDate
          ? formData.birthDate.toISOString().split("T")[0]
          : null,
      };
  
      // Assuming userId is stored in sessionStorage or passed as a prop
      //const userId = sessionStorage.getItem("userId"); // Replace with the actual user ID
      const userId = formData.userId;
      if (!userId) {
        console.error("User ID not found!");
        return;
      }
  
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
          navigate("/profile"); // Navigate to a profile or another page
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
                      name="firstName"
                      placeholder="Nom"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.firstName}
                      readOnly={!editableFields.firstName}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.firstName
                          ? cancelEdit("firstName")
                          : toggleEdit("firstName")
                      }
                    >
                      {editableFields.firstName ? "Annuler" : "Modifier"}
                    </button>
                    {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Prénom"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.lastName}
                      readOnly={!editableFields.lastName}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.lastName
                          ? cancelEdit("lastName")
                          : toggleEdit("lastName")
                      }
                    >
                      {editableFields.lastName ? "Annuler" : "Modifier"}
                    </button>
                    {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                  </InputContainer>

                  <InputContainer>
                    <DatePicker
                      selected={formData.birthDate}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Date de naissance"
                      showYearDropdown
                      showMonthDropdown
                      maxDate={maxDate}
                      yearDropdownItemNumber={200}
                      scrollableYearDropdown
                      className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border ${
                        errors.birthDate ? "border-red-500" : "border-gray-200"
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                      disabled={!editableFields.birthDate}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.birthDate
                          ? cancelEdit("birthDate")
                          : toggleEdit("birthDate")
                      }
                    >
                      {editableFields.birthDate ? "Annuler" : "Modifier"}
                    </button>
                    {errors.birthDate && <ErrorText>{errors.birthDate}</ErrorText>}
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
                      name="métier"
                      value={formData.métier}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={errors.métier}
                      disabled={!editableFields.métier}
                    >
                      <option value="">Sélectionnez un métier</option>
                      {Object.entries(Metier).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() =>
                        editableFields.métier ? cancelEdit("métier") : toggleEdit("métier")
                      }
                    >
                      {editableFields.métier ? "Annuler" : "Modifier"}
                    </button>
                    {errors.métier && <ErrorText>{errors.métier}</ErrorText>}
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
