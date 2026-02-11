const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = 'SEU_TOKEN_AQUI';

// Variáveis de fila
let fila = [];
let modoEscolhido = null;
let valorEscolhido = null;
let filaMessage = null;

// Valores disponíveis
const valores = [1, 5, 10, 20, 50, 100];

function gerarEmbedFila() {
  return new EmbedBuilder()
    .setTitle('🏆 ORG TK 0% TAXA 🏆')
    .addFields(
      { name: '🎮 Modo:', value: modoEscolhido || 'Não escolhido', inline: true },
      { name: '💰 Valor:', value: valorEscolhido ? `R$ ${valorEscolhido}` : 'Não escolhido', inline: true },
      { name: `👥 Jogadores na fila (${fila.length}/? )`, value: fila.length ? fila.join('\n') : 'Nenhum jogador ainda', inline: false }
    )
    .setFooter({ text: 'ORG TK • Sistema de Fila' })
    .setColor('Blue');
}

// Comando !fila
client.on('messageCreate', async (message) => {
  if (message.content === '!fila') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('modo_1v1').setLabel('1v1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('modo_2v2').setLabel('2v2').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('modo_3v3').setLabel('3v3').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('modo_4v4').setLabel('4v4').setStyle(ButtonStyle.Primary)
    );

    const valorRow = new ActionRowBuilder();
    valores.forEach((v, i) => {
      valorRow.addComponents(
        new ButtonBuilder().setCustomId(`valor_${v}`).setLabel(`R$ ${v}`).setStyle(ButtonStyle.Secondary)
      );
    });

    filaMessage = await message.channel.send({ embeds: [gerarEmbedFila()], components: [row, valorRow] });
  }
});

// Listener de botão
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // Modo
  if (interaction.customId.startsWith('modo_')) {
    modoEscolhido = interaction.customId.replace('modo_', '');
  }

  // Valor
  if (interaction.customId.startsWith('valor_')) {
    valorEscolhido = interaction.customId.replace('valor_', '');
  }

  // Adicionar jogador
  if (!fila.includes(interaction.user.username)) {
    fila.push(interaction.user.username);
  }

  // Atualizar embed
  if (filaMessage) {
    await interaction.update({ embeds: [gerarEmbedFila()] });
  } else {
    await interaction.reply({ content: 'Erro: filaMessage não encontrado.', ephemeral: true });
    return;
  }

  // Criar canal automático se fila completa
  let tamanhoFila = 1;
  if (modoEscolhido === '1v1') tamanhoFila = 2;
  if (modoEscolhido === '2v2') tamanhoFila = 4;
  if (modoEscolhido === '3v3') tamanhoFila = 6;
  if (modoEscolhido === '4v4') tamanhoFila = 8;

  if (fila.length === tamanhoFila) {
    const guild = interaction.guild;
    const canalName = `partida-${modoEscolhido}`;
    guild.channels.create({
      name: canalName,
      type: 0, // GUILD_TEXT
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['ViewChannel']
        },
        ...fila.map((username) => {
          const member = guild.members.cache.find((m) => m.user.username === username);
          return member ? { id: member.id, allow: ['ViewChannel', 'SendMessages'] } : null;
        }).filter(Boolean)
      ]
    }).then(() => {
      fila = []; // limpar fila
      modoEscolhido = null;
      valorEscolhido = null;
      filaMessage.edit({ embeds: [gerarEmbedFila()] });
    });
  }
});

client.login(token);