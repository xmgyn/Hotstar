import Card from './Card'
import Left from '../assets/Left'

import React, { useEffect, useRef, useContext } from "react";
import { DataContext } from "./../utility"; 



function List({ className }) {
    const { data:cardData, setContext: changeContext } = useContext(DataContext);
    const previousCardRef = useRef(null);

    function CardNavigate(event) {
        if (previousCardRef.current) {
            const imgElement = previousCardRef.current.querySelector("img");
            imgElement.src = imgElement.src.replace("Preview", "Card");
            previousCardRef.current.classList.remove("Preview-Card");
        }

        const imgElement = event.currentTarget.querySelector("img");
        imgElement.src = imgElement.src.replace("Card", "Preview");
        event.currentTarget.classList.add("Preview-Card");

        previousCardRef.current = event.currentTarget;
        changeContext(event.currentTarget);
    }
    useEffect(() => {
        const firstChild = document.querySelector(".Horizontal-Card").firstElementChild;
        if (firstChild) {
            CardNavigate({ currentTarget: firstChild }); 
        }
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
                {cardData && cardData.map((item) => ( <Card id={item._id} key={item._id} CardNavigate={CardNavigate} image={`http://192.168.0.110:4373/getCard/${item._id}`} /> ), function () { CardNavigate(document.querySelector(".Horizontal-Card").firstElementChild); })}
                {/* <Card className="Preview-Card" image="/stretch.jpg"/>
                <Card className="End-Card" image="/frozen.jpeg"/> */}
            </div>
        </div>
    )
}

export default List