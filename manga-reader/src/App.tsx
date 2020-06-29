import React, {useEffect} from 'react';
import './App.css';
import ReaderView from "./components/ReaderView";
import MangaDatabase from "./components/MangaDatabase";
import {Route, BrowserRouter as Router} from 'react-router-dom'
import MainView from "./components/MainView";

function App() {
    const db = new MangaDatabase();
    useEffect(() => {
        if (process.env.MODE !== 'prod') {
            require('dotenv').config();
        }
    }, [])
    return (
        <Router>
            <Route exact path="/" component={() => <MainView db={db as MangaDatabase}/>}/>
            <Route path="/manga/:url" component={() => <ReaderView db={db as MangaDatabase}/>}/>
        </Router>
    );
}

export default App;
