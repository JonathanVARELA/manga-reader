import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MangaDatabase from "./MangaDatabase";
import {Manga} from "../models/Manga";
import {Link} from 'react-router-dom';
import "./MainView.scss"
import newLogo from '../images/new.png'
import {TextField} from "@material-ui/core";
import LoadingMangaCard from './LoadingMangaCard';
import deleteIcon from '../images/delete.svg';
import exportIcon from '../images/export.svg'
import importIcon from '../images/import.svg'
import MangaService from "../services/MangaService";
import Footer from "./Footer";

const MainView = ({db}: { db: MangaDatabase, }) => {

    const [mangas, setMangas] = useState<Manga[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isLoadingANewChapter, setIsLoadingANewChapter] = useState<boolean>(false)
    const [updateCheckList, setUpdateCheckList] = useState<{ checkList: { manga: Manga }[] }>({checkList: []})
    const [loadNextChapterList, setLoadNextChapterList] = useState<Manga[]>([])
    const [importCollectionFile, setImportCollectionFile] = useState();
    const [exportIsProcessing, setExportIsProcessing] = useState<boolean>(false);
    const mangaService = MangaService(db);

    const addManga = async (urlBase64: string) => {
        setIsLoadingANewChapter(true);
        setLoading(true);
        const manga = await getManga(urlBase64);
        if (manga && manga.urlBase64) {
            const updatedManga = {...manga, lastView: new Date(), newChapter: false};
            await mangaService.save(updatedManga);
            const currentManga = mangas.find(m => m.cover === updatedManga.cover);
            if (currentManga) {
                mangas.splice(mangas.indexOf(currentManga), 1);
            }
            await setMangas([...mangas, updatedManga])
            await setUpdateCheckList({checkList: [...updateCheckList.checkList, {manga: updatedManga}]})
            await setLoadNextChapterList([...loadNextChapterList, updatedManga]);
            await updateCheck();
        }
        setLoading(false);
        setIsLoadingANewChapter(false);
    }

    const getManga = async (urlBase64: string) => {
        return await mangaService.getWhere({urlBase64: urlBase64});
    }

    const updateCheck = async () => {
        for (let i = 0; i < updateCheckList.checkList.length; i++) {
            setLoading(true);
            const currentManga = updateCheckList.checkList[i].manga;
            const mangaNextChapter = await mangaService.hasNewChapter(currentManga.urlBase64);
            if (mangaNextChapter) {
                await updateManga({
                    ...currentManga,
                    newChapter: true,
                    nextChapter: mangaNextChapter
                });
            } else {
                await updateManga({...currentManga, newChapter: false});
            }
            updateCheckList.checkList.splice(i, 1);
            updateCheckList.checkList = [...updateCheckList.checkList];
            setLoading(false);

        }
    }

    const updateManga = async (manga: Manga) => {
        await mangaService.save(manga);
        setMangas([...mangas])
    }

    const loadNextChapters = async (mangas: Manga[]) => {
        if (process.env.REACT_APP_MODE === 'dev') {
            console.log('load next chapters ', loadNextChapterList);
        }
        setLoading(true);
        for (const source of mangas) {
            if (source.urlBase64) {
                if (process.env.REACT_APP_MODE === 'dev') {
                    console.info('load next chapter for : ', source);
                }
                const nextChapter = await mangaService.getNextChapter(source.urlBase64);
                if (nextChapter) {
                    source.nextChapter = nextChapter
                    await updateManga(source);
                }
            }
        }
        setLoadNextChapterList([]);
        setLoading(false);
    }

    useEffect(() => {
        if (!isLoading && updateCheckList.checkList.length > 0) {
            updateCheck();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateCheckList, isLoading])

    useEffect(() => {
        fetchMangasFromDatabase();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchMangasFromDatabase = async () => {
        if (process.env.REACT_APP_MODE === 'dev') {
            console.info('fetch mangas from database');
        }
        mangaService
            .getAll()
            .then((mangas) => {
                setMangas(mangas);
                setUpdateCheckList({
                    checkList: [
                        ...mangas
                            .filter(manga => !manga.newChapter)
                            .map((manga) => {
                                return {manga: manga}
                            })
                    ]
                });
                loadNextChapters([...mangas.filter(manga => manga.newChapter).filter(manga => manga.nextChapter?.images === undefined)]);
            });
    }

    const removeManga = (manga: Manga) => {
        //todo make awesome modal
        if (window.confirm('Delete "' + manga.title + '" ?')) {
            mangaService.deleteWhere({cover: manga.cover});
            const checkListIndex = updateCheckList.checkList.indexOf({manga: manga});
            if (checkListIndex) {
                updateCheckList.checkList = [...updateCheckList.checkList.splice(checkListIndex, 1)];
            }
            mangas.splice(mangas.indexOf(manga), 1);
            setMangas([...mangas]);
        }
    }

    const importCollection = async (collection: Manga[]) => {
        const backup = await db.mangas.toCollection().toArray();
        try {
            await mangaService.deleteAll();
            await mangaService.addAll(collection);
            if (process.env.REACT_APP_MODE === 'dev') {
                console.info('import successful 👍');
            }
            await setMangas([]);
            fetchMangasFromDatabase();
        } catch (e) {
            console.error(e);
            console.info('rollback');
            await mangaService.deleteAll();
            await mangaService.addAll(backup);
        }
    }

    useEffect(() => {
        if (importCollectionFile) {
            const reader = new FileReader();
            reader.onloadend = (event) => {
                const result = event?.target?.result;
                if (result) {
                    const importedMangas = JSON.parse(result.toString());
                    if (importedMangas.length > 0) {
                        importCollection(importedMangas);
                    }
                }
            };

            reader.readAsText(importCollectionFile)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [importCollectionFile])

    const exportCollection = async () => {
        if (!exportIsProcessing) {
            setExportIsProcessing(true);
            const collection = await db.mangas.toCollection().toArray();

            const href = await URL.createObjectURL(
                new Blob([JSON.stringify(collection)], {type: 'application/json'})
            );
            const link = document.createElement('a');
            link.href = href;
            link.download = new Date().toLocaleString() + "_manga_collection.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setExportIsProcessing(false);
        }
    }

    const importCollectionRef = useRef(null);

    function getMangaUrl(manga: Manga) {
        return manga.newChapter && manga.nextChapter?.urlBase64 ? manga.nextChapter?.urlBase64 : manga.urlBase64;
    }

    // @ts-ignore
    return (
        <div id={"main"}>
            <div className={"header"}>
                <div className={'input-container'}>
                    <TextField fullWidth={true} id={"new-source-input"}
                               label={"To add a new manga, insert your last chapter url here ! 😊"}
                               onChange={async ({target}) => {
                                   await addManga(btoa(target.value))
                                   target.value = '';
                               }}/>
                </div>
                <div className={'export' + (exportIsProcessing ? ' processing' : '')}>
                    <img src={exportIcon} onClick={() => exportCollection()} alt="export"/>
                </div>
                <div className={'import'}>
                    <label>
                        <input
                            ref={importCollectionRef}
                            defaultValue={importCollectionFile}
                            onChange={({target}) => {
                                if (target && target.files && target.files[0])
                                    setImportCollectionFile(target.files[0])
                            }}
                            hidden={true}
                            type={"file"}
                        />
                        <img src={importIcon} alt="import"/>
                    </label>
                </div>
            </div>
            <ul>
                {
                    mangas?.map((manga, i) => {
                        return <li key={manga.urlBase64 + i}>
                            {
                                manga.newChapter ? <div className={"new-container"}>
                                    <img src={newLogo} alt=""/>
                                </div> : <></>
                            }
                            <div className={'delete-icon'}>
                                <img src={deleteIcon} onClick={() => removeManga(manga)} alt="remove"/>
                            </div>
                            <Link to={"/manga/" + getMangaUrl(manga)} style={{textDecoration: 'none'}}>
                                <span className={"card"}>
                                    <img src={manga.cover} alt=""/>
                                    <div>{manga.title}</div>
                                </span>
                            </Link>
                        </li>
                    })
                }
                {
                    isLoadingANewChapter
                        ? <LoadingMangaCard/>
                        : <></>
                }
            </ul>
            <Footer/>
        </div>
    )
}

export default MainView;