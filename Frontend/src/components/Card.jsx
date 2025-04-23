

function Card({ className, CardNavigate, image }) {
    return (
        <div className={"Card " + className} onClick={(event) => CardNavigate(event)}>
            <img src={image} />
        </div>
    )
}

export default Card