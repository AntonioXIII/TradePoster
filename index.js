// Third-part or core includes
let fs = require('fs');
let packageJSON = require('./package.json');
let { WebClient } = require('@slack/web-api');
const { config } = require('process');

// Internal includes
let PromptAndReturnSimpleStrategy = 
  require('./src/view/PromptAndReturnSimpleStrategy.js');
let PromptAndReturnNumberValidateStrategy = 
  require('./src/view/PromptAndReturnNumberValidateStrategy.js');
let PromptAndReturnFloatValidateStrategy = 
  require('./src/view/PromptAndReturnFloatValidateStrategy.js');
let PromptAndReturnDateValidateStrategy = 
  require('./src/view/PromptAndReturnDateValidateStrategy.js');

// Cached messages
const assetTypePrompt = 'What type of asset did you sell? Please input the number that\n' +
  'corresponds with your choice.\n' +
  '1) Stock\n' +
  '2) Option\n';
const dateSoldPrompt = 'What is the date that the trade was made?\n' +
  'Please input date in the following format: mm/dd/yyyy';
const initInvestPrompt = 'What was the initial investment amount?\n' +
  'Please enter a whole or decimal value number without $.';
const saleAmountPrompt = 'What was the value after selling all the assets?\n' +
  'Please enter a whole or decimal value number without $.';
const strikePricePrompt = 'What was the strike price? Please enter without the $ symbol.';
const optionTypePrompt = 'Was this a CALL or a PUT?\n' + 
  '1) CALL\n' + 
  '2) PUT';
const expDatePrompt = 'What was the expiration date?\n' +
  'Please input date in the following format: mm/dd/yyyy';

// Local vars
let appConfig = {};
let getDate = {};
let getFloat = {};
let getNum = {};
let getString = {};
let response = '';
let tradeInfo = {};
let slack = {};

// Load app config and welcome user if successful
try
{
  appConfig = JSON.parse(fs.readFileSync('./config/config.json', {encoding: 'utf8'}));
  slack = new WebClient(appConfig.slackToken);
}
catch(ex)
{
  console.log("Couldn't load app config, aborting.");
  console.log(ex);
  process.exit();
}

console.log(`Welcome to Trade Poster v${packageJSON.version}\n`);

// Get the type of asset sold
getNum = new PromptAndReturnNumberValidateStrategy(assetTypePrompt);
switch(getNum.prompt())
{
  case 1:
    tradeInfo.assetType = 'STOCK';
    break;
  case 2:
    tradeInfo.assetType = 'OPTION';
    break;
}
console.log(`\nGot it, you sold a ${tradeInfo.assetType}.\n`);

// Get non-instrument specific data
getString = new PromptAndReturnSimpleStrategy(`What is the symbol of the ${tradeInfo.assetType} traded?`);
tradeInfo.symbol = getString.prompt();
console.log(`${tradeInfo.symbol} recorded.\n`);

// Get the date that the asset/s was/were sold
getDate = new PromptAndReturnDateValidateStrategy(dateSoldPrompt);
tradeInfo.date = getDate.prompt();
console.log('Date recorded successfully.\n');

// Get initial investment amount
getFloat = new PromptAndReturnFloatValidateStrategy(initInvestPrompt);
tradeInfo.initInvestment = getFloat.prompt();
console.log(`Initial investment of ${tradeInfo.initInvestment} recorded.\n`);

// Get sale amount
getFloat = new PromptAndReturnFloatValidateStrategy(saleAmountPrompt);
tradeInfo.sold = getFloat.prompt();
console.log(`Sold value of ${tradeInfo.sold} recorded. \n`);

tradeInfo.soldDiffAmt = (tradeInfo.sold - tradeInfo.initInvestment).toFixed(2);

if(tradeInfo.soldDiffAmt >= 0)
{
  tradeInfo.soldDiffPct = ((tradeInfo.soldDiffAmt / tradeInfo.initInvestment) * 100).toFixed(0);
  console.log(`Congratulations! You made a profit of: \$${tradeInfo.soldDiffAmt} (${tradeInfo.soldDiffPct}%)\n`);
}
else
{
  tradeInfo.soldDiffPct = ((Math.abs(tradeInfo.soldDiffAmt) / tradeInfo.initInvestment) * 100).toFixed(0);
  console.log(`Uh oh! You had a loss of \$${Math.abs(tradeInfo.soldDiffAmt)} (${tradeInfo.soldDiffPct}%)\n`);
}

// Get instrument specific data
if(tradeInfo.assetType == 'OPTION')
{
  getFloat = new PromptAndReturnFloatValidateStrategy(strikePricePrompt);
  tradeInfo.strike = getFloat.prompt();
  console.log(`Strike price of ${tradeInfo.strike} recorded. \n`);

  getNum = new PromptAndReturnNumberValidateStrategy(optionTypePrompt);
  switch(getNum.prompt())
  {
    case 1:
      tradeInfo.optionType = 'CALL';
      break;
    default:
    case 2:
      tradeInfo.optionType = 'PUT';
      break;
  }
  console.log(`${tradeInfo.optionType} option selected.\n`);

  getDate = new PromptAndReturnDateValidateStrategy(expDatePrompt);
  tradeInfo.expDate = getDate.prompt();
  console.log(`Expiration date of ${tradeInfo.expDate} recorded.\n`);

}

// Post message to channel
if(tradeInfo.assetType == 'OPTION')
{
  let msg = '';

  if(tradeInfo.soldDiffAmt >= 0)
  {
    msg = `PROFITABLE option trade completed. Details:\n
    Symbol & Strike: ${tradeInfo.symbol} @ $${tradeInfo.strike}\n
    Expiration: ${tradeInfo.expDate.getMonth() + 1}/${tradeInfo.expDate.getDate()}/${tradeInfo.expDate.getFullYear()}\n
    Date: ${tradeInfo.date.getMonth() + 1}/${tradeInfo.date.getDate()}/${tradeInfo.date.getFullYear()}\n
    Cost: $${tradeInfo.initInvestment}\n
    Sold for: $${tradeInfo.sold}\n
    Profit: \$${tradeInfo.soldDiffAmt} (${tradeInfo.soldDiffPct}%)`;
  }
  else 
  {
    msg = `UNPROFITABLE option trade completed. Details:\n
    Symbol & Strike: ${tradeInfo.symbol} @ $${tradeInfo.strike}\n
    Expiration: ${tradeInfo.expDate.getMonth() + 1}/${tradeInfo.expDate.getDate()}/${tradeInfo.expDate.getFullYear()}\n
    Date: ${tradeInfo.date.getMonth() + 1}/${tradeInfo.date.getDate()}/${tradeInfo.date.getFullYear()}\n
    Cost: $${tradeInfo.initInvestment}\n
    Sold for: $${tradeInfo.sold}\n
    Loss: $${Math.abs(tradeInfo.soldDiffAmt)} (${tradeInfo.soldDiffPct}%)`;
  }

  (async () => {

    //const result = await slack.conversations.list();
    const result = await slack.chat.postMessage({
      text: msg,
      channel: appConfig.slackChannel
    });
  
    // The result contains an identifier for the message, `ts`.
    if(result.ok)
    {
      console.log(`The following message was posted to Slack:\n ${msg}`);
    }
  })();
}
