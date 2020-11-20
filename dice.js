const Util = require("./util.js");

function Dice(sides, count) {
  this.sides = sides;
  this.count = count;
  this.coefficient = 1;
}

Dice.prototype.setNegative = function() {
  this.coefficient = -1;
}

Dice.prototype.roll = function() {
  var rolls = [];
  var sum = 0;
  for(var i = 0; i < this.count; ++i) {
    var roll = Util.rollDie(this.sides) * this.coefficient;
    rolls.push(roll);
    sum += roll;
  }
  return {
    sum: sum,
    rolls: rolls
  }
}

function Constant(constant) {
  this.constant = constant
  this.coefficient = 1;
}

Constant.prototype.setNegative = function() {
  this.coefficient = -1;
}

Constant.prototype.roll = function() {
  return {
    sum: this.constant * this.coefficient,
    rolls: [this.constant * this.coefficient]
  }
}

function matchDice(str) {
  var match = /^([1-9][0-9]*)?(d|D)(([1-9][0-9]*)|\%)/.exec(str);
  if(match === null) {
    return null;
  }
  var sides = (match[3] === "%") ? 100 : Number(match[3]);
  var count = Number(match[1]) || 1;
  var remaining = str.slice(match[0].length);
  
  if(count > 1000000) {
    throw new Error("That's a few too many dice to throw at once, more than a million's a bit nuts...");
  }
  if(sides > 1000000) {
    throw new Error("A dice with more than a million sides? How is that even possible?");
  }
  
  return {
    tokens: [new Dice(sides, count)],
    remaining: remaining
  }
}

function matchConstant(str) {
  var match = /^[1-9][0-9]*/.exec(str);
  if(match === null) {
    return null;
  }
  var constant = match[0];
  var remaining = str.slice(match[0].length);
  return {
    tokens: [new Constant(constant)],
    remaining: remaining
  }
}

function matchWhitespace(str) {
  var match = /^\s*/.exec(str);
  var remaining = str.slice(match[0].length);
  return {
    tokens: [],
    remaining: remaining
  }
}

function matchOperator(str) {
  var match = /^[+|-]/.exec(str);
  if(match === null) {
    return null;
  }
  var operator = match[0];
  var remaining = str.slice(match[0].length);
  return {
    tokens: [operator],
    remaining: remaining
  }
}

function tokenize(str) {
  var remaining = str;
  var matchDiceOrConstant = function(str) {
    return matchDice(str) || matchConstant(str);
  };
  var matchers = [matchWhitespace, matchDiceOrConstant, matchWhitespace, matchOperator];
  
  var i = 0;
  var tokens = [];
  
  while(remaining.length > 0) {
    var currentMatcher = matchers[i];
    var matchResult = currentMatcher(remaining);
    if(matchResult === null) {
      throw new Error("Parse error at position " + (str.length - remaining.length) + ": -> " + remaining);
    }
    
    tokens = tokens.concat(matchResult.tokens);
    remaining = matchResult.remaining;
    
    i = (i + 1) % matchers.length;
  }
  
  if(i === 0 || i === 1) {
    throw new Error("Parse error at end: dice expression ended with an operator");
  }
  
  var result = [];
  var operator = "+";
  for(var j = 0; j < tokens.length; ++j) {
    var token = tokens[j];
    if(typeof token === "string") {
      operator = token;
      continue;
    }
    
    if(operator === "-") {
      token.setNegative();
    }
    result.push(token);
  }

  return result;
}

function rollDice(str) {
  var tokens = tokenize(str);
  
  if(tokens.length > 20) {
    throw new Error("That's a bit complicated, do you mind splitting up those rolls?");
  }
  
  var sum = 0;
  var descriptions = [];
  for(var i = 0; i < tokens.length; ++i) {
    var token = tokens[i];
    var roll = token.roll();
    sum += roll.sum;
    
    if(token instanceof Dice) {
      var description = `${token.count}d${token.sides}: ${Math.abs(roll.sum)}`;
      var rolls = roll.rolls;
      if(rolls.length > 1) {
        var positiveRolls = rolls.map(Math.abs);
        description += " = " + positiveRolls.join(" + ");
      }
      descriptions.push(description);
    }
  }
  
  if(descriptions.length == 0) {
    return sum;
  }
  
  var descriptionStr = descriptions.join(", ");
  if(descriptionStr.length > 1950) {
    return sum;
  }
  
  return `${sum} (${descriptionStr})`;
}

module.exports = {
  rollDice: rollDice
};
