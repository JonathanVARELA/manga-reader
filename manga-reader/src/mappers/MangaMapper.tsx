import {Manga} from "../models/Manga";
import ChapterModel from "../models/ChapterModel";

const MangaMapper = () => {

    const chapterToManga = (chapter: ChapterModel, includeImages = false): Manga => {
        return {
            title: chapter.title,
            urlBase64: chapter.urlBase64,
            cover: chapter.cover,
            lastUpdate: new Date(),
            lastView: new Date(),
            images: includeImages ? chapter.images : undefined,
            nextChapter: undefined,
            newChapter: false
        } as Manga;
    }

    return {
        chapterToManga: chapterToManga
    }

}
export default MangaMapper;