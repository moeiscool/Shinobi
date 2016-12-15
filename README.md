# Shinobi

Shinobi is an Open Source CCTV software written in Node.JS

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo.jpg?raw=true">

# What is Shinobi?

Shinobi is an Open Source CCTV software written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. Currently it is being crafted for IP Cameras, not local.

# Why?

- MJPEG streams that are presented as a DOM element puts serious strain on the client browser when needing to be removed and added again. They cannot be terminated without a hard refresh of the page or use of popup or iframe. It essentially opens new streams everytime you recreate an image with an MJPEG url.
    - Shinobi addresses this with `WebSocket` streams.

- Saving to WebM not JPEG frames or MP4 video. JPEG and MP4 are heavy. WebM is not.

- Written in Node.js, not PHP, Perl, and whatever languages you can remember.

- ZoneMinder was the first choice but it proved unstable for the reasons mentioned. Also it has so many bugs and bounties many of them are just being left behind in the ocean of bugs reports.

# Info

- Written in a simple structure. `camera.js` and `web` folder.
- Easy Install. (not as easy as apt-get install zoneminder yet though. See below)
- Streams are `img` tags, but not MJPEG. Images are transferred through `WebSocket`.
- Any websocket enabled browser can support the image stream (including mobile)
- Interface is nicer to look at and works better in mobile.

- Client-side Tested on : 
    - iPad Mini 2
        - Safari
        - Chrome
    - Windows 7
        - Chrome
    - Mac OS
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


`Dont have Node.js installed?`.

- Ubuntu
    - Open `Terminal`.
    - Install Node.js and it's package manager `apt-get install nodejs npm`.
        - note: `apt-get install node` installs something else, not Node.js.
    - Create a symlink to use nodejs `ln -s /usr/bin/nodejs /usr/bin/node`.
        - pm2 needs this. If you don't plan on using pm2, then ignore this step.

- Not on Ubuntu? Other operating systems can be found here.
    - https://nodejs.org/en/download/package-manager/


`Dont have MySQL installed?`.

- Open `Terminal`.
    - Ubuntu : `apt-get install mysql-server`.
    - Mac OS (will need more techiness ironically, follow this link) : https://blog.joefallon.net/2013/10/install-mysql-on-mac-osx-using-homebrew/ .


`Application Install`.

- Open `Terminal`.

- Select directory `cd /your/directory/for/shinobi`. Where `camera.js` is located.

- Go to `sql` and install the SQL files in your database. `Framework` then `Default Data`. Return to main directory. Then setup `conf.json` with your SQL details. 

- run `npm install` while in the main directory. This will install the libraries Shinobi needs.

- To start `node camera.js`

- open up `localhost` in your browser. Login with `Username : ccio@m03.ca , Password : password`.

- to daemonize the process install pm2 with `npm install pm2 -g` then run `pm2 start camera.js`
    - run `pm2 logs` to see the console for any errors.

# To Do

- Organize this README.
- Fix Pipe error that occasionally occurs. `(appears to be caused by JPEG stream emit or pipe into ffmpeg, MJPEG is not affected)`
- better vieweing for saved events.
- Save events with blank frames and force real duration instead of based on frame count.
- better mobile support.

# Donate

If you like what I am doing here and want me to continue please consider donating :)

- Quick Links on the site page : https://moeiscool.github.io/Shinobi/

<a href='https://pledgie.com/campaigns/33051'><img alt='Click here to lend your support to: Shinobi, Open Source CCTV written in Node.js and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/33051.png?skin_name=chrome' border='0' ></a>

- PayPal : paypal@m03.ca
- Patreon : https://patreon.com/moeiscool
- Please note : donating directly through paypal will show more support :)

# Author

Moe Alam, just a guy who needed CCTV

# Want me to Host an Instance for you?
email me at : shinobi@m03.ca

    You would get:
    +50GB SSD
    +2GB RAM
    +Quad Core ARM Processor
    +200Mbps Default Throughput, Soft-Max 800Mbps Throughput per Server
    +Static IP
    +Location : Italy
    ----------
    $55/month

    Optional
    +1000GB = +$75/month

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