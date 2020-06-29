export default class ChapterModel {
    urlBase64!: string;
    cover!: string;
    title!: string;
    images!: string[];
    loadedFromDatabase?: boolean;
}