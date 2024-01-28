const fs = require("fs");
const axios = require("axios");
const { exec } = require("node:child_process");

const Value = {
    Slash: "/",
    Title: "title>",
    Equals: "=",
    Hyphen: "-",
    Picture: "picture>",
    EmptySpace: " ",
    EmptyString: "",
    DoubleQuotes: '"',
    VanGoghUrl: "https://micrio-cdn.vangoghmuseum.nl",
    TextHtmlResponse: "text/html",
    ArrayBufferResponse: "arraybuffer"
}

var paintingTitle = '';
var paintingId = '';
var totalImages = 0;

async function getPaintingProperties(url, column, row) {
    this.totalImages = getTotalImages(column, row);
    const response = await axios.get(url, {
        responseType: Value.TextHtmlResponse
    });
    let fullPageResponse = response.data;
    this.paintingTitle = getPaintingTitle(fullPageResponse);
    this.paintingId = getPaintingId(fullPageResponse);
    getVanGoghImage(
        this.paintingId,
        this.paintingTitle,
        column,
        row
    )
}

function getTotalImages(column, row) {
    return ((column + 1) * (row + 1)) - 1;
}

function getPaintingTitle(fullPageResponse) {
    let paintingFullTitle = getSubstringItem(fullPageResponse, Value.Title);
    let title = getSubstringItem(paintingFullTitle, Value.Hyphen);
    return title.trim().replaceAll(Value.EmptySpace, Value.EmptyString);
}

function getPaintingId(fullPageResponse) {
    let pictureTagContent = getSubstringItem(fullPageResponse, Value.Picture);
    let urlString = getPaintingSliceUrl(pictureTagContent);
    let sliceImagesUrl = new URL(encodeURI(urlString));
    return sliceImagesUrl.pathname.split(Value.Slash)[1];
}

function getPaintingSliceUrl(pictureTagContent) {
    return pictureTagContent
        .split(Value.Equals)[1]
        .split(Value.EmptySpace)[0]
        .replace(Value.DoubleQuotes, Value.EmptyString);
}

function getSubstringItem(stringToSearch, itemToSearch) {
    let searchedItem = stringToSearch.substring(
        stringToSearch.indexOf(itemToSearch) + 1,
        stringToSearch.lastIndexOf(itemToSearch)
    );
    return searchedItem
}

async function getVanGoghImage(paintingId, paintingTitle, totalColumn, totalRow) {
    var counter = 0;
    createDirectory(paintingTitle);
    for (let itemRow = 0; itemRow <= totalRow; itemRow++) {
        for (let itemColumn = 0; itemColumn <= totalColumn; itemColumn++) {
            const response = await requestItemImage(paintingId, itemColumn, itemRow);
            createImageFile(paintingTitle, paintingId, counter, response)
            counter = counter + 1
        }
    }
    createFinalImage(this.paintingTitle, this.totalImages, totalColumn);
}

async function requestItemImage(paintingId, itemColumn, itemRow) {
    const IMAGE_URL = `${Value.VanGoghUrl}/${paintingId}/0/${itemColumn}-${itemRow}.jpg`;
    const response = await axios.get(IMAGE_URL, {
        responseType: Value.ArrayBufferResponse
    });
    return response;
}

function createDirectory(paintingTitle) {
    const IMAGE_DIRECTORY = `./${paintingTitle}`;
    try {
        if (!fs.existsSync(IMAGE_DIRECTORY)) {
            fs.mkdirSync(IMAGE_DIRECTORY);
        }
    } catch (e) {
        console.error(`Error creating folder: ${paintingTitle}`);
    }
}

function createImageFile(paintingTitle, paintingId, counter, response) {
    const IMAGE_NAME = `./${paintingTitle}/${counter}.jpg`;
    fs.writeFile(IMAGE_NAME, response.data, (err) => {
        if (err) throw err;
        // console.log(`Image: ${paintingId}_${counter} downloaded succesfully`);
    });
}

function createFinalImage(paintingTitle, images, columns) {
    let totalCol = columns + 1
    exec(`bash counter.sh ${paintingTitle} ${images} ${totalCol}`, (err, out) => {
        if (err) {
            console.error("command not executed: ", err);
        }
        console.log(out);
    });
}

//getVanGoghImage("TZCqF", 5, 7)
getPaintingProperties("https://www.vangoghmuseum.nl/en/collection/d0420V1962", 6, 5)
//createFinalImage(3, 2);