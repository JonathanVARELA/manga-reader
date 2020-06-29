import {Manga} from "../models/Manga";
import {HttpRequestError} from "../models/HttpRequestError";
import ChapterModel from "../models/ChapterModel";

const MangaScrapperClient = () => {

    const request = async (url: string) => {
        const result = await fetch(url).then((res) => {
            if (res === undefined) {
                return {error: 404, message: 'not found'};
            } else {
                return res.json();
            }
        });
        if (result instanceof HttpRequestError || result ! instanceof Manga) {
            console.error(result)
            return undefined
        }
        return result;
    }

    const getManga = async (urlBase64: string): Promise<Manga | undefined> => {
        return await request(process.env.REACT_APP_MANGA_SCRAPPER_URL + "/manga?url=" + atob(urlBase64));
    }

    const hasNewChapter = async (urlBase64: string): Promise<ChapterModel | undefined> => {
        return await request(process.env.REACT_APP_MANGA_SCRAPPER_URL + "/next/available?url=" + atob(urlBase64));
    }

    const getNextChapter = async (urlBase64: string): Promise<ChapterModel | undefined> => {
        const result = await request(process.env.REACT_APP_MANGA_SCRAPPER_URL + "/next/images?url=" + atob(urlBase64));
        return (!result || !result.images || result.images.length === 0) ? undefined : result;
    }

    const getChapter = async (urlBase64: string): Promise<ChapterModel | undefined> => {
        const result = await request(process.env.REACT_APP_MANGA_SCRAPPER_URL + "/images?url=" + atob(urlBase64));
        return (!result || !result.images || result.images.length === 0) ? undefined : result;
    }

    return {
        getManga: getManga,
        hasNewChapter: hasNewChapter,
        getNextChapter: getNextChapter,
        getChapter: getChapter
    }

}

export default MangaScrapperClient;