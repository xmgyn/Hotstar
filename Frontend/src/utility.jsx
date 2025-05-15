import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [ data, setData] = useState(null);
    const [ context, setContext] = useState(null);
    const [ details, setDetails] = useState(null);
    const [ play, setPlay ] = useState(false);
    const [ tab, setTab ] = useState("All");
    const [ meta, setMeta ] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://192.168.0.110:4373/getCollections/${tab}?rating=18203`); 
                const result = await response.json();
                const shuffledResult = result.sort(() => Math.random() - 0.5);
                setData(shuffledResult);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [tab]);

    return (
        <DataContext.Provider value={{ data, context, setContext, play, setPlay, tab, setTab, meta, setMeta, details, setDetails }}>
            {children}
        </DataContext.Provider>
    );
};
