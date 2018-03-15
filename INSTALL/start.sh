#!/bin/bash
if [ -e "INSTALL/installed.txt" ]; then
    echo "Starting Shinobi"
    pm2 start camera.js
    pm2 start cron.js
fi
if [ ! -e "INSTALL/installed.txt" ]; then
    chmod +x INSTALL/now.sh&&INSTALL/now.sh
fi