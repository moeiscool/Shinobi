#!/bin/sh
set -e

cp /opt/shinobi/conf.sample.json /opt/shinobi/conf.json
cp /opt/shinobi/super.sample.json /opt/shinobi/super.json
cp /opt/shinobi/plugins/motion/conf.sample.json /opt/shinobi/plugins/motion/conf.json

ADMIN_PASSWORD_MD5=$(echo -n "${ADMIN_PASSWORD}" | md5sum | sed -e 's/  -$//')

#set config data from variables
sed -i -e 's/"user": "majesticflame"/"user": "'"${MYSQL_USER}"'"/g' \
       -e 's/"password": ""/"password": "'"${MYSQL_PASSWORD}"'"/g' \
       -e 's/"host": "127.0.0.1"/"host": "'"${MYSQL_HOST}"'"/g' \
       -e 's/"database": "ccio"/"database": "'"${MYSQL_DATABASE}"'"/g' \
       "/opt/shinobi/conf.json"
# Set the admin password
sed -i -e "s/21232f297a57a5a743894a0e4a801fc3/${ADMIN_PASSWORD_MD5}/" "/opt/shinobi/super.json"

# Execute Command
exec "$@"
