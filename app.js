const fs = require("fs");
const axios = require("axios");
const { exec } = require("node:child_process");

const EMPTY_SPACE = ' ';
const EMPTY_STRING = '';
const EQUALS = '=';
const DOUBLE_QUOTES = '"';
const SLASH = '/';
const VAN_GOGH_URL = 'https://micrio-cdn.vangoghmuseum.nl';
var paintingTitle = '';
var paintingId = '';
var totalImages = 0;

async function getPaintingProperties(url, column, row) {
    this.totalImages = getTotalImages(column, row);
    const response = await axios.get(url, {
        responseType: 'text/html'
    });
    let fullPageResponse = response.data;
    let paintingFullTitle = fullPageResponse.substring(
        fullPageResponse.indexOf('<title>') + 1,
        fullPageResponse.lastIndexOf('</title>')
    );
    this.paintingTitle = paintingFullTitle.substring(
        paintingFullTitle.indexOf('-') +1,
        paintingFullTitle.lastIndexOf('-')
    ).trim().replaceAll(" ", EMPTY_STRING);
    let pictureTagContent = fullPageResponse.substring(
        fullPageResponse.indexOf('<picture>') + 1,
        fullPageResponse.lastIndexOf('</picture>')
    )
    let micrioUlr = new URL(
        encodeURI(
            pictureTagContent
                .split(EQUALS)[1]
                .split(EMPTY_SPACE)[0]
                .replace(DOUBLE_QUOTES, EMPTY_STRING)
        )
    );
    this.paintingId = micrioUlr.pathname.split(SLASH)[1];
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

async function getVanGoghImage(paintingId, paintingTitle, totalColumn, totalRow) {
    var counter = 0;
    createDirectory(paintingTitle);
    for (let itemRow = 0; itemRow <= totalRow; itemRow++) {
        for (let itemColumn = 0; itemColumn <= totalColumn; itemColumn++) {
            const IMAGE_URL = `${VAN_GOGH_URL}/${paintingId}/0/${itemColumn}-${itemRow}.jpg`;
            const response = await axios.get(IMAGE_URL, {
                responseType: 'arraybuffer'
            });
            createImageFile(paintingTitle, paintingId, counter, response)
            counter = counter + 1
        }
    }
    createFinalImage(this.paintingTitle, this.totalImages, totalColumn);
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