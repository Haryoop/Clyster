import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { useNavigate } from "react-router-dom";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/signup-illustration.svg";
import logo from "images/logo.svg";
//import googleIconImageSrc from "images/google-icon.png";
//import twitterIconImageSrc from "images/twitter-icon.png";
import { ReactComponent as SignUpIcon } from "feather-icons/dist/icons/user-plus.svg";
//import { NavLinks } from "components/headers/light";

const Container = tw(ContainerBase)`min-h-screen bg-primary-900 text-white font-medium flex justify-center -m-8`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow sm:rounded-lg flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-5/12 p-6 sm:p-12`;
const LogoLink = tw.a``;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-12 flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;

const DividerTextContainer = tw.div`my-12 border-b text-center relative`;
const DividerText = tw.div`leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform -translate-y-1/2 absolute inset-x-0 top-1/2 bg-transparent`;

const Form = tw.form`mx-auto max-w-xs`;
//const Input = tw.input`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 first:mt-0`;

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

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "Créer un compte chez Clyster",
  submitButtonText = "Sign Up",
  SubmitButtonIcon = SignUpIcon,
  tosUrl = "#",
  privacyPolicyUrl = "#",
  signInUrl = "#",
  redirectUser = "/signupuser",
  redirectCompany = "/signupcompany"
}) => {
  const navigate = useNavigate();

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
                <DividerTextContainer>
                  <DividerText>Quel type de compte aimeriez vous créer</DividerText>
                </DividerTextContainer>
                <Form>
                  
                  {/* Redirect Button 1 */}
                  <SubmitButton type="button" onClick={() => navigate(redirectUser)}>
                    <SubmitButtonIcon className="icon" />
                    <span className="text">Un utilisateur</span>
                  </SubmitButton>
                  
                  {/* Redirect Button 2 */}
                  <SubmitButton type="button" onClick={() => navigate(redirectCompany)}>
                    <SubmitButtonIcon className="icon" />
                    <span className="text">Une entreprise</span>
                  </SubmitButton>
                  
                  <p tw="mt-6 text-xs text-gray-600 text-center">
                  J'accepte de respecter les{" "}
                    <a href={tosUrl} tw="border-b border-gray-500 border-dotted">
                    Conditions d'utilisation
                    </a>{" "}
                    de Clyster et sa{" "}
                    <a href={privacyPolicyUrl} tw="border-b border-gray-500 border-dotted">
                    Politique de confidentialité
                    </a>
                  </p>

                  <p tw="mt-8 text-sm text-gray-600 text-center">
                    Vous avez déjà un compte?{" "}
                    <a href={signInUrl} tw="border-b border-gray-500 border-dotted">
                      Connexion
                    </a>
                  </p>
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
