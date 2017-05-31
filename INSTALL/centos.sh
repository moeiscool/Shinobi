#!/bin/bash
echo "Shinobi - Get dependencies"
#Install EPEL Repo
yum install epel-release -y
#Enable Nux Dextop repo for FFMPEG
rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-1.el7.nux.noarch.rpm
yum install ffmpeg ffmpeg-devel nodejs npm mariadb mariadb-server -y
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
#Start mysql and enable on boot
systemctl start mariadb
systemctl enable mariadb
#Run mysql install
mysql_secure_installation
echo "Shinobi - Linking node to nodejs"
ln -s /usr/bin/nodejs /usr/bin/node

chmod -R 755 .

echo "Shinobi - Database Installation"
echo "What is your SQL Password?"
echo "**You set this just a few moments ago if MySQL was installed during this installer."
read sqlpass
mysql -u root -p$sqlpass -e "source sql/user.sql" || true
mysql -u root -p$sqlpass -e "source sql/database.sql" || true
mysql -u root -p$sqlpass --database ccio -e "source sql/tables.sql" || true
mysql -u root -p$sqlpass --database ccio -e "source sql/default_data.sql" || true
echo "Shinobi - Install NPM Libraries"
npm install
echo "Shinobi - Install PM2"
npm install pm2 -g