#!/bin/bash
echo "Shinobi - Do you want to Install Node.js?"
echo "(y)es or (N)o"
read nodejsinstall
if [ "$nodejsinstall" = "y" ]; then
    wget https://deb.nodesource.com/setup_8.x
    chmod +x setup_8.x
    ./setup_8.x
    sudo apt install nodejs -y
fi
echo "============="
echo "Shinobi - Get FFMPEG 3.x from ppa:jonathonf/ffmpeg-3"
sudo add-apt-repository ppa:jonathonf/ffmpeg-3 -y
sudo apt update -y && sudo apt install ffmpeg libav-tools x264 x265 -y
echo "============="
echo "Shinobi - Do you want to Install MariaDB? Choose Mo if you have MySQL."
echo "(y)es or (N)o"
read mysqlagree
if [ "$mysqlagree" = "y" ]; then
    echo "Shinobi - Installing MariaDB"
    echo "Password for root SQL user, If you are installing SQL now then you may put anything:"
    read sqlpass
    echo "mariadb-server mariadb-server/root_password password $sqlpass" | debconf-set-selections
    echo "mariadb-server mariadb-server/root_password_again password $sqlpass" | debconf-set-selections
    apt install mariadb-server -y
    service mysql start
fi
chmod -R 755 .
echo "============="
echo "Shinobi - Database Installation"
echo "(y)es or (N)o"
read mysqlagreeData
if [ "$mysqlagreeData" = "y" ]; then
    if [ "$mysqlagree" = "y" ]; then
        sqluser="root"
    fi
    if [ ! "$mysqlagree" = "y" ]; then
        echo "What is your SQL Username?"
        read sqluser
        echo "What is your SQL Password?"
        read sqlpass
    fi
    mysql -u $sqluser -p$sqlpass -e "source sql/user.sql" || true
    mysql -u $sqluser -p$sqlpass -e "source sql/framework.sql" || true
    echo "Shinobi - Do you want to Install Default Data (default_data.sql)?"
    echo "(y)es or (N)o"
    read mysqlDefaultData
    if [ "$mysqlDefaultData" = "y" ]; then
        echo "Default Username : ccio@m03.ca"
        echo "Default Password : password"
        mysql -u $sqluser -p$sqlpass --database ccio -e "source sql/default_data.sql" || true
    fi
fi
echo "============="
echo "Shinobi - Install NPM Libraries"
npm install
echo "============="
echo "Shinobi - Install PM2"
sudo npm install pm2 -g
if [ ! -e "./conf.json" ]; then
    cp conf.sample.json conf.json
fi
if [ ! -e "./super.json" ]; then
    echo "Default Superuser : admin@shinobi.video"
    echo "Default Password : admin"
    cp super.sample.json super.json
fi
echo "Shinobi - Finished"
touch INSTALL/installed.txt
echo "Shinobi - Start Shinobi?"
echo "(y)es or (N)o"
read startShinobi
if [ "$startShinobi" = "y" ]; then
    pm2 start camera.js
    pm2 start cron.js
    pm2 list
fi