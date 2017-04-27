#!/bin/bash
echo "Shinobi - Get dependencies"
sudo apt-get install ffmpeg libav-tools nodejs npm mysql-server -y
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
echo "Shinobi - Linking node to nodejs"
ln -s /usr/bin/nodejs /usr/bin/node

chmod -R 755 .

echo "Shinobi - Install NPM Libraries"

npm install
echo "Shinobi - Install PM2"
npm install pm2 -g