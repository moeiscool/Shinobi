#!/bin/bash
echo "Shinobi - Updating"
yum update -y
echo "Shinobi - Get dependencies"
#Install EPEL Repo
yum install epel-release -y
#Enable Nux Dextop repo for FFMPEG
rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-1.el7.nux.noarch.rpm
yum install ffmpeg ffmpeg-devel nodejs npm -y
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
echo "Shinobi - Do you want to Install MariaDB?"
echo "(y)es or (N)o"
read mysqlagree
if [ "$mysqlagree" = "y" ]; then
    yum install mariadb mariadb-server -y
    #Start mysql and enable on boot
    systemctl start mariadb
    systemctl enable mariadb
    #Run mysql install
    mysql_secure_installation
fi
echo "Shinobi - Linking node to nodejs"
ln -s /usr/bin/nodejs /usr/bin/node
chmod -R 755 .
echo "============="
echo "Shinobi - Database Installation"
echo "(y)es or (N)o"
read mysqlagreeData
if [ "$mysqlagreeData" = "y" ]; then
    echo "What is your SQL Username?"
    read sqluser
    echo "What is your SQL Password?"
    read sqlpass
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
npm install pm2 -g
if [ ! -e "./conf.json" ]; then
    cp conf.sample.json conf.json
fi
if [ ! -e "./super.json" ]; then
    echo "Default Superuser : admin@shinobi.video"
    echo "Default Password : admin"
    cp super.sample.json super.json
fi
echo "Shinobi - Finished"
echo "Shinobi - Start Shinobi?"
echo "(y)es or (N)o"
read startShinobi
if [ "$startShinobi" = "y" ]; then
    pm2 start camera.js
    pm2 start cron.js
    pm2 list
fi