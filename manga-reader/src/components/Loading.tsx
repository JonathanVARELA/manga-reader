import * as React from 'react';
import {useEffect, useState} from "react";
import './Loading.scss'
import LoadingDots from "./LoadingDots";
import getRandomLoadingImage from '../utils/random-loading-image'

const Loading = () => {

    const [imageSrc, setImageSrc] = useState()

    useEffect(() => {
        const image = getRandomLoadingImage();
        if (image != null) {
            setImageSrc(image);
        }
    }, [])

    return (<div className={'loading'}>
        <div className={"loading-text"}>
            <span>Loading</span><LoadingDots color={"black"}/>
        </div>
        <img src={imageSrc} alt=""/>
    </div>)
}

export default Loading;