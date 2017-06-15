#!/bin/bash
echo "Shinobi - Updating Ubuntu"
#apt-get install ffmpeg
apt-get update -y&&apt-get upgrade -y
apt-get install wget -y
echo "============="
echo "Shinobi - Get dependencies"
apt install libav-tools ffmpeg -y
echo "============="
echo "Shinobi - Installing MariaDB"
echo "Password for root SQL user, If you are installing SQL now then you may put anything:"
read sqlpass
echo "mariadb-server mariadb-server/root_password password $sqlpass" | debconf-set-selections
echo "mariadb-server mariadb-server/root_password_again password $sqlpass" | debconf-set-selections
apt-get install mariadb-server -y
apt-get install nodejs npm -y
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
echo "============="
echo "Shinobi - Linking node to nodejs"
ln -s /usr/bin/nodejs /usr/bin/node

chmod -R 755 .
echo "============="
echo "Shinobi - Database Installation"
mysql -u root -p$sqlpass -e "source sql/user.sql" || true
mysql -u root -p$sqlpass -e "source sql/framework.sql" || true
mysql -u root -p$sqlpass --database ccio -e "source sql/default_data.sql" || true
echo "============="
echo "Shinobi - Install NPM Libraries"
npm install

echo "============="
echo "Shinobi - Install PM2"
npm install pm2 -g
if [ ! -e "./conf.json" ]; then
    cp conf.sample.json conf.json
fi
pm2 start camera.js
pm2 start cron.js
pm2 list