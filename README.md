# Shinobi

Shinobi is an Open Source CCTV software written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. Currently it is being crafted for IP Cameras, not local.

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo.gif?raw=true">

# Why?

- MJPEG streams that are presented as a DOM element puts serious strain on the client browser when needing to be removed and added again. They cannot be terminated without a hard refresh of the page or use of popup or iframe. It essentially opens new streams everytime you recreate an image with an MJPEG url.
    - Shinobi addresses this with `WebSocket` streams.

- <s>Saving to WebM not JPEG frames or MP4 video. JPEG and MP4 are heavy. WebM is not.</s>
    - Now Saves to WebM and MP4, your choice. RTSP -> MP4 uses very little CPU power but uses a lot of storage space. MP4 is still heavy.

- Written in Node.js, not PHP, Perl, and whatever languages you can remember.

- ZoneMinder was the first choice but it proved unstable for the reasons mentioned. Also it has so many bugs and bounties many of them are just being left behind in the ocean of bug reports.

# Info

- Written in a simple structure. `camera.js` and `web` folder.
- Easy Install. (not as easy as apt-get install zoneminder yet though. See below)
- Streams are `img` tags transferred through `WebSocket`.
- Any websocket enabled browser can support the image stream (including mobile)
- Can save to WebM or MP4
- Calendar view for Events
- `child.js` Child node processing to load balance ffmpeg processes across multiple nodes. *Work in Progress, needs h264 added and schema update*

- Client-side Tested on : 
    - iPad Mini 2
        - Safari
        - Chrome
    - iPhone 5
        - Safari
        - Chrome
    - Windows 7
        - Chrome
    - Mac OS Sierra
        - Safari
        - Chrome


- Server-side Tested on:
    - Macbook (some old white one)
        - Ubuntu 16.04 (should work on any linux)
    - Macbook (2013, i5, 16GB RAM)
        - Mac OS Sierra
        
- If you have successfully run Shinobi on a system not listed (client or server). Please send me a PM so I can add it to the list.

# How to Install and Run

*For a Test deployment enviroment I suggest grabbing an old MacBook (what I did) and installing Node.JS on there. Open up Terminal to get started.*

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

17. Open up `http://localhost` in your browser.
    - If you inserted the `default_data.sql` login with `Username : ccio@m03.ca` and `Password : password`.
    - *Note :* if you are installed on a remote computer open up the IP instead `http://111.111.111.111` in your browser.

<b>Optional for some OS</b>

- Install dstat :
    ```
    apt-get install dstat
    ```
    - It's the CPU indicator, the orange progress bar on the web panel.
    - if you choose not to install or can't then it will just post an error in the log.
    - Sadly there is no dstat for Mac OS.

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

# To Do

- Organize this README.
- Fix Pipe error that occasionally occurs. `(appears to be caused by JPEG stream emit or pipe into ffmpeg, MJPEG is not affected)`
- better vieweing for saved events.
- Save events with blank frames and force real duration instead of based on frame count.
- better mobile support.
- Find alternative to dstat that works on windows, mac, and linux for CPU indicator.

# Donate

If you like Shinobi please consider donating.

<a title="USD,XBT..." href='https://www.bountysource.com/teams/shinobi'><img src='https://d2bbtvgnhux6eq.cloudfront.net/assets/Bountysource-green-f2f437ed727ee2cacaee3f559c1907cb.png' ></a>

<a title="CAD" href='https://pledgie.com/campaigns/33051'><img alt='Click here to lend your support to: Shinobi, Open Source CCTV written in Node.js and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/33051.png?skin_name=chrome' border='0' ></a>

# Author

Moe Alam, just a guy who needed CCTV

# Credits

If you wish to use this software for commercial purposes please consider donating :) If not.. including my name would be nice.

    Shinobi
    Copyright (C) 2016-2025 Moe Alam, moeiscool

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    # Libraries Used
    
    vbox.css (the framework that does the vertical panel layout) - I honestly don't know who made this, i found it in a zip.
    jQuery - http://jquery.com/
    Socket.io - http://socket.io/
    Bootstrap - http://getbootstrap.com/
    Moment.js - http://momentjs.com/
    Livestamp.js - https://mattbradley.github.io/livestampjs/
    Font Awesome - http://fontawesome.io/
    Node.js - https://nodejs.org
    MySQL - https://www.mysql.com/
    NPM: mysql - https://www.npmjs.com/package/mysql
    NPM: crypto - https://www.npmjs.com/package/crypto
    NPM: express - http://expressjs.com/
    NPM: request - https://www.npmjs.com/package/request
    NPM: connection-tester - https://www.npmjs.com/package/connection-tester
    
    
    and maybe a few others.
    