#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env

/etc/init.d/mysql start
sleep 2
cd /opt/shinobi

if [ ! -e "/opt/shinobi/installed.txt" ]; then
#install stuff if not installed
    touch /opt/shinobi/installed.txt
    mysql -u root -pnight -e "CREATE USER 'root'@'192.168.99.1' IDENTIFIED BY 'night';" || true
    mysql -u root -pnight -e "GRANT ALL PRIVILEGES ON * . * TO 'root'@'192.168.99.1';" || true
    mysql -u root -pnight -e "FLUSH PRIVILEGES;" || true
    #mysql -u root -pnight < /opt/shinobi/sql/user.sql || true
    mysql -u root -pnight < /opt/shinobi/sql/framework.sql || true
    mysql -u root -pnight --database ccio < /opt/shinobi/sql/default_data.sql || true
    sed -i 's/"user": "majesticflame"/"user": "root"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"password": ""/"password": "night"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"port":3306/"port":3314/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"port": 8080/"port": 8083/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"port":8080/"port":8083/g' $SHIN_BIN_DIR/plugins/motion/conf.json
    npm cache clean -f && npm install -g n && n stable
else
#update if already installed
    wget https://github.com/moeiscool/Shinobi/tarball/master
    mkdir master_temp
    tar -xzf master -C master_temp --strip-components=1
    rm -rf camera.js web UPDATE.sh package.json cron.js
    mv master_temp/UPDATE.sh UPDATE.sh
    chmod +x UPDATE.sh
    mv master_temp/web web
    mv master_temp/package.json package.json
    mv master_temp/camera.js camera.js
    mv master_temp/cron.js cron.js
    mv master_temp/plugins/motion/shinobi-motion.js plugins/motion/shinobi-motion.js
    npm install
    rm -rf master master_temp
fi

pm2 start /opt/shinobi/cron.js
pm2 start /opt/shinobi/camera.js
#pm2 start /opt/shinobi/plugins/motion/shinobi-motion.js
pm2 logs