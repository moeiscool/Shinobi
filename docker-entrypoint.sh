#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env

/etc/init.d/mysql start
/usr/bin/mysqld_safe &
sleep 5

if [ ! -e "/opt/shinobi/installed.txt" ]; then
    touch /opt/shinobi/installed.txt
    mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "CREATE USER '${MYSQL_USER}'@'192.168.99.1' IDENTIFIED BY '${MYSQL_PASSWORD}';" || true
    mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "GRANT ALL PRIVILEGES ON * . * TO '${MYSQL_USER}'@'192.168.99.1';" || true
    mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "FLUSH PRIVILEGES;" || true
    #mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} < /opt/shinobi/sql/user.sql || true
    mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} < /opt/shinobi/sql/framework.sql || true
    mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} --database ccio < /opt/shinobi/sql/default_data.sql || true
fi

sed -i 's/"user": "majesticflame"/"user": "'${MYSQL_USER}'"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"password": ""/"password": "'${MYSQL_PASSWORD}'"/g' $SHIN_BIN_DIR/conf.json
npm cache clean -f && npm install -g n && n stable
cd /opt/shinobi
npm install
pm2 start /opt/shinobi/cron.js
pm2 start /opt/shinobi/camera.js
pm2 start /opt/shinobi/plugins/motion/shinobi-motion.js
pm2 logs