# Update dan upgrade sistem
echo "Memperbarui sistem..."
pkg update -y && pkg upgrade -y

# Install Node.js
echo "Menginstal Node.js..."
pkg install nodejs -y

# Install npm (Node Package Manager)
echo "Menginstal npm..."
pkg install npm -y

# Install modul-modul yang diperlukan untuk attack.js
echo "Menginstal modul-modul Node.js..."
npm install http https net dgram fs cluster crypto

# Install http-proxy-agent dan https-proxy-agent untuk HTTP dan HTTPS Proxy
echo "Menginstal http-proxy-agent dan https-proxy-agent..."
npm install http-proxy-agent https-proxy-agent

# Pastikan semua modul telah terinstal
echo "Semua modul telah terinstal! Anda siap menjalankan attack.js di Termux."

# Menampilkan status instalasi
npm list --depth=0
