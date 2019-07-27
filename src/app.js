'use strict';

const gameOn = require('./gameOn');
const config = require('./config');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { JovoDebugger } = require('jovo-plugin-debugger');

const app = new App();

app.use(
    new Alexa(),
    new JovoDebugger()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({

    async NEW_SESSION() {
        console.log(`NEW_SESSION()`);

        let player = await gameOn.initializeNewPlayer(this);
        this.setSessionAttribute(
            'player',
            player
        );

        this.setSessionAttribute('previousHighscore', 0);
        this.setSessionAttribute('previousRank', 999999999);

        this.$speech.t('welcome-new');

        return this.toIntent('_rollDice');
    },

    async YesIntent() {
        console.log(`YesIntent()`);

        this.$speech.t('confirm');

        return this.toIntent('_rollDice');
    },

    async _rollDice() {
        console.log(`_rollDice()`);

        this.$speech
            .t('dice-intro')
            .t('dice-sound');
        
        let sumOfDice = 0;
        for (let i = 0; i <  config.custom.game.numberOfDice; i++ ){
            sumOfDice += getDiceRollResult();
        }
        this.$data.sumOfDice = sumOfDice;

        return this.toIntent('_compareResult');
    },

    async _compareResult() {
        const player = this.getSessionAttribute('player');
        const sumOfDice = this.$data.sumOfDice;

        const previousHighscore = this.getSessionAttribute('previousHighscore');
        const previousRank = this.getSessionAttribute('previousRank');

        let soundKey = 'result-sound-negative';
        let speechKey = 'result-lowerScore';

        await gameOn.submitScore(player, sumOfDice);
        const rankingData = await gameOn.getRankingData(player);
        console.log(`Ranking data: ${JSON.stringify(rankingData, null, 4)}`);

        if (sumOfDice > previousHighscore) {
            this.setSessionAttribute('previousHighscore', sumOfDice);
            soundKey = 'result-sound-positive';
            speechKey = 'result-newPersonalHighscore';
        }
        if (rankingData.rank < previousRank) {
            this.setSessionAttribute('previousRank', rankingData.rank);
            soundKey = 'result-sound-positive';
            speechKey = 'result-higherRank';
        }
        if (
            rankingData.rank === 1
            && previousRank !== 1
        ) {
            speechKey = 'result-numberOneRank';
        }

        this.$speech
            .t(
                'result-score',
                {
                    sound: this.speechBuilder().t(soundKey).toString(),
                    score: sumOfDice,
                }
            )
            .t(
                speechKey,
                {
                    rank: rankingData.rank,
                }
            );

        return this.toIntent('_prompt');
    },

    async _prompt() {
        console.log(`_prompt()`);

        return this.ask(
            this.$speech.t('prompt-short'),
            this.$reprompt.t('prompt-short')
        );
    },

    async END() {
        console.log(`END()`);
        this.$speech.t('goodbye');

        return this.tell(
            this.$speech
        );
    },
});

module.exports.app = app;

function getDiceRollResult() {
    return Math.ceil(
        Math.random() *  config.custom.game.sidesPerDice
    )
}