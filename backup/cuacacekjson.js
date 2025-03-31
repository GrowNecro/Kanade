const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/data.json');

module.exports = {
    name: 'coba',
    description: 'Menampilkan informasi cuaca berdasarkan data JSON',
    async execute(message) {
        try {
            if (!fs.existsSync(dataPath)) {
                return await message.reply('File data cuaca tidak ditemukan! 📂');
            }

            const data = fs.readFileSync(dataPath, 'utf8');
            const jsonData = JSON.parse(data);

            if (!jsonData.data || !jsonData.data[0] || !jsonData.data[0].cuaca || !jsonData.data[0].cuaca[0]) {
                return await message.reply('Data cuaca tidak tersedia! ⛅');
            }

            const lokasi = jsonData.data[0].lokasi;
            const cuaca = jsonData.data[0].cuaca[0][0];

            if (!lokasi || !cuaca) {
                return await message.reply('Data lokasi atau cuaca tidak ditemukan! 📍');
            }

            const suhu = cuaca.t !== undefined ? `${cuaca.t}°C` : "Tidak tersedia";
            const kelembaban = cuaca.hu !== undefined ? `${cuaca.hu}%` : "Tidak tersedia";
            const kondisi = cuaca.weather_desc || "Tidak tersedia";
            const kecepatanAngin = cuaca.ws !== undefined ? `${cuaca.ws} km/h` : "Tidak tersedia";
            const arahAngin = cuaca.wd || "Tidak tersedia";
            const waktuLokal = cuaca.local_datetime || "Tidak tersedia";

            const embed = new EmbedBuilder()
                .setTitle(`Cuaca di ${lokasi.desa}, ${lokasi.kecamatan}, ${lokasi.kotkab}`)
                .setDescription(`Informasi cuaca terbaru untuk wilayah **${lokasi.provinsi}**`)
                .setColor(0x00AE86)
                .addFields(
                    { name: '🌡️ Suhu', value: suhu, inline: true },
                    { name: '💧 Kelembaban', value: kelembaban, inline: true },
                    { name: '🌦️ Kondisi', value: kondisi, inline: true },
                    { name: '💨 Kecepatan Angin', value: kecepatanAngin, inline: true },
                    { name: '🧭 Arah Angin', value: arahAngin, inline: true },
                    { name: '⏰ Waktu Lokal', value: waktuLokal, inline: true }
                );

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error membaca file JSON:', error);
            await message.reply('Terjadi kesalahan saat membaca data cuaca. 🚨');
        }
    },
};
