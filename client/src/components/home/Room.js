import React from 'react'

const Room = ({name}) => {
    return (
        
        <div className="card horizontal">
          <div className="card-stacked">
            <div className="card-content">
                {name}
            </div>
          </div>
        </div>
        
    )
}

export default Room
