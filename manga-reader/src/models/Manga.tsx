import ChapterModel from "./ChapterModel";

export class Manga {
    id?: number;
    urlBase64!: string;
    cover!: string;
    title!: string;
    images?: string[];
    newChapter!: boolean;
    lastUpdate!: Date;
    lastView!: Date;
    nextChapter?: ChapterModel;
}