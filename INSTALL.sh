#!/bin/bash
echo "Shinobi - Get dependencies"
#apt-get install ffmpeg
apt-get install libav-tools nodejs npm mysql-server -y
apt-get install dstat
echo "Shinobi - Linking node to nodejs"
ln -s /usr/bin/nodejs /usr/bin/node

chmod -R 755 .

echo "Shinobi - Database Installation"
echo "What is your SQL Username"
read sqluser
echo "What is your SQL Password"
read sqlpass

mysql -u $sqluser -p$sqlpass -e "source sql/user.sql" || true
mysql -u $sqluser -p$sqlpass -e "source sql/framework.sql" || true
mysql -u $sqluser -p$sqlpass --database ccio -e "source sql/default_data.sql" || true
echo "Shinobi - Install NPM Libraries"
npm install
echo "Shinobi - Install PM2"
npm install pm2 -g

