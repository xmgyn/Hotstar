import { Fragment } from "react";
import Close from './../../assets/Close'

function AudioSelect({ Props }) {
    //Props.setAudio();
    return (
        <Fragment>
            <div className="Window">
                <div></div>
                <div className="Audio-Select-Pane">
                    {
                        Props.details &&
                        Props.details.audio_profiles.map(
                            (item) => (
                                <div className="Audio-Select-Item">
                                    <input name="Audio-Select" type="radio" />
                                    {item.name}
                                </div>
                            )
                        )
                    }
                </div>
                <div></div>
                <div className="Window-Close" onClick={() => Props.setShowAudioSelect(false)}><Close /></div>
                <div></div>
            </div>
        </Fragment>
    )
}

export default AudioSelect;