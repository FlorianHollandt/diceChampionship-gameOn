// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

require('dotenv').config();

module.exports = {
	alexaSkill: {
		nlu: {
			name: 'alexa',
		},
		manifest: {
			publishingInformation: {
			   locales: {
				  'en-US': {
					 name: 'Dice Championship',
					 summary: "Demo Skill for a simple GameOn leaderboard",
					 description: "Demo Skill for a simple GameOn leaderboard",
					 examplePhrases: [
						 "Alexa open dice championship"
					 ],
					 smallIconUri: "https://exampleresources.s3-eu-west-1.amazonaws.com/skillIcon_diceChallenge_small.png",
					 largeIconUri: "https://exampleresources.s3-eu-west-1.amazonaws.com/skillIcon_diceChallenge_large.png",
				  }
			   },
			},
		 },
		 askProfile: process.env.ASK_PROFILE
   },
   googleAction: {
      nlu:  'dialogflow',
  },
  defaultStage: 'local',
  stages: {
    local: {
      endpoint: '${JOVO_WEBHOOK_URL}',
    },
    lambda: {
      endpoint: process.env.LAMBDA_ARN,
    },
  },
 };