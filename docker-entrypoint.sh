#!/bin/bash

SHIN_BIN_DIR=/opt/shinobi
MYSQL_HOST="${MYSQL_HOST:-shinobi-db}"
MYSQL_DATABASE="${MYSQL_DATABASE:-shinobi}"
MYSQL_ROOT_USER="${MYSQL_ROOT_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-rootpass}"
MYSQL_USER="${MYSQL_USER:-ccio}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-shinobi}"

cd "$SHIN_BIN_DIR" || exit 9

check_port() {
    timeout 3 bash -c "</dev/tcp/$1/$2" 2>/dev/null
}

_mysql() {
    mysql -u "${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" -h "${MYSQL_HOST}" "$@"
}

echo -n "Waiting for MYSQL server..."
while ! check_port "$MYSQL_HOST" 3306
do
    :
done
echo 'Done!'

tables_check="select count(*) from information_schema.tables where table_schema='${MYSQL_DATABASE}' and table_name='API';"
tables_num=$(mysql -N -s -u "${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}" -h "${MYSQL_HOST}" -e "${tables_check}")

if [[ "${tables_num}" -eq "0" ]]
then
    # install stuff if not installed
    _mysql -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;"
    _mysql -e "CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
    _mysql -e "GRANT ALL ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';"
    _mysql -e "FLUSH PRIVILEGES;"
    _mysql --database "$MYSQL_DATABASE" < "${SHIN_BIN_DIR}/sql/tables.sql"
    _mysql --database "$MYSQL_DATABASE" < "${SHIN_BIN_DIR}/sql/default_data.sql"
    npm cache clean -f && npm install -g n && n stable
fi
    sed -i 's/"user": "majesticflame"/"user": "'"${MYSQL_USER}"'"/g' "$SHIN_BIN_DIR/conf.json"
    sed -i 's/"password": ""/"password": "'"${MYSQL_PASSWORD}"'"/g' "$SHIN_BIN_DIR/conf.json"
    sed -i 's/"host": "127.0.0.1"/"host": "'"${MYSQL_HOST}"'"/g' "$SHIN_BIN_DIR/conf.json"
    sed -i 's/"database": "ccio"/"database": "'"${MYSQL_DATABASE}"'"/g' "$SHIN_BIN_DIR/conf.json"

pm2 start "${SHIN_BIN_DIR}/cron.js"
pm2 start "${SHIN_BIN_DIR}/camera.js"
# pm2 start "${SHIN_BIN_DIR}/plugins/motion/shinobi-motion.js"
pm2 logs