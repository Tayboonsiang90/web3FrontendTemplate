// This is a global context that can be used to share state variables across all pages
import React, { useContext, useState } from "react";

const GlobalContext = React.createContext();

// For subpages that require the context to use
export function useGlobalContext() {
    return useContext(GlobalContext);
}

// For app.js to use
export function GlobalProvider({ children }) {
    // State variables
    const [currentAccountAddress, setCurrentAccountAddress] = useState("");
    const [currentAccountEthBal, setCurrentAccountEthBal] = useState(0);
    const [currentAccountVoteBal, setCurrentAccountVoteBal] = useState(0);
    const [metamaskExistCheck, setMetamaskExistCheck] = useState(true);
    const [currentChainId, setCurrentChainId] = useState(0);

    return (
        <GlobalContext.Provider value={{ currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal }}>
            {children}
        </GlobalContext.Provider>
    );
}
