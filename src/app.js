'use strict';

const gameOn = require('./gameOn');
const config = require('./config');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({

    async ON_REQUEST() {
        let player;
        if (this.isNewSession()) { // In real life, you'd use this.isNewUser() instead
            player = await gameOn.initializeNewPlayer(this);
        } else {
            player = this.getSessionAttribute(
                'gameOnPlayer'
            );
            player = await gameOn.refreshPlayerSession(player);
        }

        this.setSessionAttribute(
            'gameOnPlayer',
            player
        );
    },

    async LAUNCH() {
        this.setSessionAttribute('previousHighscore', 0);
        this.setSessionAttribute('previousRank', 999999999);

        this.$speech
            .addText('Welcome to dice rolling championship!')
            .addText('Let\'s see how high you can score by rolling ten dice.');

        return this.toIntent('_rollDice');
    },

    async END() {
        this.$speech.addText('Thanks for playing. Bye!');

        return this.tell(
            this.$speech
        );
    },

    async YesIntent() {
        this.$speech.addText('Awesome!');

        return this.toIntent('_rollDice');
    },

    async _rollDice() {
        this.$speech
            .addText('Here we go!')
            .addText('<audio src="soundbank://soundlibrary/toys_games/board_games/board_games_08"/>');
        
        let sumOfDice = 0;
        for (let i = 0; i <  config.custom.game.numberOfDice; i++ ){
            sumOfDice += getDiceRollResult();
        }
        this.$data.sumOfDice = sumOfDice;

        return this.toIntent('_compareResult');
    },

    async _compareResult() {
        const player = this.getSessionAttribute('gameOnPlayer');
        const sumOfDice = this.$data.sumOfDice;

        const previousHighscore = this.getSessionAttribute('previousHighscore');
        const previousRank = this.getSessionAttribute('previousRank');

        let soundEffect = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_negative_01'/>";
        let speechText = `Looks like you remain the <say-as interpret-as="ordinal">${previousRank}</say-as> place for now.`

        await gameOn.submitScore(player, sumOfDice);
        const rankingData = await gameOn.getRankingData(player);

        if (sumOfDice > previousHighscore) {
            this.setSessionAttribute('previousHighscore', sumOfDice);
            soundEffect = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_positive_01'/>";
            speechText = "Congrats, that's a new personal highscore!";
        }
        if (rankingData.rank < previousRank) {
            this.setSessionAttribute('previousRank', rankingData.rank);
            soundEffect = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_positive_01'/>";
            speechText = `Congrats, this new personal highscore earns you the <say-as interpret-as="ordinal">${rankingData.rank}</say-as> place in the leaderbaord!`;
        }
        if (rankingData.rank === 1) {
            speechText = "Congrats, that's the best score so far!";
        }

        this.$speech
            .addText(`Your score is `)
            .addText(soundEffect)
            .addText(` ${sumOfDice} points! `)
            .addText(speechText);

        return this.toIntent('_prompt');
    },

    async _prompt() {
        const prompt = 'Do you want to try again?';

        return this.ask(
            this.$speech.addText(prompt),
            this.$reprompt.addText(prompt)
        );
    }
});

module.exports.app = app;

function getDiceRollResult() {
    return Math.ceil(
        Math.random() *  config.custom.game.sidesPerDice
    )
}