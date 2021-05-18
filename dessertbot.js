const Util = require("./util.js");
const Dice = require("./dice.js");
const MTG = require("./mtg.js");
const Music = require("./music.js")

const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");

function cardDescriptionForEmbed(card) {
  let description = "";
  if(card.cost != "") {
    description += `\n${card.cost}`;
  }
  if(card.type != "") {
    description += `\n${card.type}`;
  }
  if(card.powerToughnessLoyalty != "") {
    description +=`\n${card.powerToughnessLoyalty}`;
  }
  if(card.description != "") {
    description += `\n${card.text}`;
  }
  if(card.flavour != "") {
    description += `\n*${card.flavour}*`;
  }
  return description.trim();
}

function sendCardEmbed(card, channel) {
  const embed = new Discord.MessageEmbed();
  embed.setColor(0x9B59B6)
  embed.setTimestamp()

  embed.setTitle(card.name);
  if(card.link != "") {
    embed.setURL(card.link);
  }
  if(card.thumbnail != "") {
    embed.setThumbnail(card.thumbnail);
  }

  embed.setDescription(cardDescriptionForEmbed(card));
  card.faces.forEach(face => {
    embed.addField(face.name, cardDescriptionForEmbed(face));
  });

  channel.send(embed);
}

client.on("ready", () => {
  console.log("DessertBot Ready!");
});

client.on("disconnect", event => {
  console.log(`DessertBot disconnected with code: ${event.code}, cleanly: + ${event.wasClean}`);
  console.log(`Reason: ${event.reason}`);
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
  const botVoiceChannel = oldMember.guild.member(client.user).voice.channel;
  if(!botVoiceChannel) {
    return;
  }

  if(botVoiceChannel.members.size === 1) {
    Music.forceStop();
  }
});

client.on("message", message => {
  // Ignore bot messages and non-command messages
  if(message.author.bot || !message.content.startsWith(config.prefix)) {
    return;
  }

  // Split command and arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Perform command
  switch(command) {
    case "help":
    case "commands":
      message.channel.send("!ping - check if DessertBot is still alive\n" +
        "!whois @<member> - user information for <member>\n" +
        "!flip - flip a coin\n" +
        "!roll <dice expression> - roll some dice\n" +
        "!mtg <card name> - search for a Magic: The Gathering card\n" +
	      "!sanchez, !ronnie, !elise, !jebaited, !weddingjason - image commands\n" +
        "!wow, !wtf - gif commands\n" +
        "!play, !skip, !stop - music commands");
      break;

    case "ping":
      message.reply("!pong");
      break;

    case "whois":
      let member = message.mentions.members.first() || message.member;
      let name = (member.nickname != null) ?
        `${member.nickname} (${member.user.username}#${member.user.discriminator})` :
        `${member.user.username}#${member.user.discriminator}`;
      message.channel.send(`${member} is ${name}, member of ${message.guild.name} since ${member.joinedAt.toDateString()}` );
      break;

    case "flip":
      let flipResult = Util.flip();
      message.reply(flipResult);
      break;

    case "roll":
      try {
        let rollResult = Dice.rollDice(args.join(" "));
        message.reply(rollResult);
      }
      catch(error) {
        message.reply(error.message);
      }
      break;

    case "mtg":
      MTG.mtgSearch(args, result => {
        if(result instanceof MTG.MTGError) {
          message.channel.send(result.details);
        } else if(result instanceof MTG.MTGCard) {
          sendCardEmbed(result, message.channel);
        }
      });
      break;

    case "elise":
      let eliseImage = Util.elise();
      message.channel.send("", {
        "files": [eliseImage]
      });
      break;

    case "ronnie":
      let ronnieImage = Util.ronnie();
      message.channel.send("", {
        "files": [ronnieImage]
      });
      break;

    case "sanchez":
      let sanchezImage = Util.sanchez();
      message.channel.send("", {
        "files": [sanchezImage]
      });
      break;

    case "jebaited":
      let jebaitedImage = Util.jebaited();
      message.channel.send("", {
        "files": [jebaitedImage]
      });
      break;

    case "weddingjason":
      let weddingJasonImage = Util.weddingjason();
      message.channel.send("", {
        "files": [weddingJasonImage]
      });
      break;

    case "wow":
      let wowImage = Util.wow();
      message.channel.send("", {
        "files": [wowImage]
      });
      break;

    case "wtf":
      let wtfImage = Util.wtf();
      message.channel.send("", {
        "files": [wtfImage]
      });
      break;

    case "play":
      Music.play(message.client.user, message.channel, message.member.voice.channel, args.shift());
      break;

    case "skip":
      Music.skip(message.client.user, message.channel, message.member.voice.channel);
      break;

    case "stop":
      Music.stop(message.client.user, message.channel, message.member.voice.channel);
      break;

    default:
      break;
  }
});

client.login(config.discordtoken);
