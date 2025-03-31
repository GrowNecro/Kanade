// Load library yang diperlukan
const dotenv = require('dotenv'); // Mengambil variabel lingkungan dari file .env
const fs = require('node:fs'); // Modul bawaan Node.js untuk bekerja dengan file sistem
const path = require('node:path'); // Modul untuk mengelola path file dan direktori
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js'); // Library utama untuk bot Discord

dotenv.config(); // Memuat variabel lingkungan dari file .env

// Membuat instance dari client bot Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Mengizinkan bot beroperasi dalam server
        GatewayIntentBits.GuildMessages, // Mengizinkan bot membaca pesan dalam server
        GatewayIntentBits.MessageContent // Mengizinkan bot membaca isi pesan (diperlukan untuk command berbasis prefix)
    ]
});

// Menyimpan daftar command dalam Collection untuk akses cepat
client.commands = new Collection();

const PREFIX = process.env.PREFIX || '!'; // Menggunakan prefix dari .env atau default "!"
const TOKEN = process.env.DISCORD_TOKEN; // Mengambil token bot dari .env

// Jika token tidak ditemukan, hentikan bot dengan pesan error
if (!TOKEN) {
    console.error("Error: Token is not defined in .env file");
    process.exit(1);
}

// Path utama tempat menyimpan folder command
const commandsPath = path.join(__dirname, 'commands');

// Cek apakah folder "commands" ada
if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath); // Membaca semua folder dalam "commands"

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);

        // Pastikan item dalam "commands" adalah folder
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js')); // Filter file .js

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    const command = require(filePath); // Import command dari file

                    // Pastikan command memiliki properti "name" dan "execute"
                    if ('name' in command && 'execute' in command) {
                        client.commands.set(command.name, command); // Menyimpan command ke Collection
                    } else {
                        console.warn(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
                    }
                } catch (error) {
                    console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
                }
            }
        }
    }
} else {
    console.warn(`[WARNING] The "commands" folder does not exist. No commands were loaded.`);
}

// Event listener saat bot siap dan berhasil terhubung ke Discord
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Event listener untuk menangani pesan dari pengguna
client.on(Events.MessageCreate, async message => {
    // Abaikan pesan dari bot atau yang tidak diawali dengan prefix yang sudah ditentukan
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Memisahkan prefix dan argumen dari command yang diketik pengguna
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase(); // Mengambil command pertama

    // Mencari command yang sesuai dalam Collection
    const command = client.commands.get(commandName);
    if (!command) return; // Jika command tidak ditemukan, abaikan

    try {
        // Menjalankan command dengan argumen yang diberikan
        await command.execute(message, args);
    } catch (error) {
        console.error(`[ERROR] Error executing ${commandName}:`, error);
        await message.reply('There was an error while executing this command!'); // Memberikan notifikasi jika terjadi error
    }
});

// Log in ke Discord menggunakan token yang telah ditentukan
client.login(TOKEN);
