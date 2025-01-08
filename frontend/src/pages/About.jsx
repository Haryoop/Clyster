import React, { useEffect } from "react";

const About = () => {
  useEffect(() => {
    document.title = "About Us | My App"; // Set the title for About page
  }, []);

  return <h1>About Us</h1>;
};

export default About;
