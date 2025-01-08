import React, { useEffect, useState } from "react";

function App() {
  const [people, setPeople] = useState([]); // List of people
  const [newPerson, setNewPerson] = useState({
    first_name: "",
    last_name: "",
    age: "",
  }); // New person data for form

  const API_URL = "http://127.0.0.1:5000/api/people"; // Backend API URL
  useEffect(() => {
    document.title = "Home - People Management"; // Update the tab title
    fetchPeople(); // Fetch people on component load
  }, []);

  // Fetch all people when the component loads
  const fetchPeople = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({ ...newPerson, [name]: value });
  };

  // Add a new person
  const addPerson = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPerson),
      });
      if (response.ok) {
        fetchPeople(); // Refresh list after adding
        setNewPerson({ first_name: "", last_name: "", age: "" }); // Clear form
      }
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  // Delete a person by ID
  const deletePerson = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchPeople(); // Refresh list after deleting
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>People List</h1>

      {/* Form to Add a New Person */}
      <div>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={newPerson.first_name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={newPerson.last_name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={newPerson.age}
          onChange={handleInputChange}
        />
        <button onClick={addPerson}>Add Person</button>
      </div>

      {/* Display the List of People */}
      <ul>
        {people.map((person) => (
          <li key={person._id}>
            {person.first_name} {person.last_name} - {person.age} years old
            <button
              onClick={() => deletePerson(person._id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
