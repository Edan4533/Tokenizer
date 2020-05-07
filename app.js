var express = require('express');
var axios = require('axios');
const KING_JAMES_BIBLE_URL = 'http://www.gutenberg.org/cache/epub/10/pg10.txt';
var app = express();
var port = process.env.PORT || 3000;

// Main API for tokenize king james bible
app.get('/tokenizeKingJamesBible', async (req, res) => {
    const text = await getTextFromLink(KING_JAMES_BIBLE_URL);
    const tokenizedResult = parseText(text);
    res.send(tokenizedResult);
});

// Seconde API that tokenize url that is txt file. 
app.get('/tokenizeByUrl/', async (req, res) => {
    try {
        const { url } = req.query;
        const isTxtFile = url.search('.txt');
        if (isTxtFile <  0) {
            throw console.error('Url provided is not text file');
        }
        const text = await getTextFromLink(url);
        const tokenizedResult = parseText(text);
         res.send(tokenizedResult);
    } catch (err) {
        console.log("error occurred ");
    }
});

const getTextFromLink = async (url) => {
    const response = await axios.get(url).
    then(res => res)
   .catch(error =>  {throw console.error('Url Provided is unvalid')} );
    return response.data;
};

const parseText = (text) => {
    const wordsMap = new Map();
    const results = [];

    const words = text.toString().replace(/[\d]+[\W]+/gi, "")
        .replace(/[,.:#;?$%*[]/gi, '')
        .split(/\s+/).forEach((word) => {
            // handle hyphenated phrases case (when adding this rule  to regax statement its canceling other ruels)
            const hasShortLine = word.search(/-/);
            if (hasShortLine > 0) {
                const result = word.split(/-/);
                result.forEach(subWord => {
                    wordsMap.set(subWord.toLowerCase(), (wordsMap.get(subWord.toLowerCase()) + 1) || 1);
                })
                return;
            }
            if (word !== "") {
                wordsMap.set(word.toLowerCase(), (wordsMap.get(word.toLowerCase()) + 1) || 1);
            }
            
            return;
        });

    for (let [key, value] of wordsMap) {
        results.push({
            'word' : key,
            'repetitions' : value
        })
    }
    return results;
};

app.listen(port);