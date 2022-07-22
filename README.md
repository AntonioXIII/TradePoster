# Trade Poster

Gathers trade info from user and posts to a Google Sheet and Slack channel.

## Installation & Usage

Download the code from the release, and extract to your desired folder. Create a `config` folder on the same level as `src`, and a `config.json` inside of that (expected format specified below). You will need node installed to install dependencies prior to running. **Windows is only supported at this time.** After performing those steps, simply run `node index` on the command line and follow the prompts to use the program.

### Config File Structure

The following data is required to run the program, preceded with the key name required for this data:
- (slackToken) A token from a Slack app you'll need to generate.
- (slackChannel) A channel ID from Slack.
- (sheetsKey) A service key ID from Google with Sheets API access. The user attached to the service key needs to have the Google Sheet you intend to use shared with them.
- (sheetID) The ID of the sheet you wish to use.

### Assumed Google Sheet Structure

Your Google Sheet is assumed to have the following tab structure:
- Q4
- Q3
- Q2
- Q1
- Summary

The only area that is posted in at this point are the quarter tabs. Summary is managed by the owner manually, for now. The program assumes the following column structure when posting data:

- Date (of the trade)
- Stock/Option
- Initial (investment amount)
- Sold (amount)
- Profit/Loss
- Quarterly Profit
