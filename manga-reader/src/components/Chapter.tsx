import * as React from 'react';
import "./Chapter.scss"

const Chapter = (props: {images: string[]}) => {

    return (
        <div className={"chapter-container"}>
            {
                props.images.map((url, i) => {
                    return <img key={url+i} src={url} alt=""/>
                })
            }
        </div>
    )
}

export default Chapter;