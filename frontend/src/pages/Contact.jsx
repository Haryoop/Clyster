import React, { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact Us | My App"; // Set the title for Contact page
  }, []);

  return <h1>Contact Us</h1>;
};

export default Contact;
