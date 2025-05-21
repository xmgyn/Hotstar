import Card from './Card'
import Left from '../assets/Left'

import React, { useEffect, useState, useRef, useContext } from "react";
import { DataContext } from "./../utility";



function List({ className }) {
    const { data: cardData, setContext: changeContext } = useContext(DataContext);
    const [selectedCard, setSelectedCard] = useState(null);

    function handleCardClick(card) {
        setSelectedCard(card._id);
        console.log(card)
        changeContext(card);
    }

    useEffect(() => {
        if (cardData && cardData.length > 0) {
            setSelectedCard(cardData[0]._id);
            changeContext(cardData[0]);
        }

       const arrowLeft = document.querySelector('.Arrow-Left');
const arrowRight = document.querySelector('.Arrow-Right');
const horizontalCard = document.querySelector('.Horizontal-Card');

const scrollLeft = () => {
    horizontalCard.scrollBy({
        left: -200, 
        behavior: 'smooth'
    });
};

const scrollRight = () => {
    horizontalCard.scrollBy({
        left: 200, 
        behavior: 'smooth'
    });
};

arrowLeft.addEventListener("click", scrollLeft);
arrowRight.addEventListener("click", scrollRight);

// Cleanup Function (Useful inside useEffect in React)
function removeEventListeners() {
    arrowLeft.removeEventListener("click", scrollLeft);
    arrowRight.removeEventListener("click", scrollRight);
}

// If used inside React, call removeEventListeners inside useEffect cleanup
return () => {
        removeEventListeners(); // Cleans up when the component unmounts
    };

    }, [cardData]);

    return (
        <div className={className}>
            <div className="Card-Heading">
                <div className="Text-Heading oxygen-bold">Collections</div>
                <div className="Navigate">
                    <div className="Arrow-Left"><Left /></div>
                    <div className="Arrow-Right"><Left /></div>
                </div>
            </div>
            <div className="Horizontal-Card">
                {
                    cardData && cardData.map(
                        (item, index) => {
                            const extraProps = {
                                className: `${selectedCard === item._id ? "Preview-Card" : ""} ${index === cardData.length - 1 ? "End-Card" : ""}`.trim(),
                                onClick: () => handleCardClick(item),
                                image: `http://192.168.0.110:4373/${(selectedCard === item._id) ? 'getPreview' : 'getCard'}/${item._id}`
                            };

                            return (
                                item && <Card key={item._id} id={item._id} {...extraProps} />
                            );
                        })
                }
            </div>
        </div>
    )
}

export default List