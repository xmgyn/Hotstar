import { useContext } from "react";
import { DataContext } from "./../utility";

function Navbar() {
    const { setTab: changeTab } = useContext(DataContext);

    const shift = (event) => {
        document.querySelector("div.Nav-Active").classList.remove('Nav-Active');
        event.target.classList.add("Nav-Active");
        changeTab(event.target.firstChild.data);
    }

    return (
        <div className="Navbar">
            <div className="Nav-Left">
                <div className="Nav-Item Nav-Active oxygen-bold" onClick={shift}>Home</div>
                <div className="Nav-Item oxygen-bold" onClick={shift}>Movies</div>
                <div className="Nav-Item oxygen-bold" onClick={shift}>Series</div>
                <div className="Nav-Item oxygen-bold" onClick={shift}>Favourites</div>
            </div>
            <div className="Nav-Right">
                <div className="Search-Box"></div>
                <div className="Profile"><img src="avatar.png" /></div>
            </div>
        </div>
    )
}

export default Navbar