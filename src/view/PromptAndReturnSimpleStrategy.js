let IPromtAndReturnResponse = require('./IPromptAndReturnResponse.js');
let scanner = require('prompt-sync')({sigint: true});

let PromptAndReturnSimpleStrategy = class extends IPromtAndReturnResponse
{
  constructor(message)
  {
    super();

    this.message = message;
  }

  prompt()
  {
    console.log(this.message);

    return scanner();
  }
}

module.exports = PromptAndReturnSimpleStrategy;