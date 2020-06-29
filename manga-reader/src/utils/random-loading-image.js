const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const getRandomLoadingImage = () => {
    const images = require.context('../images/loading', false, /\.(gif|png|jpe?g|svg)$/).keys().map((key) => key);
    if (images != null) {
        return require('../images/loading' + images[getRandomInt(0, images.length)].substr(1,));
    }
    return null;
}

export default getRandomLoadingImage;
