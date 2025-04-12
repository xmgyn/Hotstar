function Card({ className, image }) {
    return (
        <div className={"Card " + className}>
            <img src={image} />
        </div>
    )
}

export default Card