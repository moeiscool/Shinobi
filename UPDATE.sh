#!/bin/bash
rm -rf master master_temp
wget https://github.com/moeiscool/Shinobi/tarball/master
mkdir master_temp
tar -xzf master -C master_temp --strip-components=1
rm -rf camera.js web UPDATE.sh package.json cron.js
pm2 stop camera.js
pm2 stop cron.js
pm2 kill
mv master_temp/UPDATE.sh UPDATE.sh
chmod +x UPDATE.sh
mv master_temp/web web
mv master_temp/package.json package.json
mv master_temp/camera.js camera.js
mv master_temp/cron.js cron.js
npm install
rm -rf master master_temp
pm2 start camera.js
pm2 start cron.js
