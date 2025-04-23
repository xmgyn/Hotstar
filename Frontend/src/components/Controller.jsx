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
                <div className="Controls">
                    <div className="Controls-Seek-Back"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <defs>
        <style>
          {`
            .cls-1 { fill: #f2f2f2; }
            .cls-2 { fill: #2e3192; }
            .cls-3 { fill: #3fa9f5; }
          `}
        </style>
      </defs>
      <title></title>
      <g data-name="01" id="_01">
        <circle className="cls-1" cx="16" cy="16" r="13"></circle>
        <path className="cls-2" d="M16,30A13.92,13.92,0,0,1,2.61,20.1a1,1,0,1,1,1.91-.58A12,12,0,1,0,4,16a1,1,0,0,1-2,0A14,14,0,1,1,16,30Z"></path>
        <polygon className="cls-3" points="15 11.5 15 20.5 9 16 15 11.5"></polygon>
        <path className="cls-2" d="M15,21.5a1,1,0,0,1-.6-.2l-6-4.5a1,1,0,0,1,0-1.6l6-4.5a1,1,0,0,1,1-.09,1,1,0,0,1,.55.89v9a1,1,0,0,1-.55.89A.91.91,0,0,1,15,21.5ZM10.67,16,14,18.5v-5Z"></path>
        <polygon className="cls-3" points="21 11.5 21 20.5 15 16 21 11.5"></polygon>
        <path className="cls-2" d="M21,21.5a1,1,0,0,1-.6-.2l-6-4.5a1,1,0,0,1,0-1.6l6-4.5a1,1,0,0,1,1.05-.09,1,1,0,0,1,.55.89v9a1,1,0,0,1-.55.89A.91.91,0,0,1,21,21.5ZM16.67,16,20,18.5v-5Z"></path>
      </g>
    </g>
  </svg></div>
                    <div className="Controls-Seek-Play"></div>
                    <div className="Controls-Seek-Ahead"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <defs>
        <style>
          {`
            .cls-1 { fill: #f2f2f2; }
            .cls-2 { fill: #2e3192; }
            .cls-3 { fill: #3fa9f5; }
          `}
        </style>
      </defs>
      <title></title>
      <g data-name="01" id="_01">
        <circle className="cls-1" cx="16" cy="16" r="13"></circle>
        <path className="cls-2" d="M16,30A14,14,0,1,1,30,16a1,1,0,0,1-2,0,12,12,0,1,0-.52,3.52,1,1,0,1,1,1.91.58A13.92,13.92,0,0,1,16,30Z"></path>
        <polygon className="cls-3" points="17 11.5 17 20.5 23 16 17 11.5"></polygon>
        <path className="cls-2" d="M17,21.5a.91.91,0,0,1-.45-.11A1,1,0,0,1,16,20.5v-9a1,1,0,0,1,.55-.89,1,1,0,0,1,1.05.09l6,4.5a1,1,0,0,1,0,1.6l-6,4.5A1,1,0,0,1,17,21.5Zm1-8v5L21.33,16Z"></path>
        <polygon className="cls-3" points="11 11.5 11 20.5 17 16 11 11.5"></polygon>
        <path className="cls-2" d="M11,21.5a.91.91,0,0,1-.45-.11A1,1,0,0,1,10,20.5v-9a1,1,0,0,1,.55-.89,1,1,0,0,1,1,.09l6,4.5a1,1,0,0,1,0,1.6l-6,4.5A1,1,0,0,1,11,21.5Zm1-8v5L15.33,16Z"></path>
      </g>
    </g>
  </svg></div>

  {/* https://www.svgrepo.com/svg/422329/mp3-music-pause
  https://www.svgrepo.com/svg/422330/mp3-music-play */}
                </div>
                <div className="Controller-Audio-Button"></div>
                <div className="Controller-Info-Button"></div>
                <div className="Controller-Close"></div>
            </div>
            <div className="Seek-Bar">
                <div className="Video-Current-Time">26:00</div>
                <div className="Video-Total-Time">1:32:00</div>
            </div>
            
        </div>
    )
}

export default Controller