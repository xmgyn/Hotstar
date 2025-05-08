import Loading from './../assets/Loading'
import { useState, useEffect } from 'react';

function Card({ id, className, onClick, image }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true); 
    }, [image]); 

    return (
        <div id={id} className={"Card " + ((className) ? className : '')} onClick={onClick}>
            {loading && <Loading />} 
            <img 
                src={image} 
                style={{ display: loading ? "none" : "block" }}
                onLoad={() => setLoading(false)} 
            />
        </div>
    )
}

export default Card