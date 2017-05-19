#!/bin/bash

SHIN_BIN_DIR=/opt/shinobi
MYSQL_HOST="${MYSQL_HOST:-shinobi-db}"
MYSQL_ROOT_USER="${MYSQL_ROOT_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-rootpass}"
MYSQL_USER="${MYSQL_USER:-ccio}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-shinobi}"

cd "$SHIN_BIN_DIR" || exit 9
tables_check="select count(*) from information_schema.tables where table_schema='API' and table_name='${MYSQL_DATABASE}';"
tables_num=$(/usr/bin/mysql -N -s -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} -e "${tables_check}")
echo $tables_num

if [ "${tables_num}" -eq "0" ]; then
     #install stuff if not installed
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;"
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} -e "CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} -e "GRANT ALL ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';"
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} -e 'FLUSH PRIVILEGES;'
    #mysql -u ${MYSQL_ROOT_USER} -pnight < /opt/shinobi/sql/user.sql || true
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} --database $MYSQL_DATABASE < /opt/shinobi/sql/framework.sql
    /usr/bin/mysql -u ${MYSQL_ROOT_USER} -p${MYSQL_ROOT_PASSWORD} -h ${MYSQL_HOST} --database $MYSQL_DATABASE < /opt/shinobi/sql/default_data.sql
    sed -i 's/"user": "majesticflame"/"user": "'"${MYSQL_USER}"'"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"password": ""/"password": "'"${MYSQL_PASSWORD}"'"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"host": "127.0.0.1"/"host": "'"${MYSQL_HOST}"'"/g' $SHIN_BIN_DIR/conf.json
    sed -i 's/"database": "ccio"/"database": "'"${MYSQL_DATABASE}"'"/g' $SHIN_BIN_DIR/conf.json
    npm cache clean -f && npm install -g n && n stable
fi

pm2 start /opt/shinobi/cron.js
pm2 start /opt/shinobi/camera.js
#pm2 start /opt/shinobi/plugins/motion/shinobi-motion.js
pm2 logs
