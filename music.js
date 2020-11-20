const Discord = require("discord.js");
const ytdl = require('ytdl-core');

function Song(title, url, thumbnail) {
  this.title = title;
  this.url = url;
  this.thumbnail = thumbnail;
}

function SongQueue() {
  this.songs = [];
  this.textChannel = undefined;
  this.voiceChannel = undefined;
  this.connection = null;
}

SongQueue.prototype.queue = function(song) {
  this.songs.push(song);
}

SongQueue.prototype.dequeue = function() {
  return this.songs.shift()
}


SongQueue.prototype.isEmpty = function() {
  return this.songs.length === 0
}

SongQueue.prototype.clear = function() {
  this.songs = []
}

const playlist = new SongQueue()

function play(botUser, textChannel, voiceChannel, videoUrl) {
  if(!checkPermissions(botUser, textChannel, voiceChannel)) {
    return;
  }

  ytdl.getInfo(videoUrl).then(info => {
    if(!playlist.connection) {
      voiceChannel.join().then(connection => {
        playlist.queue(new Song(info.videoDetails.title, info.videoDetails.video_url, info.videoDetails.thumbnail.thumbnails[0].url));
        playlist.textChannel = textChannel;
        playlist.voiceChannel = voiceChannel;
        playlist.connection = connection;

        connection.setVolumeLogarithmic(0.5);
        playNextSong();
      }).catch(error => {
        console.log("Error joining voice channel: " + error.message);
      });
    } else {
      playlist.queue(new Song(info.videoDetails.title, info.videoDetails.video_url, info.videoDetails.thumbnail.thumbnails[0].url));
      textChannel.send(`${info.videoDetails.title} added to playlist`)
    }
  }).catch(error => {
    console.log("Error retrieving video: " + error.message);
  });
}

function skip(botUser, textChannel, voiceChannel) {
  if(!checkPermissions(botUser, textChannel, voiceChannel)) {
    return;
  }

  playlist.connection.dispatcher.end();
}

function stop(botUser, textChannel, voiceChannel) {
  if(!checkPermissions(botUser, textChannel, voiceChannel)) {
    return;
  }

  forceStop();
}

function forceStop() {
  playlist.clear();
  if(playlist.connection) {
    playlist.connection.dispatcher.end();
  }
}

function checkPermissions(botUser, textChannel, voiceChannel) {
  if(textChannel !== playlist.textChannel && playlist.textChannel !== undefined) {
    textChannel.send("Sorry, please manage the playlist from the same text channel it was created from");
    return false;
  }

  if(!voiceChannel) {
    textChannel.send("Sorry, you can't modify the playlist if you're not in a voice channel");
    return false;
  }

  if(voiceChannel !== playlist.voiceChannel && playlist.voiceChannel !== undefined) {
    textChannel.send("Sorry, you can't modify the playlist if you're not in the same voice channel as me");
    return false;
  }

  const permissions = voiceChannel.permissionsFor(botUser)
  if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    textChannel.send("Sorry, I don't have permission to play music in that channel");
    return false;
  }

  return true
}

function playNextSong() {
  if(playlist.isEmpty()) {
    playlist.voiceChannel.leave();

    playlist.textChannel = undefined;
    playlist.voiceChannel = undefined;
    playlist.connection = null;

    return;
  }

  const song = playlist.dequeue();

  playlist.connection.play(ytdl(song.url))
    .on("finish", () => {
      playNextSong();
    })
    .on("error", error => {
      console.log("Error playing song: " + error.message);
    });
  
  sendSongEmbed(song, playlist.textChannel);
}

function sendSongEmbed(song, channel) {
  const embed = new Discord.MessageEmbed();
  embed.setColor(0x9B59B6)
  embed.setTimestamp()

  embed.setTitle(song.title);
  embed.setURL(song.url);
  embed.setThumbnail(song.thumbnail);

  channel.send("Now playing:")
  channel.send(embed);
}

module.exports = 
{
  play: play,
  skip: skip,
  stop: stop,
  forceStop: forceStop
};
