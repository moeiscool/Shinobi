#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env

/etc/init.d/mysql start
/usr/bin/mysqld_safe &
sleep 5

if [ ! -e "/opt/shinobi/installed.txt" ]; then
    touch /opt/shinobi/installed.txt
    mysql -u root -pnight -e "CREATE USER 'root'@'192.168.99.1' IDENTIFIED BY 'night';" || true
    mysql -u root -pnight -e "GRANT ALL PRIVILEGES ON * . * TO 'root'@'192.168.99.1';" || true
    mysql -u root -pnight -e "FLUSH PRIVILEGES;" || true
    #mysql -u root -pnight < /opt/shinobi/sql/user.sql || true
    mysql -u root -pnight < /opt/shinobi/sql/framework.sql || true
    mysql -u root -pnight --database ccio < /opt/shinobi/sql/default_data.sql || true
fi

sed -i 's/"user": "majesticflame"/"user": "root"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"password": ""/"password": "night"/g' $SHIN_BIN_DIR/conf.json
npm cache clean -f && npm install -g n && n stable
cd /opt/shinobi
npm install
pm2 start /opt/shinobi/cron.js
pm2 start /opt/shinobi/camera.js
#pm2 start /opt/shinobi/plugins/motion/shinobi-motion.js
pm2 logs