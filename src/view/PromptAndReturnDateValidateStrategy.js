let IPromtAndReturnResponse = require('./IPromptAndReturnResponse.js');
let scanner = require('prompt-sync')({sigint: true});

let PromptAndReturnDateValidateStrategy = class extends IPromtAndReturnResponse
{
  constructor(message)
  {
    super();
    this.message = message;
  }

  prompt()
  {
    let response = '';

    while(true)
    {
      console.log(this.message);
      response = scanner();
  
      // Date.parse returns NaN if the input cannot be parsed as a date
      if(Number.isNaN(Date.parse(response)))
      {
        console.log('The choice you entered was not a date.');
        console.log('Press enter to try again.');
        scanner();
      }
      else
      {
        break;
      }
    }

    return response;
  }
}

module.exports = PromptAndReturnDateValidateStrategy;
