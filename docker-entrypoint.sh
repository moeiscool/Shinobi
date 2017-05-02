#!/bin/bash -e
SHIN_BIN_DIR=/opt/shinobi
source $SHIN_BIN_DIR/docker.env

cd /opt/shinobi


if [ ! -e /etc/shinobi/conf.json ]; then
	cp conf.sample.json /etc/shinobi/conf.json
	sed -i "s/\"user\": \"majesticflame\"/\"user\": \"${MYSQL_USER}\"/g" /etc/shinobi/conf.json
	sed -i "s/\"password\": \"\"/\"password\": \"${MYSQL_PASSWORD}\"/g" /etc/shinobi/conf.json
	sed -i 's/"host": .*/"host": "mysql",/g' /etc/shinobi/conf.json
fi
if [ ! -e /etc/shinobi/super.json ]; then
	cp super.sample.json /etc/shinobi/super.json
fi

cat /opt/shinobi/conf.json
cat /opt/shinobi/super.json

# TODO: figure out how to prevent this initial delay on first run
sleep 25

C=`echo "show tables" | mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h mysql $MYSQL_DATABASE | wc -l`
echo "Table count: $C"
if [ "$C" == "0" ]; then
	echo "Initializing tables"
	mysql -u root -p${MYSQL_ROOT_PASSWORD} -h mysql < /opt/shinobi/sql/framework.sql
fi

C=`echo "select * from Users" | mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h mysql $MYSQL_DATABASE | wc -l`
echo "User count: $C"
if [ "$C" == "0" ]; then
	echo "Creating initial dataset"
	mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h mysql $MYSQL_DATABASE < /opt/shinobi/sql/default_data.sql
fi


n stable

pm2 start /opt/shinobi/cron.js
pm2 start /opt/shinobi/camera.js
#pm2 start /opt/shinobi/plugins/motion/shinobi-motion.js
pm2 logs