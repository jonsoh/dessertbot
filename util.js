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

function sanchez() {
  const sanchezPattern = "./assets/sanchez%d.jpg";
  const maxSanchez = 19;
  let sanchezIndex = random(maxSanchez);
  return sanchezPattern.replace("%d", sanchezIndex);
}

function jebaited() {
  return "./assets/jebaited.png";
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
  sanchez: sanchez,
  jebaited: jebaited,
  wow: wow,
  wtf: wtf
};
