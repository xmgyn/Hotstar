function Navbar() {
    return (
        <div className="Navbar">
            <div className="Nav-Left">
                <div className="Nav-Item Nav-Active oxygen-bold">Home</div>
                <div className="Nav-Item oxygen-bold">Movies</div>
                <div className="Nav-Item oxygen-bold">Series</div>
                <div className="Nav-Item oxygen-bold">Favourites</div>
            </div>
            <div className="Nav-Right">
                <div className="Search-Box"></div>
                <div className="Profile"><img src="avatar.png" /></div>
            </div>
        </div>
    )
}

export default Navbar