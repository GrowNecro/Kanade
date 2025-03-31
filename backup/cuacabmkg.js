const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

// Path ke folder data wilayah
const wilayahPath = path.join(__dirname, '../../data/wilayah');

// Objek untuk menyimpan data wilayah
const wilayah = {};

// Baca semua file di dalam folder wilayah
fs.readdirSync(wilayahPath).forEach(file => {
    if (file.endsWith('.js')) {
        const wilayahData = require(path.join(wilayahPath, file));
        Object.assign(wilayah, wilayahData);
    }
});

module.exports = {
    name: 'cuaca',
    description: 'Menampilkan informasi cuaca berdasarkan nama wilayah tingkat IV',
    async execute(message, args) {
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('⚠️ Cara Menggunakan Perintah Cuaca')
                .setDescription(
                    '📌 **Format:** `!cuaca <nama_wilayah>`\n' +
                    '📍 **Contoh:** `!cuaca caturtunggal` atau `!cuaca blitar`\n\n' +
                    '🌍 **Menggunakan kode wilayah tingkat IV**\n' +
                    '[🔗 Cek Kode Wilayah](https://kodewilayah.id/)'
                );

            return message.reply({ embeds: [embed] });
        }

        const namaWilayah = args.join(' ').toLowerCase();
        const kodeWilayah = wilayah[namaWilayah];

        if (!kodeWilayah) {
            return message.reply('⚠️ Nama wilayah tidak ditemukan! Pastikan kamu mengetik dengan benar.');
        }

        const bmkgApiUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeWilayah}`;

        try {
            const reaction = await message.react('⏳');

            const response = await axios.get(bmkgApiUrl);
            const jsonData = response.data;

            if (!jsonData?.data?.[0]?.cuaca?.[0]?.[0]) {
                return message.reply(`⚠️ Data cuaca untuk wilayah "${namaWilayah}" tidak ditemukan!`);
            }

            const lokasi = jsonData.data[0].lokasi;
            const cuaca = jsonData.data[0].cuaca[0][0];

            const suhu = cuaca.t ? `${cuaca.t}°C` : "Tidak tersedia";
            const kelembaban = cuaca.hu ? `${cuaca.hu}%` : "Tidak tersedia";
            const kondisi = cuaca.weather_desc || "Tidak tersedia";
            const kecepatanAngin = cuaca.ws ? `${cuaca.ws} km/h` : "Tidak tersedia";
            const arahAngin = cuaca.wd || "Tidak tersedia";
            const waktuLokal = cuaca.local_datetime || "Tidak tersedia";

            const embed = new EmbedBuilder()
                .setTitle(`🌍 Cuaca di ${lokasi.desa}, ${lokasi.kecamatan}, ${lokasi.kotkab}`)
                .setDescription(`🔹 Informasi cuaca terbaru untuk wilayah **${lokasi.provinsi}**`)
                .setColor(0x00AE86)
                .addFields(
                    { name: '🌦️ Kondisi', value: kondisi, inline: true },
                    { name: '🌡️ Suhu', value: suhu, inline: true },                    
                    { name: '💧 Kelembaban', value: kelembaban, inline: true },
                    { name: '💨 Kecepatan Angin', value: kecepatanAngin, inline: true },
                    { name: '🧭 Arah Angin', value: arahAngin, inline: true },
                    { name: '⏰ Waktu Lokal', value: waktuLokal, inline: false }
                )
                .setFooter({ text: 'Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)' });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Error mengambil data dari BMKG:', error);
            return message.reply(`🚨 Tidak dapat mengambil data untuk "${namaWilayah}"! Gunakan wilayah tingkat IV.`);
        } finally {
            message.reactions.cache.get('⏳')?.remove();
        }
    },
};
