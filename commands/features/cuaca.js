const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'weather',
    description: 'Mengambil data cuaca sleman terbaru.',
    async execute(message) {
        const weatherInfoUrl = process.env.WEATHER_INFO_URL;

        await message.react('⏳');

        try {
            // Ambil gambar sebagai buffer
            const response = await axios.get(weatherInfoUrl, { responseType: 'arraybuffer' });
            const imagePath = path.join(__dirname, 'weather_image.jpg');

            await fs.writeFile(imagePath, response.data);
            const attachment = new AttachmentBuilder(imagePath);

            await message.reply({ content: 'Berikut info cuaca terbaru.', files: [attachment] });
            await message.react('👍');
        } catch (error) {
            console.error('Gagal mengirim gambar:', error);
            await message.react('❌');
            await message.reply('Terjadi kesalahan saat mengambil data.');
        } finally {
            // Memastikan file dihapus walau gagal dikirim
            try {
                await fs.unlink(path.join(__dirname, 'weather_image.jpg'));
            } catch (err) {
                console.warn('Gagal menghapus gambar:', err);
            }
        }
    },
};