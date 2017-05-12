#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
cd /opt/shinobi

if [ ! -e "/opt/shinobi/installed.txt" ]; then
#install stuff if not installed
    touch /opt/shinobi/installed.txt
    my_mysql="/usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql"
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;"
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql -e "CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD' ;"
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql -e "GRANT ALL ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';"
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql -e 'FLUSH PRIVILEGES ;'
    #mysql -u root -pnight < /opt/shinobi/sql/user.sql || true
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql --database $MYSQL_DATABASE < /opt/shinobi/sql/framework.sql || true
    /usr/bin/mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql --database $MYSQL_DATABASE < /opt/shinobi/sql/default_data.sql || true
    sed -i 's/"user": "majesticflame"/"user": "'"${MYSQL_USER}"'"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"password": ""/"password": "'"${MYSQL_PASSWORD}"'"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"host": "127.0.0.1"/"host": "mysql"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"database": "ccio"/"database": "'"${MYSQL_DATABASE}"'"/g' $SHIN_BIN_DIR/conf.json
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
