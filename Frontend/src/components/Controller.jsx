function Controller() {
    return (
        <div id="Controller" >
            <div className="Controller-Head">
                <div className="Controller-Subtitle-Button">
                    Subtitle
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <defs>
                                <style>
                                    {`.cls-1 {fill: #f2f2f2;}
                      .cls-2 {fill: #2e3192;}
                      .cls-3 {fill: #3fa9f5;}`}
                                </style>
                            </defs>
                            <title></title>
                            <g data-name="01" id="_01">
                                <rect className="cls-1" height="12" rx="6" ry="6" width="26" x="3" y="10"></rect>
                                <path
                                    className="cls-2"
                                    d="M23,23H9A7,7,0,0,1,9,9H23a7,7,0,0,1,0,14ZM9,11A5,5,0,0,0,9,21H23a5,5,0,0,0,0-10Z"
                                ></path>
                                <circle className="cls-3" cx="9" cy="16" r="3"></circle>
                                <path
                                    className="cls-2"
                                    d="M9,20a4,4,0,1,1,4-4A4,4,0,0,1,9,20Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,9,14Z"
                                ></path>
                            </g>
                        </g>
                    </svg>
                </div>
                <div className="Controller-Title"></div>
                <div className="Controller-Audio-Button"></div>
                <div className="Controller-Info-Button"></div>
                <div className="Controller-Close"></div>
            </div>
            <div className="Seek-Bar">
                <div className="Video-Current-Time"></div>
                <div className="Video-Total-Time"></div>
            </div>
            <div className="Controls">
                <div className="Controls-Seek-Back"></div>
                <div className="Controls-Seek-Play"></div>
                <div className="Controls-Seek-Ahead"></div>
            </div>
        </div>
    )
}

export default Controller