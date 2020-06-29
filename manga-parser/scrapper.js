const puppeteer = require('puppeteer');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve,) => {
            let totalHeight = 0;
            let distance = 300;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function getNextChapterUrl(page) {
    const selectors = await getSelectors();
    return await page.evaluate((selectors) => {
        const nextChapterLink = selectors.nextChapterSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined && content.href !== undefined);
        return nextChapterLink && nextChapterLink.href ? nextChapterLink.href : undefined;
    }, selectors);
}

async function getNextChapterFromUrl(url) {
    const page = await getNewPage();
    await goToChapter(url, page);
    const nextChapterUrl = await goToNextChapter(page);
    if (!nextChapterUrl) return;
    const chapter = await getChapter(page);
    await page.close();
    return {urlBase64: Buffer.from(nextChapterUrl).toString('base64'), ...chapter};
}

async function hasNextChapter(url) {
    const page = await getNewPage();
    await goToChapter(url, page);
    const nextChapterUrl = await getNextChapterUrl(page);
    console.log('next chapter url: ', nextChapterUrl);
    if (nextChapterUrl === undefined) {
        await page.close();
        return '';
    }
    const selectors = await getSelectors();
    const manga = await page.evaluate((selectors) => {
        let title = selectors.titleSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined) || '';
        let cover = selectors.coverSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined) || '';
        return {cover: cover, title: title};
    }, selectors)
    await page.close();
    return {...manga, urlBase64: Buffer.from(nextChapterUrl).toString('base64')};
}

let browser = null;

async function getNewPage() {
    if (browser === null) {
        browser = await puppeteer.launch();
    }
    return await browser.newPage();
}

async function getManga(url) {
    const page = await getNewPage();
    await goToChapter(url, page);
    const selectors = await getSelectors();
    const manga = await page.evaluate((selectors) => {
        let title = selectors.titleSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined) || '';
        let cover = selectors.coverSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined) || '';
        return {cover: cover, title: title};
    }, selectors)
    await page.close();
    return {urlBase64: Buffer.from(url).toString('base64'), ...manga};
}

async function getChapterFromUrl(url) {
    const page = await getNewPage();
    await goToChapter(url, page);
    const chapter = await getChapter(page);
    await page.close();
    if (chapter === undefined) {
        return {};
    }
    if (chapter.error) {
        console.error('puppetter error: ', chapter.error);
        return {error: 500, message: chapter.error}
    }
    console.log("chapter :: ", chapter);
    return {urlBase64: Buffer.from(url).toString('base64'), ...chapter};
}

async function goToNextChapter(page) {
    const url = await getNextChapterUrl(page);
    console.log("goto " + url)
    if (url === undefined) {
        return null
    }
    await page.goto(url)
    return url;
}

async function goToChapter(url, page) {
    console.log("goto " + url)
    await page.goto(url);
}

const privateSelectors = {
    initialized: false,
    coverSelectors: [],
    imagesSelectors: [],
    nextChapterSelectors: [],
    titleSelectors: []
}

async function getSelectors() {
    if (!privateSelectors.initialized) {
        privateSelectors.coverSelectors = await getSelectorsFromCSVFile('cover');
        privateSelectors.imagesSelectors = await getSelectorsFromCSVFile('images');
        privateSelectors.nextChapterSelectors = await getSelectorsFromCSVFile('next-chapter');
        privateSelectors.titleSelectors = await getSelectorsFromCSVFile('title');
        privateSelectors.initialized = true;
    }
    return privateSelectors;
}

async function getSelectorsFromCSVFile(type) {
    const csv = require('csv-parser');
    const fs = require('fs');
    const selectors = await new Promise((resolve, _) => {
        const selectors = []
        fs.createReadStream(`./selectors/${type}-selectors.csv`)
            .pipe(csv())
            .on('data', (row) => {
                selectors.push(row.selector.replace(/"/g, '\"').replace(/'/g, '\''));
            })
            .on('end', () => {
                resolve(selectors);
            });
    });
    return selectors;
}

async function getChapter(page) {
    console.log("scroll to bottom")
    await autoScroll(page);
    console.log("get images")
    const selectors = await getSelectors();
    return await page.evaluate(async (selectors, corsProxyUrl) => {
        try {
            const images = []
            images.push(
                ...selectors.imagesSelectors
                    .map(selector => eval(selector))
                    .find(content => content !== undefined && content.length > 0)
                    .toArray()
                    .map(({currentSrc}) => currentSrc)
            );

            let title = selectors.titleSelectors
                .map(selector => eval(selector))
                .find(content => content !== undefined) || '';

            let cover = selectors.coverSelectors
                .map(selector => eval(selector))
                .find(content => content !== undefined) || '';

            async function getDataUri(targetUrl) {
                return await new Promise(function (resolve, reject) {
                    let request = new XMLHttpRequest();
                    request.onload = function () {
                        if (request.status >= 200 && request.status < 400) {
                            let reader = new FileReader();
                            reader.onloadend = function () {
                                return resolve(reader.result.toString());
                            };
                            reader.readAsDataURL(request.response);
                        } else {
                            console.log('There was an error retrieving the image', request);
                            return reject('There was an error retrieving the image', request);
                        }
                    };
                    request.onerror = () => reject(xhr.statusText);
                    let proxyUrl = corsProxyUrl;
                    request.open('GET', proxyUrl + targetUrl);
                    request.responseType = 'blob'
                    request.send();
                });
            }

            async function getBase64Images(images) {
                const base64Images = [];
                for (let i = 0; i < images.length; i++) {
                    await getDataUri(images[i]).then(base64Image => base64Images.push(base64Image));
                }
                return base64Images;
            }

            async function convertChapterImagesToBase64(chapter) {
                const base64Images = await getBase64Images(chapter.images);
                console.log("convert: ", chapter.images.toString());
                return {...chapter, images: base64Images};
            }

            async function isRestrictedByCORS() {
                return await new Promise(function (resolve, _) {
                    let xhr = new XMLHttpRequest();
                    if ("withCredentials" in xhr) {
                        xhr.open('GET', images[0], true);
                    }
                    xhr.send();
                    xhr.onloadend = function () {
                        resolve(false);
                    };
                    xhr.onerror = function () {
                        resolve(true);
                    }
                });
            }

            const restricted = await isRestrictedByCORS;

            if (restricted) {
                return await convertChapterImagesToBase64({
                    images: images,
                    cover: cover,
                    title: title
                });
            } else {
                return {
                    images: images,
                    cover: cover,
                    title: title
                }
            }
        } catch (err) {
            return {error: err.toString()}
        }
    }, selectors, process.env.CORS_ANYWHERE_URL);
}

module.exports = {
    getChapterFromUrl: async (url) => {
        console.log(new Date().toLocaleString() + ": getChapterFromUrl: " + url)
        const response = await getChapterFromUrl(url);
        if (process.env.MODE === 'dev') {
            console.log("response: ", response);
        }
        console.log("Done ! 👍");
        return response;
    },
    getNextChapterFromUrl: async (url) => {
        console.info(new Date().toLocaleString() + ": getNextChapterFromUrl: " + url)
        const response = await getNextChapterFromUrl(url);
        if (process.env.MODE === 'dev') {
            console.log("response: ", response);
        }
        console.info(new Date().toLocaleString() + ": Done ! 👍");
        return response;
    },
    hasNextChapterFromUrl: async (url) => {
        console.info(new Date().toLocaleString() + ": hasNextChapterFromUrl: " + url)
        const response = await hasNextChapter(url);
        if (process.env.MODE === 'dev') {
            console.log("response: ", response);
        }
        console.info(new Date().toLocaleString() + ": Done ! 👍");
        return response;
    },
    getMangaFromUrl: async (url) => {
        console.info(new Date().toLocaleString() + ": getMangaFromUrl: " + url)
        const response = await getManga(url);
        if (process.env.MODE === 'dev') {
            console.log("response: ", response);
        }
        console.info(new Date().toLocaleString() + ": Done ! 👍");
        return response;
    }
};