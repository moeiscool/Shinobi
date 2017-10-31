#!/bin/bash
echo "========================================================="
echo "==!! Shinobi : The Open Source CCTV and NVR Solution !!=="
echo "========================================================="
echo "To answer yes type the letter (y) in lowercase and press ENTER."
echo "Default is no (N). Skip any components you already have or don't need."
echo "============="
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
echo "Shinobi - Do you want to Install FFMPEG?"
echo "(y)es or (N)o"
read ffmpeginstall
if [ "$ffmpeginstall" = "y" ]; then
    echo "Shinobi - Get FFMPEG 3.x from ppa:jonathonf/ffmpeg-3"
    sudo apt-get install software-properties-common python-software-properties -y
    sudo add-apt-repository ppa:jonathonf/ffmpeg-3 -y
    sudo apt update -y && sudo apt install ffmpeg libav-tools x264 x265 -y
fi
echo "============="
echo "Shinobi - Do you want to Install MariaDB? Choose No if you have MySQL or MariaDB already."
echo "(y)es or (N)o"
read mysqlagree
if [ "$mysqlagree" = "y" ]; then
    echo "Shinobi - Installing MariaDB"
    echo "Password for root SQL user, If you are installing SQL now then you may put anything:"
    read sqlpass
    echo "mariadb-server mariadb-server/root_password password $sqlpass" | debconf-set-selections
    echo "mariadb-server mariadb-server/root_password_again password $sqlpass" | debconf-set-selections
    sudo apt install mariadb-server -y
    sudo service mysql start
fi
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
    sudo mysql -u $sqluser -p$sqlpass -e "source sql/user.sql" || true
    sudo mysql -u $sqluser -p$sqlpass -e "source sql/framework.sql" || true
    echo "Shinobi - Do you want to create a new user for viewing and managing cameras in Shinobi? You can do this later in the Superuser panel."
    echo "(y)es or (N)o"
    read mysqlDefaultData
    if [ "$mysqlDefaultData" = "y" ]; then
        escapeReplaceQuote='\\"'
        groupKey=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 7 | head -n 1)
        userID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1)
        userEmail=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1)"@"$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1)".com"
        userPasswordPlain=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1)
        userPasswordMD5=$(echo   -n   "$userPasswordPlain" | md5sum | awk '{print $1}')
        userDetails='{"days":"10"}'
        userDetails=$(echo "$userDetails" | sed -e 's/"/'$escapeReplaceQuote'/g')
        echo $userDetailsNew
        apiIP='0.0.0.0'
        apiKey=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        apiDetails='{"auth_socket":"1","get_monitors":"1","control_monitors":"1","get_logs":"1","watch_stream":"1","watch_snapshot":"1","watch_videos":"1","delete_videos":"1"}'
        apiDetails=$(echo "$apiDetails" | sed -e 's/"/'$escapeReplaceQuote'/g')
        rm sql/default_user.sql || true
        echo "USE ccio;INSERT INTO Users (\`ke\`,\`uid\`,\`auth\`,\`mail\`,\`pass\`,\`details\`) VALUES (\"$groupKey\",\"$userID\",\"$apiKey\",\"$userEmail\",\"$userPasswordMD5\",\"$userDetails\");INSERT INTO API (\`code\`,\`ke\`,\`uid\`,\`ip\`,\`details\`) VALUES (\"$apiKey\",\"$groupKey\",\"$userID\",\"$apiIP\",\"$apiDetails\");" > "sql/default_user.sql"
        sudo mysql -u $sqluser -p$sqlpass --database ccio -e "source sql/default_user.sql" > "INSTALL/log.txt"
        echo "The following details will be shown again at the end of the installation."
        echo "====================================="
        echo "=======   Login Credentials   ======="
        echo "|| Username : $userEmail"
        echo "|| Password : $userPasswordPlain"
        echo "|| API Key : $apiKey"
        echo "====================================="
        echo "====================================="
        echo "** To change these settings login to either to the Superuser panel or login to the dashboard as the user that was just created and open the Settings window. **"
    fi
fi
echo "============="
echo "Shinobi - Install NPM Libraries"
sudo npm install
echo "============="
echo "Shinobi - Install PM2"
sudo npm install pm2 -g
if [ ! -e "./conf.json" ]; then
    sudo cp conf.sample.json conf.json
fi
if [ ! -e "./super.json" ]; then
    echo "Default Superuser : admin@shinobi.video"
    echo "Default Password : admin"
    sudo cp super.sample.json super.json
fi
echo "Shinobi - Finished"
sudo chmod -R 755 .
touch INSTALL/installed.txt
echo "=====================================" > INSTALL/installed.txt
echo "=======   Login Credentials   =======" >> INSTALL/installed.txt
echo "|| Username : $userEmail" >> INSTALL/installed.txt
echo "|| Password : $userPasswordPlain" >> INSTALL/installed.txt
echo "|| API Key : $apiKey" >> INSTALL/installed.txt
echo "=====================================" >> INSTALL/installed.txt
echo "=====================================" >> INSTALL/installed.txt
echo "Shinobi - Start Shinobi and set to start on boot?"
echo "(y)es or (N)o"
read startShinobi
if [ "$startShinobi" = "y" ]; then
    sudo pm2 start camera.js
    sudo pm2 start cron.js
    sudo pm2 startup
    sudo pm2 save
    sudo pm2 list
fi
echo "details written to INSTALL/installed.txt"
echo "====================================="
echo "=======   Login Credentials   ======="
echo "|| Username : $userEmail"
echo "|| Password : $userPasswordPlain"
echo "|| API Key : $apiKey"
echo "====================================="
echo "====================================="