import MangaDatabase from "../components/MangaDatabase";
import {Manga} from "../models/Manga";
import MangaScrapperClient from "../clients/MangaScrapperClient";
import ChapterModel from "../models/ChapterModel";
import MangaRepository from "../repositories/MangaRepository";

const MangaService = (db: MangaDatabase) => {

    const mangaScrapperClient = MangaScrapperClient();
    const mangaRepository = MangaRepository(db);

    const save = async (manga: Manga): Promise<Manga | undefined> => {
        return await mangaRepository.save(manga);
    }

    const getFirstWhere = async (criteria: { urlBase64: string, }, forceUpdate = false): Promise<Manga | undefined> => {
        let manga = undefined;
        if (!forceUpdate) {
            manga = await mangaRepository.getFirstWhere(criteria);
        }
        if (manga === undefined && criteria.urlBase64) {
            manga = await mangaScrapperClient.getManga(criteria.urlBase64);
        }
        if (process.env.REACT_APP_MODE === 'dev'){
            console.log('getFirstWhere: ', JSON.stringify(criteria), ' result: ', manga);
        }
        return manga;
    }

    const hasNewChapter = async (urlBase64: string): Promise<ChapterModel | undefined> => {
        return await mangaScrapperClient.hasNewChapter(urlBase64);
    }

    const getNextChapter = async (urlBase64: string): Promise<ChapterModel | undefined> => {
        return await mangaScrapperClient.getNextChapter(urlBase64);
    }

    const getAll = async (): Promise<Manga[]> => {
        return await mangaRepository.getAll();
    }

    const deleteWhere = (criteria: {}) => {
        mangaRepository.deleteWhere(criteria);
    }

    const deleteAll = async () => {
        await mangaRepository.deleteAll();
    }

    const addAll = async (mangas: Manga[]) => {
        await mangaRepository.addAll(mangas);
    }

    return {
        save: save,
        getWhere: getFirstWhere,
        hasNewChapter: hasNewChapter,
        getNextChapter: getNextChapter,
        getAll: getAll,
        deleteWhere: deleteWhere,
        deleteAll: deleteAll,
        addAll: addAll
    }
}

export default MangaService;