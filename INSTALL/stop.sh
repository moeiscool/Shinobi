#!/bin/bash
if [ -e "INSTALL/installed.txt" ]; then
    echo "Stop Daemon with PM2?"
    echo "(y)es or (N)o"
    read daemon
    case $daemon in
    "y")
      echo "Stopping Shinobi"
      pm2 stop camera.js&&pm2 stop cron.js&&pm2 logs
      ;;
    *)
      echo "Stopping Shinobi not as daemon. Cron will not be stopped."
      PID=$(ps aux | grep "node camera.js" | grep -v grep | awk '{ print $2 }')
      if [ "${PID}" != "" ]
      then
        kill ${PID}
      fi
      ;;
    esac
fi
if [ ! -e "INSTALL/installed.txt" ]; then
    chmod +x INSTALL/now.sh&&INSTALL/now.sh
fi
