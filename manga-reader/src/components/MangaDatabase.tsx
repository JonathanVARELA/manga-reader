import Dexie from "dexie";
import { Manga } from "../models/Manga";

class MangaDatabase extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
    mangas: Dexie.Table<Manga, number>;

    constructor () {
        super("Mangas");
        this.version(1).stores({mangas: '++id, &urlBase64, cover, title, newChapter, lastUpdate, lastView, nextChapter, images'});
        // The following line is needed if your typescript
        // is compiled using babel instead of tsc:
        this.mangas = this.table("mangas");

    }
}

export default MangaDatabase;

