import React, { useState, useEffect } from "react";
import getState from "./flux.js";

// Initialize the context
export const Context = React.createContext(null);

const injectContext = (PassedComponent) => {
    const StoreWrapper = (props) => {
        const [state, setState] = useState(() => {
            const initialState = getState({
                getStore: () => state.store,
                getActions: () => state.actions,
                setStore: (updatedStore) =>
                    setState((prevState) => ({
                        ...prevState,
                        store: { ...prevState.store, ...updatedStore },
                    })),
            });

            // Synchronize token and email from sessionStorage on initial load
            const token = sessionStorage.getItem("token");
            //const email = sessionStorage.getItem("email");

            if (token) {
                initialState.store.token = token; // Update the store with the token
            }

            if (email) {
                initialState.store.email = email; // Update the store with the email
            }

            return initialState;
        });

        useEffect(() => {
            if (state.actions?.getMessage) {
                state.actions.getMessage();
            }
        }, [state.actions]); // ✅ Fix: Added state.actions as a dependency

        return (
            <Context.Provider value={state}>
                <PassedComponent {...props} />
            </Context.Provider>
        );
    };

    return StoreWrapper;
};

export default injectContext;
