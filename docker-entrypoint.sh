#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env
#sed -i 's/server.listen(80)/server.listen(8080)/g' $SHIN_BIN_DIR/camera.js
#sed -i 's/{"host":"127.0.0.1","user":"root","password":"","database":"ccio"}/{"host":"shinobi-db","user":"'${MYSQL_USER}'","'${MYSQL_PASSWORD}'":"","database":"ccio"}/g' $SHIN_BIN_DIR/conf.json

sed -i 's/"port": 80/"port": 8080/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"host": "127.0.0.1"/"host": "shinobi-db"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"user": "majesticflame"/"user": "'${MYSQL_USER}'"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"password": ""/"password": "'${MYSQL_PASSWORD}'"/g' $SHIN_BIN_DIR/conf.json


/usr/bin/nodejs camera.js
