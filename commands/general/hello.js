module.exports = {
    name: 'hello',
    description: 'Say hii to you',
    async execute(message, args) {
        await message.reply(`Hii ${message.client.user.username}!!`);
    },
};
