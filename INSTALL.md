Find videos about Shinobi on YouTube : https://www.youtube.com/user/MrMoea92

# Windows, Linux, Mac OS : VirtualBox

- You know what to do with this if you know what VirtualBox is.
    - Shinobi-12-24-2016.ova
    https://mega.nz/#!rkZQHQBT!9gTBRwUU5UGpOvtBUAMUUVAJhEaW5zrDMs8MgaN1JNo
        - `Username : shinobi`
        - `Password : night`

1. Once logged in 

    ```
    cd shinobi
    ```

2. Start server.
    
    ```
    pm2 start camera.js
    ```
    
3. Open up `http://localhost:8080` in your browser.
    - *Note :* if you are installed on a remote computer open up the IP in your web browser.
        - `Username : ccio@m03.ca`
        - `Password : password`

- To get your IP you can run the following command.

    ```
    ifconfig
    ```

# Ubuntu 16.04 : The Easier Way

<b>VIDEO TUTORIAL :</b> https://www.youtube.com/watch?v=CZSKV5gRd90

1. Open `Terminal`.

2. Download Shinobi with `wget` if you don't have `git` installed.
    - Do this only if you haven't already downloaded the files.

    ```
    wget https://github.com/moeiscool/Shinobi/tarball/master
    ```

3. Untar the downloaded file. The extracted directory is the shinobi directory.

    ```
    tar -xzf master
    ```

4. Rename the directory for easier access. The extracted folder name will be different. `moeiscool-Shinobi-XXXXXXX` is only an example.

    ```
    mv moeiscool-Shinobi-XXXXXXX shinobi
    ```
    
5. Open Shinobi directory.

    ```
    cd shinobi
    ```
    
6. Make INSTALL.sh an executable file.

    ```
    chmod +x INSTALL.sh
    ```
    
7. Execute `INSTALL.sh`. Run :

    ```
    ./INSTALL.sh
    ```
    
8. Packages will be installed. MySQL will ask to create a password on first installation.

9. Then the installer will ask you for the credentials created. The default username is usually `root`.

10. After installation is complete

    ```
    pm2 start camera.js
    ```

17. Open up `http://localhost:8080` in your browser.
    - *Note :* if you are installed on a remote computer open up the IP in your web browser.
        - `Username : ccio@m03.ca`
        - `Password : password`

- To get your IP you can run the following command.

    ```
    ifconfig
    ```


# Ubuntu 16.04 : The Harder Way

<b>VIDEO TUTORIAL :</b> https://www.youtube.com/watch?v=jfgUNfVEEEc

<b>Dont have FFMPEG installed?</b>

1. Open `Terminal`.
2. To install :

    ```
    apt-get install ffmpeg
    ```
    - If that doesn't work try :

    ```
    apt-get install libav-tools
    ```

<b>Dont have Node.js installed?</b>

1. Open `Terminal`.
2. Install Node.js and it's package manager
    - *Note :* `#apt-get install node` installs something else, not Node.js.

    ```
    apt-get install nodejs npm
    ```
3. Create a symlink to use nodejs.
    - pm2 needs this. If you don't plan on using pm2, then ignore this step.
    
    ```
    ln -s /usr/bin/nodejs /usr/bin/node
    ```
4. Not on Ubuntu? Other operating systems can be found here.
    - https://nodejs.org/en/download/package-manager/


<b>Dont have MySQL installed?</b>

1. Open `Terminal`. Run :

    ```
    apt-get install mysql-server
    ```
2. Installation of MySQL prompt you to set a password for `root` user in MySQL on your first install.


- Mac OS (will need more techiness ironically, follow this link) : https://blog.joefallon.net/2013/10/install-mysql-on-mac-osx-using-homebrew/ .


<b>Application Install</b>

1. Open `Terminal`.

2. Download Shinobi with `wget` if you don't have `git` installed.
    - Do this only if you haven't already downloaded the files.

    ```
    wget https://github.com/moeiscool/Shinobi/tarball/master
    ```

3. Untar the downloaded file. The extracted directory is the shinobi directory.

    ```
    tar -xzf master
    ```

4. Rename the directory for easier access. The extracted folder name will be different. `moeiscool-Shinobi-XXXXXXX` is only an example.

    ```
    mv moeiscool-Shinobi-XXXXXXX shinobi
    ```

5. Set permissions on the shinobi directory. *Where `camera.js` is located.*

    ```
    chmod -R 755 shinobi
    ```

6. Open Shinobi directory.

    ```
    cd shinobi
    ```
<b>Setup SQL</b>
    
7. Go to `sql` and install the SQL files in your database.

    ```
    cd sql
    ```

8. Terminal SQL client can be accessed by running :
    - The password will have been set during the installation of MySQL.

    ```
    mysql -u root -p
    ```

9. *OPTIONAL :* Create New SQL User with privileges. If you choose to use your own pre-defined credentials skip this step.

    ```
    source ./user.sql
    ```
    - or create your own

    ```
    CREATE USER 'majesticflame'@'127.0.0.1' IDENTIFIED BY '';
    GRANT ALL PRIVILEGES ON * . * TO 'majesticflame'@'127.0.0.1';
    FLUSH PRIVILEGES;
    ```
        
10. while still in the SQL client. Install the Shinobi database. It will create a database called `ccio`.
    ```
    source ./framework.sql
    ```
11. *OPTIONAL :* `default_data.sql` contains a demo user and a demo `rtsp to mp4` monitor.

    ```
    source ./default_data.sql
    ```

12. After importing the data. Exit the sql client.

    ```
    exit
    ```
    
13.  Go up one directory to enter the main directory. *Where `camera.js` is located.* 

    ```
    cd ..
    ```

14. Edit `conf.json` to reflect your sql credentials. I don't reccommend using root.
    
    ```
    nano conf.json
    ```
    - Contents of default `conf.json` file, located in the main directory.

    ```
    {"host":"127.0.0.1","user":"majesticflame","password":"","database":"ccio"}
    ```
<b>Install Libraries</b>

15. Run `npm install` while in the main directory. This will install the libraries Shinobi needs.

    ```
    npm install
    ```
    
    - Can't get `npm install` to work? Try downloading this, the required node libraries already built. Place the `node_modules` folder in the same directory as `camera.js`.
        - https://mega.nz/#!upRRnRhD!RZSqKMnXYyvpeo_pg5loNpxBz3yFNXqQAo8bvKaqy1Y
        
<b>Launch Shinobi</b>

16. To start :
    ```
    node camera.js
    ```
    - If you did not make the symlink for nodejs then you must run `nodejs camera.js` instead.

17. Open up `http://localhost:8080` in your browser.
    - *Note :* if you are installed on a remote computer open up the IP in your web browser.
        - `Username : ccio@m03.ca`
        - `Password : password`

- To get your IP you can run the following command.

    ```
    ifconfig
    ```

<b>Optional for some OS</b>

- To daemonize the process install pm2 with 
    ```
    npm install pm2 -g
    ```
    then to start : 
    ```
    pm2 start camera.js
    ```
    - run `pm2 logs` to see the console for any errors.
    - `forever` is another program to daemonize, but i've had more success with `pm2`.

# How to Update

- Overwrite old files.

`SQL Database`

- *Rare, please ensure that your structure is actually out of date before doing this.*

- Backup your SQL data.

- Run `framework.sql` in your mysql client.