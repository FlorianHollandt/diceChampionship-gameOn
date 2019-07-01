
# Dice Championship (GameOn integration)

This demo project uses <a href="https://developer.amazon.com/gameon">Amazon GameOn</a> (via their recently released <a href="https://skills-gameon-sdk.github.io">Skills GameOn SDK</a>) to implement a leaderboard for "Dice Championship", a <a href="https://github.com/FlorianHollandt/jovo-example-mysql">Jovo sample project</a> that uses a MySQL implementation instead.

Leaderboards are a neat way to create indirect interactions between user, and can potentially increase retention of a voice game. Look out for a post on my #VoiceGames blog to read about how GameOn comapres to other ways of managing leaderboards.

## Scope of this project

This voice app uses what I think of as the core features of GameOn: Submitting a user's score from one game iteration (a 'match', in terms of GameOn) into a global leaderboard (the 'tournament'), and then retrieving the user's tounrmanent rank from the leaderboard.

For Dice Championship, one match corresponds to throwing 10 six-sided dice and adding all their face values to a score. The leaderboard contains the luckiest dice throwers. If a player has multiples matches (i.e. plays repeatedly), only their highest score is used to determine their tournament rank.

If the player beats their personal highscore and optionally their previous rank (both saved as a session variable), they receive a positive sound effect and text response.

In order to allow you to populate the tournament quickly without inviting new users, this demo **treats each session as a new user**, which is obviously something you wouldn't do in a live game. In line 32 of `src/app.js` you can find out how to amend this, if needed.

## Setting up GameOn

1. This project uses the same basic functions as the <a href="https://skills-gameon-sdk.github.io">SDK documentation's</a> <a href="https://skills-gameon-sdk.github.io/#simple-week-long-tournament">Simple Week-Long Tournament</a>, so you can follow the instructions there for setting up GameOn and your first tournament.
2. Clone this repository, run `npm install --save` and make a copy of `.env.example` named `.env`. We'll use environment variables to save your GameOn credentials.
3. Enter the following credentials into the `.env` file:
```
GAMEON_PUBLIC_API_KEY <-- The public API key your received when you registered your new game at GameOn
GAMEON_TOURNAMENT_ID <-- The tournament ID that you received after setting up a new challenge for your registered game (found in the URL of the competition detail page)
GAMEON_MATCH_ID <-- The match ID, also found in the competition detail page
```
Each of these keys and IDs are `uuid`s, so they look similar to this: `01234567-0123-0123-0123-01234567abcd`.

## Executing this demo

If you're using the <a href="https://www.jovo.tech/docs/cli">Jovo CLI</a> (highly recommended!), add your ASK CLI profile as another environment variable and optionally a fresh Lambda ARN to `.env`, like this:
```
ASK_PROFILE='yourAskProfile'
LAMBDA_ARN='arn:aws:lambda:eu-west-1:012345678901:function:demo_gameon'
```
To build a new Alexa Skill with a your local webhook endpoint, do the following
```
jovo build -p alexaSkill --stage local --deploy
```
If you prepared a Lambda function (it doesn't need database privileges, this Skill runs entirely on session data!) like described above, you can use `lambda` as the stage instead of `local`.
