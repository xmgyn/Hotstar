

function Card({ id, className, CardNavigate, image }) {
    return (
        <div id={id} className={"Card " + className} onClick={(event) => CardNavigate(event)}>
            <img src={image} />
        </div>
    )
}

export default Card