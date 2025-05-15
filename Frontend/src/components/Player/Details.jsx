import { Fragment } from "react";
import { useContext } from "react";

import { DataContext } from "../../utility";

function Details({ Props }) {
    const { details } = useContext(DataContext);

    return (
        <Fragment>
            <div id="Details-Window" className="Details-Window">
                <div className="Details-Close" onClick={() => Props.showDetails(false)}></div>
                <div className="Details-Pane">{ JSON.stringify(details) ?? "We Dont Have Any" }</div>
            </div>
        </Fragment>
    )
}

export default Details;