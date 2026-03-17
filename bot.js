const { 
  Client, 
  GatewayIntentBits, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  Events 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log('Bot prêt !');
});

client.on('guildMemberAdd', async member => {
  const role = member.guild.roles.cache.find(r => r.name === "Non-validé");
  if (role) member.roles.add(role);

  const channel = member.guild.channels.cache.find(c => c.name === "inscription");

  const button = new ButtonBuilder()
    .setCustomId('formulaire')
    .setLabel('Remplir la fiche')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({
    content: `${member} bienvenue ! Clique pour remplir ta fiche :`,
    components: [row]
  });
});

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isButton()) {
    if (interaction.customId === 'formulaire') {

      const modal = new ModalBuilder()
        .setCustomId('fiche')
        .setTitle('Fiche de présentation');

      const pseudo = new TextInputBuilder()
        .setCustomId('pseudo')
        .setLabel("Ton pseudo")
        .setStyle(TextInputStyle.Short);

      const age = new TextInputBuilder()
        .setCustomId('age')
        .setLabel("Ton âge")
        .setStyle(TextInputStyle.Short);

      const jeux = new TextInputBuilder()
        .setCustomId('jeux')
        .setLabel("Tes jeux")
        .setStyle(TextInputStyle.Paragraph);

      const row1 = new ActionRowBuilder().addComponents(pseudo);
      const row2 = new ActionRowBuilder().addComponents(age);
      const row3 = new ActionRowBuilder().addComponents(jeux);

      modal.addComponents(row1, row2, row3);

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'fiche') {

      const pseudo = interaction.fields.getTextInputValue('pseudo');
      const age = interaction.fields.getTextInputValue('age');
      const jeux = interaction.fields.getTextInputValue('jeux');

      const channel = interaction.guild.channels.cache.find(c => c.name === "validation");

      const accept = new ButtonBuilder()
        .setCustomId(`accept_${interaction.user.id}`)
        .setLabel('Accepter')
        .setStyle(ButtonStyle.Success);

      const refuse = new ButtonBuilder()
        .setCustomId(`refuse_${interaction.user.id}`)
        .setLabel('Refuser')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(accept, refuse);

      channel.send({
        content: `
📥 Nouvelle candidature :

👤 ${interaction.user}
📝 Pseudo : ${pseudo}
🎂 Âge : ${age}
🎮 Jeux : ${jeux}
        `,
        components: [row]
      });

      await interaction.reply({ content: "Candidature envoyée !", ephemeral: true });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId.startsWith('accept_')) {
      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId);

      const role = interaction.guild.roles.cache.find(r => r.name === "Non-validé");
      if (role) member.roles.remove(role);

      await interaction.reply(`✅ ${member.user.username} accepté !`);
    }

    if (interaction.customId.startsWith('refuse_')) {
      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId);

      await member.kick("Refusé");

      await interaction.reply(`❌ ${member.user.username} refusé`);
    }
  }
});

client.login(process.env.TOKEN);
