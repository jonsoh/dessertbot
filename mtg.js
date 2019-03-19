const HTTPS = require("https");

function MTGCard(name, cost, type, text, powerToughnessLoyalty, flavour, link, thumbnail, faces) {
  this.name = name;
  this.cost = cost;
  this.type = type;
  this.text = text;
  this.powerToughnessLoyalty = powerToughnessLoyalty;
  this.flavour = flavour;
  this.link = link;
  this.thumbnail = thumbnail;
  this.faces = faces;
}

function MTGError(details) {
  this.details = details;
}

function makeCard(json) {
  let name = json.name;
  let cost = json.hasOwnProperty("mana_cost") ? json.mana_cost : ""; 
  let type = json.hasOwnProperty("type_line") ? json.type_line : ""; 
  let text = json.hasOwnProperty("oracle_text") ? json.oracle_text: ""; 

  var powerToughnessLoyalty = "";
  if(json.hasOwnProperty("power") && json.hasOwnProperty("toughness")) {
    powerToughnessLoyalty = json.power + "/" + json.toughness;
  }
  else if(json.hasOwnProperty("loyalty")) {
    powerToughnessLoyalty = json.loyalty;
  }
  
  let flavour = json.hasOwnProperty("flavor_text") ? json.flavor_text : ""; 
  let link = json.hasOwnProperty("scryfall_uri") ? json.scryfall_uri : ""; 
  let thumbnail = (json.hasOwnProperty("image_uris") && json.image_uris.hasOwnProperty("art_crop"))
    ? json.image_uris.art_crop : ""; 

  var faces = [];
  if(json.hasOwnProperty("card_faces")) {
    json.card_faces.forEach(face => {
      faces.push(makeCard(face));
    });
  }

  return new MTGCard(name, cost, type, text, powerToughnessLoyalty, flavour, link, thumbnail, faces);
}

function mtgSearch(query, callback) {
  var escapedQuery = [];
  query.forEach(term => {
    escapedQuery.push(encodeURIComponent(term));
  });

  let queryURL = "https://api.scryfall.com/cards/named?fuzzy=" + escapedQuery.join("+");
  HTTPS.get(queryURL, response => {
    let data = "";

    response.on("data", chunk => {
      data += chunk;
    });

    response.on("end", () => {
      let json = JSON.parse(data);
      if(json.object == "error") {
        let error = new MTGError(json.details);
        callback(error);
      }
      else {
        let card = makeCard(json);
        callback(card);
      }
    });
  }).on("error", error => {
    console.log("Error in Scryfall HTTPS request: " + error.message);
  });
}

module.exports = 
{
  MTGCard: MTGCard,
  MTGError: MTGError,
  mtgSearch: mtgSearch,
};
