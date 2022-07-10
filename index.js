// Includes
let fs = require('fs');
let packageJSON = require('./package.json');
let prompt = require('prompt-sync')({sigint: true});
let { WebClient } = require('@slack/web-api');
const { config } = require('process');

// Local vars
let appConfig = {};
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

console.log(`Welcome to Trade Poster v${packageJSON.version}`);

// Get the type of asset sold
while(true)
{
  console.log('What type of asset did you sell? Please input the number that');
  console.log('corresponds with your choice.');
  console.log('1) Stock');
  console.log('2) Option');
  response = prompt();

  if(Number.isNaN(parseInt(response)))
  {
    console.log('The choice you entered was not a number.');
    console.log('Press enter to try again.');
    prompt();
  }
  else
  {
    switch(parseInt(response))
    {
      case 1:
        tradeInfo.assetType = 'STOCK';
        break;
      case 2:
        tradeInfo.assetType = 'OPTION';
        break;
    }

    console.log(`\nGot it, you sold a ${tradeInfo.assetType}.\n`);
    break;
  }
}

// Get non-instrument specific data
console.log(`What is the symbol of the ${tradeInfo.assetType} traded?`);
tradeInfo.symbol = prompt();
console.log(`${tradeInfo.symbol} recorded.`);
console.log('\n');

while(true)
{
  console.log('What is the date that the trade was made?');
  console.log('Please input date in the following format: mm/dd/yyyy');
  response = prompt();
  
  if(Number.isNaN(Date.parse(response)))
  {
    console.log('The input did not match the date format given.');
    console.log('Please press enter to try again.');
    prompt();    
  }
  else
  {
    tradeInfo.date = new Date(Date.parse(response));
    console.log('Date recorded successfully.');
    break;    
  }
  console.log('\n');
}

while(true)
{
  console.log('What was the initial investment amount?');
  console.log('Please enter a whole or decimal value number without $.');
  response = prompt();

  if(Number.isNaN(parseFloat(response)))
  {
    console.log('The value entered was not a number.');
    console.log('Please press enter to try again.');
    prompt();
  }
  else 
  {
    tradeInfo.initInvestment = parseFloat(response).toFixed(2);
    console.log(`Initial investment of ${tradeInfo.initInvestment} recorded`);
    break;
  }
}

while(true)
{
  console.log('What was the value after selling all the assets?');
  console.log('Please enter a whole or decimal value number without $.');
  response = prompt();

  if(Number.isNaN(parseFloat(response)))
  {
    console.log('The value entered was not a number.');
    console.log('Please press enter to try again.');
    prompt();
  }
  else 
  {
    tradeInfo.sold = parseFloat(response).toFixed(2);
    console.log(`Sold value of ${tradeInfo.sold} recorded`);
    break;
  }
}

tradeInfo.soldDiffAmt = (tradeInfo.sold - tradeInfo.initInvestment).toFixed(2);

if(tradeInfo.soldDiffAmt >= 0)
{
  tradeInfo.soldDiffPct = ((tradeInfo.soldDiffAmt / tradeInfo.initInvestment) * 100).toFixed(0);
  console.log(`Congratulations! You made a profit of: \$${tradeInfo.soldDiffAmt} (${tradeInfo.soldDiffPct}%)`);
}
else
{
  tradeInfo.soldDiffPct = ((Math.abs(tradeInfo.soldDiffAmt) / tradeInfo.initInvestment) * 100).toFixed(0);
  console.log(`Uh oh! You had a loss of \$${Math.abs(tradeInfo.soldDiffAmt)} (${tradeInfo.soldDiffPct}%)`);
}

// Get instrument specific data
if(tradeInfo.assetType == 'OPTION')
{
  while(true)
  {
    console.log('What was the strike price? Please enter without the $ symbol.');
    response = prompt();

    if(Number.isNaN(parseFloat(response)))
    {
      console.log('The value entered was not a number.');
      console.log('Please press enter to try again.');
      prompt();
    }
    else 
    {
      tradeInfo.strike = parseFloat(response).toFixed(2);
      console.log(`Strike price of ${tradeInfo.strike} recorded`);
      break;
    }
  }

  while(true)
  {
    console.log('Was this a CALL or PUT?');
    console.log('1) CALL');
    console.log('2) PUT');
    response = prompt();

    if(Number.isNaN(parseInt(response)))
    {
      console.log('The choice you entered was not a number.');
      console.log('Press enter to try again.');
      prompt();
    }
    else 
    {
      switch(parseInt(response))
      {
        case 1:
          tradeInfo.optionType = 'CALL';
          break;
        default:
        case 2:
          tradeInfo.optionType = 'PUT';
          break;
      }
      console.log(`${tradeInfo.optionType} option selected.`);
      break;
    }
  }

  while(true)
  {
    console.log('What was the expiration date?');
    console.log('Please enter the date in this format: mm/dd/yyyy');
    response = prompt();

    if(Number.isNaN(Date.parse(response)))
    {
      console.log('The input did not match the date format given.');
      console.log('Please press enter to try again.');
      prompt();  
    }
    else
    {
      tradeInfo.expDate = new Date(Date.parse(response));
      console.log(`Expiration date of ${tradeInfo.expDate} recorded.`);
      break;
    }
  }
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
    Symbol & Strike: ${tradeInfo.symbol} @ ${tradeInfo.strike}\n
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

