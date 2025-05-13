import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [ data, setData] = useState(null);
    const [ context, setContext] = useState(null);
    const [ play, setPlay ] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://192.168.0.110:4373/getCollections/All?rating=18203"); 
                const result = await response.json();
                const shuffledResult = result.sort(() => Math.random() - 0.5);
                setData(shuffledResult);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{ data, context, setContext, play, setPlay }}>
            {children}
        </DataContext.Provider>
    );
};
