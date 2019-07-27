
<img src="https://dicechampionship.s3-eu-west-1.amazonaws.com/diceChampionship_title_gameOn.png">

The Dice Championship project is about exploring how a simple voice app - Dice Championship - can be implemented and extended using different frameworks, platforms and services. It was initiated (and <a href="https://www.amazon.com/dp/B07V41F2LK">published to the Alexa Skill store</a>) by me (<a href="https://twitter.com/FlorianHollandt">Florian Hollandt</a>), but contributions of ideas, implementations and improvements are very welcome. :)

## What is this repository about?
This version of Dice Championship implements its leaderboard with <a href="https://developer.amazon.com/gameon">Amazon GameOn</a> (via the recently released <a href="https://skills-gameon-sdk.github.io">Skills GameOn SDK</a>).

GameOn offers a wide array of leaderboard-related features, of which this version of 'Dice Championship' uses only the following ones:
- Initializing a player
- Registering the player for a 'tournament' (i.e. the global game leaderboard)
- Registering the player for 'matches' (i.e. iteration of the game loop / dice throws)
- Submitting the player's 'score' (the sum of their dice faces) for the respective match
- Retrieve the ranking data for the player within the tournament, of which Dice Championship utilizes the `rank` property

Here's how the logic of this implementation differs from the <a href="https://github.com/FlorianHollandt/diceChampionship-dynamoDb">base version</a>, which implements the leaderboard with a DynamoDB table:

<table>
    <tr>
        <td>
            &nbsp;
        </td>
        <th>
            <a href="https://github.com/FlorianHollandt/diceChampionship-dynamoDb">Base version</a>
        </th>
        <th>
            GameOn version
        </th>
    </tr>
    <tr>
        <th>
            Player metadata
        </th>
        <td>
            Custom implementation (generating a player ID)
        </td>
        <td>
            Provided by GameOn (<code>initializeNewPlayer()</code>)
        </td>
    </tr>
    <tr>
        <th>
            Evaluate only the player's highest score
        </th>
        <td>
            Custom implementation (Store and compare values)
        </td>
        <td>
            Provided by GameOn
        </td>
    </tr>
    <tr>
        <th>
            Determining the player's rank
        </th>
        <td>
            Custom implementation (DynamoDB <code>scan</code> operation)
        </td>
        <td>
            Provided by GameOn (<code>getMatchLeaderboardForPlayer()</code>)
        </td>
    </tr>
    <tr>
        <th>
            Development environment for leaderboard
        </th>
        <td>
            Possible with separate DynamoDB tables
        </td>
        <td>
            Built-in environment parameter
        </td>
    </tr>
</table>

# Setting up the GameOn version

1. **Setting up the project folder**
   - Clone this repository, run `npm install --save` and make a copy of `.env.example` named `.env`. We'll use environment variables to set up all the required credentials.<br/>
2. **Setting up GameOn**
   - This project uses the same basic functions as the <a href="https://skills-gameon-sdk.github.io">SDK documentation's</a> <a href="https://skills-gameon-sdk.github.io/#simple-week-long-tournament">Simple Week-Long Tournament</a>, so you can **follow the instructions** there for setting up GameOn and your first tournament.
   - Set the **end date of the tournament** to some point in the distant future to have just one single big open-ended tournament
   - Copy and paste the following **credentials** into your `.env` file:
     - `GAMEON_PUBLIC_API_KEY`: The public API key your received when you registered your new game at GameOn
     - `GAMEON_TOURNAMENT_ID`: The tournament ID that you received after setting up a new challenge for your registered game (found in the URL of the competition detail page)
     - `GAMEON_MATCH_ID`: The match ID, also found in the competition detail page
     - Each of these keys and IDs are `uuid`s, so they look similar to this: `01234567-0123-0123-0123-01234567abcd`.
3. **Creating your Lambda function**
   - Setting up a Lambda function isn't required to try out this project (you can just test locally), but it's recommended because it's interesting to see how it behaves in terms of latency, and to have a version that works any time without being restricted to when you're running your Jovo webhook
   - Open the <a href="https://console.aws.amazon.com/lambda/home?#/functions">AWS Lambda functions overview</a> in your selected region and hit **Create function**.
   -  Give your Lambda a Node 8.10 runtime (or above) and a **basic execution role** with write access to Cloudwatch logs.
   -  Add **'Alexa Skills Kit' as a trigger** for your Lambda function. For now you can disable the restriction to a defined Skill ID.
   -  Copy the **environment variable** from step 2 to the Lambda's environment variable section.
   -  Copy the **Lambda's ARN** into your local `.env` file, as the value of `LAMBDA_ARN_STAGING` (more on staging below).
5. **Creating the Alexa Skill**
   - This is something you could do directly in the Alexa developer console, but here we're using the <a href="https://github.com/jovotech/jovo-cli">Jovo CLI</a> because it's super convenient. So be sure to have the Jovo CLI installed and optimally your <a href="https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html">ASK CLI and AWS CLI profiles set up</a>.
   - Write the name of the ASK CLI profile you plan to use into your local `.env` file as e.g. `ASK_PROFILE='default'`.
   - Now execute `jovo build -p alexaSkill --stage local --deploy` from your command line. This builds the Skill manifest (`platforms/alexaSkill/skill.json`) and language model (`platforms/alexaSkill/models/en-US.json`) from the information in the project configuration file (`project.js`) and the Jovo language model (`models/en-US.json`), and uses them to set up a new Skill 'Dice Tournament' in your Alexa developer console.<br/>
    The result should look like this:<br/>
    <img src="https://dicechampionship.s3-eu-west-1.amazonaws.com/diceChampionship_buildLocal.png" width="65%"><br/>
    - Now copy the Skill ID from the console output and paste it as the value of the `SKILL_ID_STAGING` variable in your `.env` file.
    - Execute `jovo run --watch` from your command line to **activate your local endpoint**


## Congrats, you've already set up the Skill on your machine
You can already test your Skill in the Alexa developer console, or on your device by saying "Alexa, open Dice Tournament"!

The remaining steps are optional, but recommended. Before we proceed to uploading the Skill to Lambda, let's review the staging setup.

6. **Reviewing the staging setup**
   - This project comes  with a setup for **three stages**, to propagate good practices and let you try out things both locally and on Lambda, because it might behave differently (e.g. in terms of latency)
    <table>
        <tr>
            <th>
                Name
            </th>
            <th>
                Description
            </th>
            <th>
                Environment <br/>
                + Endpoint
            </th>
            <th>
                GameOn environment
            </th>
            <th>
                Skill ID
            </th>
            <th>
                Invocation name
            </th>
            <th>
                Skill icon
            </th>
        </tr>
        <tr>
            <td>
                local
            </td>
            <td>
                Local endpoint for rapid development + debugging
            </td>
            <td>
                <code>${JOVO_WEBHOOK_URL}</code>
            </td>
            <td>
                <code>development</code>
            </td>
            <td>
                <code>SKILL_ID_STAGING</code>
            </td>
            <td>
                dice tournament
            </td>
            <td>
                <img src="https://exampleresources.s3-eu-west-1.amazonaws.com/skillIcon_diceChampionship_stage_small.png">
            </td>
        </tr>
        <tr>
            <td>
                staging
            </td>
            <td>
                Lambda endpoint for testing on a production-like environment
            </td>
            <td>
                <code>LAMBDA_ARN_STAGING</code>
            </td>
            <td>
                <code>development</code>
            </td>
            <td>
                <code>SKILL_ID_STAGING</code>
            </td>
            <td>
                dice tournament
            </td>
            <td>
                <img src="https://exampleresources.s3-eu-west-1.amazonaws.com/skillIcon_diceChampionship_stage_small.png">
            </td>
        </tr>
        <tr>
            <td>
                live
            </td>
            <td>
                Lambda endpoint for fulfillment of the live Skill
            </td>
            <td>
                <code>LAMBDA_ARN_LIVE</code>
            </td>
            <td>
                <code>production</code>
            </td>
            <td>
                <code>SKILL_ID_LIVE</code>
            </td>
            <td>
                dice championship
            </td>
            <td>
                <img src="https://exampleresources.s3-eu-west-1.amazonaws.com/skillIcon_diceChallenge_small.png">
            </td>
        </tr>
    </table>
7. **Uploading your Skill code to Lambda**
   - After having reviewed the staging setup, it's clear that uploading your Skill to Lambda is as easy as building and deploying the **staging stage** of your project.
   - To be able to upload your code to Lambda with the Jovo CLI, make sure your AWS CLI profile is linked to your ASK CLI profile, and has Lambda upload privileges
   - Now all you need to do it execute `jovo build -p alexaSkill --stage staging --deploy`
   - The result should look like this: <br/>
    <img src="https://dicechampionship.s3-eu-west-1.amazonaws.com/diceChampionship_buildStaging_gameOn.png" width="90%"><br/>
   - Again, you can now test your Skill in the Alexa developer console just like after step 5, in the same Skill
8. **Preparing and deploying the live stage**
   - I'll cover this part more briefly than the ones before, because it's more about deployment than about getting this Skill to work
   - First, you need a **new Lambda function** - Just set one up like in **step 4** (with the same role, trigger and environment variables), and copy its ARN as the value of `LAMBDA_ARN_LIVE` in your `.env` file
   - To use production settings for your GameOn tournament, all you need is to 
   - To set up the **new Skill** (using the new Lambda endoint, the invocation name 'dice championship', and an expanded version of the manifest including a different Skill icon), execute `jovo build -p alexaSkill --stage live --deploy`. 
   - After the first deployment, copy the new Skill's ID and paste it as the value of `SKILL_ID_LIVE` in your `.env` file

# Wrapping it up
I hope you find both this entire project and the individual variants interesting and valuable. Again, if you like this project and want to see it implementing your favorite platform, service or feature, please get in touch or start implementing right away.
