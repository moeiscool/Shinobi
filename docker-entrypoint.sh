#!/bin/bash
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env
sed -i 's/"host": "127.0.0.1"/"host": "shinobi-db"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"user": "majesticflame"/"user": "'${MYSQL_USER}'"/g' $SHIN_BIN_DIR/conf.json
sed -i 's/"password": ""/"password": "'${MYSQL_PASSWORD}'"/g' $SHIN_BIN_DIR/conf.json
/usr/bin/nodejs camera.js
