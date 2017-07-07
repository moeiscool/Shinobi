#!/bin/bash
if [ ! -e "INSTALL/installed.txt" ]; then
    chmod +x INSTALL/now.sh&&INSTALL/now.sh
fi
if [ -e "INSTALL/installed.txt" ]; then
    echo "Start as Daemon with PM2?"
    read daemon
    case $oschoicee in
    "y")
    echo "Starting Shinobi"
    pm2 start camera.js&&pm2 start cron.js&&pm2 logs
      ;;
    *)
    echo "Starting Shinobi not as daemon. Cron will not be started."
    node camera.js
      ;;
    esac
fi