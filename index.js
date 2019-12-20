const Discord = require('discord.js');
const fetch = require('node-fetch');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();

class User {
  async getUserRank(user) {
    const response = await fetch(`https://r6tab.com/api/search.php?platform=uplay&search=${user}`);
    const userData = await response.json();
    
    return userData;
  }

  async getUsersAndCompare(user1, user2) {
    const response1 = await fetch(`https://r6tab.com/api/search.php?platform=uplay&search=${user1}`);
    const userData1 = await response1.json();

    const response2 = await fetch(`https://r6tab.com/api/search.php?platform=uplay&search=${user2}`);
    const userData2 = await response2.json();
    
    return {
      userData1,
      userData2
    }
  }
}

getRankString = (mmr) => {
  if(mmr >= 1100 && mmr < 1200) {
    return 'Copper V';
  } else if(mmr >= 1200 && mmr < 1300) {
    return 'Copper IV';
  } else if(mmr >= 1300 && mmr < 1400) {
    return 'Copper III';
  } else if(mmr >= 1400 && mmr < 1500) {
    return 'Copper II';
  } else if(mmr >= 1500 && mmr < 1600) {
    return 'Copper I';
  } else if(mmr >= 1600 && mmr < 1700) {
    return 'Bronze V';  
  } else if(mmr >= 1700 && mmr < 1800) {
    return 'Bronze IV';  
  } else if(mmr >= 1800 && mmr < 1900) {
    return 'Bronze III';  
  } else if(mmr >= 1900 && mmr < 2000) {
    return 'Bronze II';  
  } else if(mmr >= 2000 && mmr < 2100) {
    return 'Bronze I';  
  } else if(mmr >= 2100 && mmr < 2200) {
    return 'Silver V';
  } else if(mmr >= 2200 && mmr < 2300) {
    return 'Silver IV';  
  } else if(mmr >= 2300 && mmr < 2400) {
    return 'Silver III'; 
  } else if(mmr >= 2400 && mmr < 2500) {
    return 'Silver II';  
  } else if(mmr >= 2500 && mmr < 2600) {
    return 'Silver I';  
  } else if(mmr >= 2600 && mmr < 2800) {
    return 'Gold III';  
  } else if(mmr >= 2800 && mmr < 3000) {
    return 'Gold II';  
  } else if(mmr >= 3000 && mmr < 3200) {
    return 'Gold I';  
  } else if(mmr >= 3200 && mmr < 3600) {
    return 'Platinum III';  
  } else if(mmr >= 3600 && mmr < 4000) {
    return 'Platinum II';  
  } else if(mmr >= 4000 && mmr < 4400) {
    return 'Platinum I';  
  } else if(mmr >= 4400 && mmr < 5000) {
    return 'Diamond';  
  } else if(mmr >= 5000) {
    return 'Champion';  
  }
}

client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', message => {
  const user = new User();

  if(!message.content.startsWith(`${prefix}r6srank`) || message.author.bot) return;

  const msg = message.content;
  const args = msg.split(' ');
  args.shift();

  args.forEach(name => {
    // message.channel.send(name)
  });

  if(!args.length) {
    return message.reply('you need to input a username to get their rank!');
  } else if(args.length === 1) {
    const uname = args[0];
    
    user.getUserRank(uname)
      .then(data => {
        if(data.totalresults === 0) {
          message.channel.send(`Uh-oh. User ${uname} does not exist. :frowning2:`);
          return;
        }

        const userData = data.results[0];
        userData.p_currentrank = getRankString(userData.p_currentmmr);
        message.channel.send(`${userData.p_name}: ${userData.p_currentrank}, ${userData.p_currentmmr}`);
      }
    );

  } else if (args.length === 2) {
    const uname1 = args[0];
    const uname2 = args[1];

    if(uname1 === uname2) {
      message.channel.send(`Tanga. There's no need to compare the same user. :face_palm:`);
    }

    user.getUsersAndCompare(uname1, uname2)
      .then(data => {

        if(data.userData1.totalresults === 0) {
          message.channel.send(`Uh-oh. User ${uname1} does not exist. :frowning2:`);
          return;
        }

        if (data.userData2.totalresults === 0) {
          message.channel.send(`Uh-oh. User ${uname2} does not exist. :frowning2:`);
          return;
        }

        let outputString = '';
        let totalmmrdifferential = 0;

        const user1 = data.userData1.results[0];
        const user2 = data.userData2.results[0];

        user1.p_currentrank = getRankString(user1.p_currentmmr);
        user2.p_currentrank = getRankString(user2.p_currentmmr);

        outputString += `1. ${user1.p_name} (${user1.p_currentrank}, ${user1.p_currentmmr})\n`
        outputString += `2. ${user2.p_name} (${user2.p_currentrank}, ${user2.p_currentmmr})\n`

        totalmmrdifferential = Math.abs(user1.p_currentmmr - user2.p_currentmmr);
        outputString += `=> MMR difference is ${totalmmrdifferential}`;

        if(totalmmrdifferential > 1000) {
          searchString = "sad";
        } else {
          searchString = "celebrate";
        }

        message.channel.send(outputString);
      }
    );
  }
});

client.login(token);
