const fs = require("fs");
const axios = require("axios");

const EMPTY_SPACE = ' ';
const EMPTY_STRING = '';
const EQUALS = '=';
const DOUBLE_QUOTES = '"';
const SLASH = '/';
const VAN_GOGH_URL = 'https://micrio-cdn.vangoghmuseum.nl';
var paintingTitle = '';
var paintingId = '';

async function getPaintingProperties(url, column, row) {
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
    ).trim();
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
}

async function getVanGoghImage(selectedImage, totalColumn, totalRow) {
    var counter = 0;
    for (let itemRow = 0; itemRow <= totalRow; itemRow++) {
        for (let itemColumn = 0; itemColumn <= totalColumn; itemColumn++) {
            const IMAGE_URL = `${VAN_GOGH_URL}/${selectedImage}/0/${itemColumn}-${itemRow}.jpg`;
            const response = await axios.get(IMAGE_URL, {
                responseType: 'arraybuffer'
            });
            createDirectory(selectedImage);
            createImageFile(selectedImage, counter, response)
            counter = counter + 1
        }
    }
}

function createDirectory(selectedImage) {
    const IMAGE_DIRECTORY = `./${selectedImage}`;
    try {
        if (!fs.existsSync(IMAGE_DIRECTORY)) {
            fs.mkdirSync(IMAGE_DIRECTORY);
        }
    } catch (e) {
        console.log(`Error creating folder: ${selectedImage}`);
    }
}

function createImageFile(selectedImage, counter, response) {
    const IMAGE_NAME = `./${selectedImage}/${counter}.jpg`;
    fs.writeFile(IMAGE_NAME, response.data, (err) => {
        if (err) throw err;
        console.log(`Image: ${selectedImage}_${counter} downloaded succesfully`);
    });
}

//getVanGoghImage("TZCqF", 5, 7)
getPaintingProperties("https://www.vangoghmuseum.nl/en/collection/s0031V1962", 5, 7)