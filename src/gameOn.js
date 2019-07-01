
const _get = require('lodash.get');

const gameOn = require("@alexa-games/skills-gameon-sdk");
const gameOnClient = new gameOn.SkillsGameOnApiClient();

const config = require('./config');

module.exports = {

    initializeNewPlayer: async function() {
        console.time('gameOnClient.initializeNewPlayer() ');
        const player = await gameOnClient.initializeNewPlayer(
            {
                gameApiKey:  config.custom.gameOn.publicApiKey,
                appBuildType:  config.custom.gameOn.environment,
            }
        );
        console.timeEnd('gameOnClient.initializeNewPlayer() ');
        console.log(`Player object: ${JSON.stringify(player, null, 4)}`);

        // Player can enter tournament right after initialization
        console.time('gameOnClient.enterTournamentForPlayer() ');
        await gameOnClient.enterTournamentForPlayer(
            {
                tournamentId:  config.custom.gameOn.tournamentId,
                player: player
            }
        );
        console.timeEnd('gameOnClient.enterTournamentForPlayer() ');

        return player;
    },

    refreshPlayerSession: async function(player) {
        console.time('gameOnClient.refreshPlayerSession() ');
        refreshedPlayer = await gameOnClient.refreshPlayerSession(
            {
                gameApiKey:  config.custom.gameOn.publicApiKey,
                appBuildType:  config.custom.gameOn.environment,
                player: player,
            }
        );
        console.timeEnd('gameOnClient.refreshPlayerSession() ');

        return refreshedPlayer;
    },

    submitScore: async function(player, score) {
        // Entering a match is required to (re-)enter a score
        console.time('gameOnClient.enterMatchForPlayer() ');
        await gameOnClient.enterMatchForPlayer(
            {
                matchId:  config.custom.gameOn.matchId,
                player: player
            }
        );
        console.timeEnd('gameOnClient.enterMatchForPlayer() ');

        console.time('gameOnClient.submitScoreForPlayer() ');
        await gameOnClient.submitScoreForPlayer(
            {
                matchId:  config.custom.gameOn.matchId,
                submitScoreRequest: { 
                    score: score,
                },
                player: player
            }
        );
        console.timeEnd('gameOnClient.submitScoreForPlayer() ');

        return;
    },

    getRankingData: async function(player) {
        console.time('gameOnClient.getRankingData() ');
        const rank = await gameOnClient.getMatchLeaderboardForPlayer(
            {
                matchId:  config.custom.gameOn.matchId,
                player: player,
                currentPlayerNeighbors: 1,
            }
        );
        console.timeEnd('gameOnClient.getRankingData() ');

        return rank.currentPlayer;
    },
};

