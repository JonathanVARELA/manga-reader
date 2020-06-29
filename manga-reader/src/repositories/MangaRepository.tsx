import MangaDatabase from "../components/MangaDatabase";
import {Manga} from "../models/Manga";

const MangaRepository = (db: MangaDatabase) => {

    const persist = async (manga: Manga): Promise<Manga | undefined> => {
        if (manga) {
            manga.lastUpdate = new Date();
            return db.mangas
                .where({cover: manga.cover})
                .first()
                .then(dbManga => {
                    if (!dbManga || dbManga.id === undefined) {
                        db.mangas.add(manga);
                    } else {
                        db.mangas.update(dbManga.id, manga)
                    }
                    return manga;
                });
        }
    }

    const getAll = (): Promise<Manga[]> => {
        return db.mangas
            .toCollection()
            .toArray();
    }

    const getFirstWhere = (criteria: { urlBase64: string, }): Promise<Manga | undefined> => {
        return db.mangas.where(criteria).first();
    }

    const deleteWhere = (criteria: {}) => {
        db.mangas.where({...criteria}).delete();
    }

    const deleteAll = async () => {
        await db.mangas.toCollection().delete();
    }

    const addAll = (mangas: Manga[]) => {
        db.mangas.bulkAdd(mangas);
    }

    return {
        getAll: getAll,
        deleteWhere: deleteWhere,
        deleteAll: deleteAll,
        addAll: addAll,
        getFirstWhere: getFirstWhere,
        save: persist
    }
}

export default MangaRepository;