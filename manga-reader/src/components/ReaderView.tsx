import * as React from 'react';
import {createRef, RefObject, useEffect, useState} from 'react';
import MangaDatabase from "./MangaDatabase";
import {useParams, Link} from 'react-router-dom';
import Loading from "./Loading";
import ChapterModel from "../models/ChapterModel"
import homeIcon from '../images/home.svg'
import './ReaderView.scss'
import Chapter from './Chapter';
import MangaService from "../services/MangaService";
import MangaScrapperClient from "../clients/MangaScrapperClient";
import MangaMapper from "../mappers/MangaMapper";

const ReaderView = ({db}: { db: MangaDatabase, url?: string }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [chapters, setChapters] = useState<ChapterModel[]>([]);
    const [mustFetchNextChapter, setMustFetchNextChapter] = useState<boolean>(false);
    const [elementsRef,] = useState<{ refs: { chapter: ChapterModel, element: RefObject<Element> }[] }>({refs: []});
    const {url: urlBase64} = useParams();
    const clone = require('rfdc')();
    const mangaService = MangaService(db);
    const mangaScrapperClient = MangaScrapperClient();
    const mangaMapper = MangaMapper();

    const isVisibleElement = (element: Element | null) => {
        if (!element) return;

        const {top, bottom} = element.getBoundingClientRect();
        const vHeight = (window.innerHeight || document.documentElement.clientHeight);

        return (
            (top > 0 || bottom > 0) &&
            top < vHeight
        );
    }

    const handleScroll = async () => {

        if (!loading) {
            if (elementsRef.refs.length > 0) {
                const currentChapter = elementsRef.refs.find(ref => isVisibleElement(ref.element.current));
                if (currentChapter && !currentChapter.chapter.loadedFromDatabase) {
                    await mangaService.save(mangaMapper.chapterToManga(currentChapter.chapter));
                }
                const shouldFetchNextChapter =
                    elementsRef.refs.length < 2
                    || (elementsRef.refs.length > 1 && (currentChapter === elementsRef.refs[elementsRef.refs.length - 1]));
                if (shouldFetchNextChapter) {
                    setMustFetchNextChapter(true);
                }
            }
        }
    }

    const fetchChapter = (urlBase64: string) => {
        if (loading) return;
        setLoading(true);
        mangaScrapperClient
            .getChapter(urlBase64)
            .then(chapter => {
                if (chapter) {
                    const updatedChapters = [...clone(chapters.filter(c => c !== chapter)), chapter]
                    elementsRef.refs = updatedChapters.map((data) => {
                        return {chapter: data, element: createRef<Element>()};
                    });
                    setChapters(updatedChapters);
                }
            });
        setLoading(false);
    }

    const fetchNextChapter = async (urlBase64: string) => {
        if (loading) return;
        setLoading(true);
        mangaScrapperClient
            .getNextChapter(urlBase64)
            .then(chapter => {
                if (chapter) {
                    const updatedChapters = [...clone(chapters.filter(c => c !== chapter)), chapter]
                    elementsRef.refs = updatedChapters.map((data) => {
                        return {chapter: data, element: createRef<Element>()};
                    });
                    setChapters(updatedChapters);
                    setMustFetchNextChapter(false);
                }
            });
        setLoading(false);
    }

    useEffect(() => {
        if (!loading && mustFetchNextChapter && chapters.length > 0) {
            fetchNextChapter(chapters[chapters.length - 1].urlBase64)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, mustFetchNextChapter])

    useEffect(() => {
        if (urlBase64 && !loading && !mustFetchNextChapter && chapters.length === 0) {
            mangaService
                .getAll()
                .then(mangas => {
                    const manga = mangas.find(manga => manga.nextChapter && manga.nextChapter.urlBase64 === urlBase64);
                    const isAvailableNextChapterInDatabase =
                        manga
                        && manga.nextChapter?.urlBase64
                        && manga.nextChapter.images?.length
                        && manga.nextChapter.images.length > 0;

                    if (isAvailableNextChapterInDatabase) {
                        chapters.push({
                            ...manga?.nextChapter,
                            urlBase64: manga?.nextChapter?.urlBase64
                        } as ChapterModel);
                        elementsRef.refs = chapters.map((chapter) => {
                            return {chapter: {...chapter, loadedFromDatabase: true}, element: createRef<Element>()};
                        });
                        setChapters([...clone(chapters)]);
                    } else {
                        fetchChapter(urlBase64);
                    }
                });
        }
        window.addEventListener("scroll", handleScroll, {passive: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={{minWidth: '100%', minHeight: '100%'}}>
            <div className="home-button">
                <Link to={'/'}>
                    <img src={homeIcon} alt=""/>
                </Link>
            </div>
            {
                elementsRef.refs.length > 0 ?
                    chapters.map((chapter, i) => {
                        // @ts-ignore
                        return <div className={'chapter-' + i} ref={elementsRef.refs[i].element} key={'chapter-' + i}>
                            <Chapter images={chapter.images}/>
                        </div>
                    }) : <Loading/>
            }
        </div>
    )
}

export default ReaderView;