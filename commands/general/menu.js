const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'menu',
    description: 'Menampilkan semua list perintah yang ada.',
    async execute(message) {
        const commandList = message.client.commands.map(cmd => `**${cmd.name}**: ${cmd.description || 'No description'}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Daftar Perintah')
            .setDescription(commandList.length ? commandList : 'No commands available.')
            .setFooter({ text: 'Gunakan perintah dengan bijak!' });

        await message.reply({ embeds: [embed] });
    },
};
