module.exports = {
    name: 'ping',
    description: 'Mengecek apakah server merespon',
    async execute(message, args) {
        await message.reply('Pong! 🏓');
    },
};
