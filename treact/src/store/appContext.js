import React, { useState, useEffect } from "react";
import getState from "./flux.js";

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
            const token = sessionStorage.getItem("token");
            const email = sessionStorage.getItem("email");

            if (token) {
                initialState.store.token = token;
            }

            if (email) {
                initialState.store.email = email;
            }

            return initialState;
        });

        useEffect(() => {
            if (state.actions?.getMessage) {
                state.actions.getMessage();
            }
        }, [state.actions]);

        return (
            <Context.Provider value={state}>
                <PassedComponent {...props} />
            </Context.Provider>
        );
    };

    return StoreWrapper;
};

export default injectContext;
