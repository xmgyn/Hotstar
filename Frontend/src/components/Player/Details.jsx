import { Fragment } from "react";
import { useContext } from "react";

import Close from "../../assets/Close";

import { DataContext } from "../../utility";

function Details({ Props }) {
    const { details } = useContext(DataContext);

    return (
        <Fragment>
            <div className="Window">
                <div className="Details-Pane">{ JSON.stringify(details) ?? "We Dont Have Any" }</div>
                <div className="Window-Close" onClick={() => Props.showDetails(false)}><Close /></div>
            </div>
        </Fragment>
    )
}

export default Details;