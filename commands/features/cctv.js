const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

module.exports = {
    name: 'ingfo',
    description: 'Untuk melihat siapa aja yang ada di BC',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Gunakan command `ingfo atas` untuk melihat BC atas');
        }

        const location = args.join(' ');
        const cctvApiUrl = process.env.CCTV_API_URL;
        const cctvApiToken = process.env.CCTV_API_TOKEN;

        if (!cctvApiUrl || !cctvApiToken) {
            return message.reply('API CCTV belum di setting.');
        }

        try {
            await message.react('⏳'); // React awal "loading"

            const response = await axios.get(`${cctvApiUrl}ingfo/${location}`, {
                headers: { Authorization: cctvApiToken }
            });

            const { count, image } = response.data;
            if (typeof count === "undefined") {
                throw new Error("Count dari api tidak ada.");
            }

            const imageBuffer = Buffer.from(image, 'base64');

            await message.reply({
                content: `BC ${location}: Detected ${count} person(s).`,
                files: [{ attachment: imageBuffer, name: `cctv_${location}.jpg` }]
            });

            await message.reactions.cache.get('⏳')?.remove(); // Hapus "⏳"
            await message.react('👍'); // React sukses
        } catch (error) {
            console.error('Error fetching CCTV:', error);
            await message.reactions.cache.get('⏳')?.remove(); // Hapus "⏳"
            await message.react('❌'); // React error
        }
    },
};
