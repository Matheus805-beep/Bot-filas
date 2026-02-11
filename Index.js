const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const fila = [];

client.on("ready", () => {
  console.log(`Bot ligado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!fila") {

    const filaEmbed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("🏆 ORG TK 0% TAXA 🏆")
      .setDescription(
        "🎮 **Modo:** Jogar Normal\n" +
        "💰 **Valor:** R$10\n\n" +
        "👥 **Jogadores na fila:**\n" +
        (fila.length > 0 ? fila.map(u => `• ${u}`).join("\n") : "Nenhum jogador ainda")
      )
      .setFooter({ text: "ORG TK • Sistema de Fila" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("entrar")
        .setLabel("🟢 Entrar na fila")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("sair")
        .setLabel("🔴 Sair da fila")
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({
      embeds: [filaEmbed],
      components: [row]
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "entrar") {
    if (!fila.includes(interaction.user.username)) {
      fila.push(interaction.user.username);
    }
    await interaction.reply({ content: "Você entrou na fila!", ephemeral: true });
  }

  if (interaction.customId === "sair") {
    const index = fila.indexOf(interaction.user.username);
    if (index > -1) fila.splice(index, 1);
    await interaction.reply({ content: "Você saiu da fila!", ephemeral: true });
  }
});

client.login("SEU_TOKEN_AQUI");
