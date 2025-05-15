import { Fragment } from "react";

function Details({ Props }) {
    return (
        <Fragment>
            <div id="Details-Window" className="Details-Window">
                <div className="Details-Close" onClick={() => Props.showDetails(false)}></div>
                <div className="Details-Pane">{ Props.Details ?? "We Dont Have Any" }</div>
            </div>
        </Fragment>
    )
}

export default Details;