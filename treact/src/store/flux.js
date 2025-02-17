const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: null, // Initialize token in the store
            message: null,
            demo: [
                {
                    title: "FIRST",
                    background: "white",
                    initial: "white",
                },
                {
                    title: "SECOND",
                    background: "white",
                    initial: "white",
                },
            ],
        },
        actions: {
            // Example function to change color (unchanged)
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },

            // Login action
            login: async (email, password) => {
                const opts = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                };

                try {
                    const resp = await fetch("http://localhost:5000/api/token", opts);

                    if (resp.status !== 200) {
                        alert("There has been an error logging in. Please check your credentials.");
                        return false;
                    }

                    const data = await resp.json();
                    console.log("Response from the backend:", data);

                    // Save token to sessionStorage
                    sessionStorage.setItem("token", data.access_token);
                    sessionStorage.setItem("email", email);

                    // Update the store with the new token
                    setStore({ token: data.access_token });

                    return true;
                } catch (error) {
                    console.error("There has been an error logging in:", error);
                    return false;
                }
            },

            logout: () => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("email");

                setStore({ token: null });

                console.log("User has been logged out.");
            },

            // Get message from the backend (unchanged)
            getMessage: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend:", error);
                }
            },

            // Change color function (unchanged)
            changeColor: (index, color) => {
                const store = getStore();
                const demo = store.demo.map((elm, i) => {
                    if (i === index) elm.background = color;
                    return elm;
                });
                setStore({ demo: demo });
            },
        },
    };
};

export default getState;