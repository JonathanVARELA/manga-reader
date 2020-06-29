import './LoadingMangaCard.scss'
import * as React from 'react';
import LoadingDots from "./LoadingDots";
import getRandomLoadingImage from '../utils/random-loading-image'

const LoadingMangaCard = () => {

    return (
        <li>
            <span className={"loading-card"}>
                <img className={"card-loading-image"} src={getRandomLoadingImage()} alt=""/>
                <div><span>Loading</span> <LoadingDots color={"white"}/></div>
            </span>
        </li>
    )
}

export default LoadingMangaCard;