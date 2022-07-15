let IPromtAndReturnResponse = require('./IPromptAndReturnResponse.js');
let scanner = require('prompt-sync')({sigint: true});

let PromptAndReturnNumberValidateStrategy = class extends IPromtAndReturnResponse
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
  
      if(Number.isNaN(parseInt(response)))
      {
        console.log('The choice you entered was not a number.');
        console.log('Press enter to try again.');
        scanner();
      }
      else
      {
        break;
      }
    }

    return parseInt(response);
  }
}

module.exports = PromptAndReturnNumberValidateStrategy;
