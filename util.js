// Returns an integer from 1 to max, inclusive
function random(max) {
  return Math.floor(Math.random() * max) + 1;
}

function flip() {
  let flipResult = random(1);
  return flipResult === 0 ? "Heads!" : "Tails!";
}
  
function rollDie(sides) {
  return random(sides);
}

function ronnie() {
  const ronniePattern = "./assets/ronnie/ronnie%d.jpg";
  const maxRonnie = 5;
  let ronnieIndex = random(maxRonnie);
  return ronniePattern.replace("%d", ronnieIndex);
}

function sanchez() {
  const sanchezPattern = "./assets/sanchez/sanchez%d.jpg";
  const maxSanchez = 26;
  let sanchezIndex = random(maxSanchez);
  return sanchezPattern.replace("%d", sanchezIndex);
}

function jebaited() {
  return "./assets/jebaited.png";
}

function weddingjason() {
  return "./assets/weddingjason.jpg";
}

function wow() {
  return "./assets/wow.gif";
}

function wtf() {
  return "./assets/wtf.gif";
}

module.exports = 
{
  flip: flip,
  rollDie: rollDie,
  ronnie: ronnie,
  sanchez: sanchez,
  jebaited: jebaited,
  weddingjason: weddingjason,
  wow: wow,
  wtf: wtf
};
