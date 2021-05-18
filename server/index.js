const needle = require('needle');
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

const rules = [{ value: '(NIFTY OR BANKNIFTY) lang:en -is:retweet -is:reply' }];

//GET Stream Rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });
    console.log(response.body);
    return response.body;
};


//Set Stream Rules
async function setRules() {
    const data = {
        add: rules
    };
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    return response.body;
};

//Delete Stream Rules
async function deleteRules(rules) {
    if (!Array.isArray(rules.data)) {
        return null;
    };
    const ids = rules.data.map((rule) => rule.id);

    const data = {
        delete: {
            ids: ids,
        }
    };
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    return response.body;
};

function streamTweets() {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data);
            console.log(json);
        } catch (error) { };
    });
};

//the semicolon before the iffy is a defensive semicolon; read more about it in revision.
//as a general rule, start using ; at all places. It will be a good practice that will reduce errors, imporve readability.
; (async () => {
    let currentRules;
    try {
        //GET all rules
        currentRules = await getRules();
        //then DELETE all rules
        await deleteRules(currentRules);
        //set new rules
        await setRules();

    } catch (error) {
        console.error(error);
        process.exit(1);
    };

    streamTweets();
})();