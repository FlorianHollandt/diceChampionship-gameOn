// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

require('dotenv').config();

module.exports = {
    logging: {
        request: true,
        requestObjects: [
          'request'
        ],
        response: true,
        responseObjects: [
          'response.outputSpeech.ssml'
        ],
    },
    intentMap: {
        'AMAZON.StopIntent': 'END',
        'AMAZON.CancelIntent': 'END',
        'AMAZON.NoIntent': 'END',
        'AMAZON.YesIntent': 'YesIntent',
        'AMAZON.HelpIntent': 'YesIntent',
    },
    custom: {
        gameOn: {
            publicApiKey: process.env.GAMEON_PUBLIC_API_KEY,
            tournamentId: process.env.GAMEON_TOURNAMENT_ID,
            matchId: process.env.GAMEON_MATCH_ID,
            environment: process.env.GAMEON_ENVIRONMENT,
        },
        game: {
            numberOfDice: 10,
            sidesPerDice: 6,
        },
        version: process.env.VERSION
    },
 };
 