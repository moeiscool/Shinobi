# Shinobi

<center>
<a href="https://gitter.im/Shinobi-CCTV/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link">Gitter</a> - <a href="https://twitter.com/ShinobiCCTV">Twitter</a> - <a href="https://www.facebook.com/Shinobi-1223193167773738/?ref=bookmarks">Facebook</a> - <a href="https://www.reddit.com/r/ShinobiCCTV/">Reddit</a> - <a href="https://www.bountysource.com/teams/shinobi">Bountysource</a> - <a href="https://pledgie.com/campaigns/33051">Pledgie</a> - <a href="https://www.gofundme.com/help-me-fund-my-program">GoFundMe</a>
</center>

Shinobi is an Open Source CCTV software written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. Currently it is being crafted for IP Cameras, not local.

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo.gif?raw=true">

# Why?

- MJPEG streams that are presented as a DOM element puts serious strain on the client browser when needing to be removed and added again. They cannot be terminated without a hard refresh of the page or use of popup or iframe. It essentially opens new streams everytime you recreate an image with an MJPEG url.
    - Shinobi addresses this with `WebSocket` streams.

- <s>Saving to WebM not JPEG frames or MP4 video. JPEG and MP4 are heavy. WebM is not.</s>
    - Now Saves to WebM and MP4, your choice. RTSP -> MP4 uses very little CPU power but uses a lot of storage space. MP4 is still heavy.

- Written in Node.js, not PHP, Perl, and whatever languages you can remember.

- ZoneMinder was the first choice but it proved unstable for the reasons mentioned. Also it has so many bugs and bounties many of them are just being left behind in the ocean of bug reports.

# Supported Cameras

- https://github.com/moeiscool/Shinobi/wiki/Supported-Cameras

# Info

- Written in a simple structure. `camera.js` and `web` folder.
- Easy Install. (not as easy as apt-get install zoneminder yet though. See below)
- Streams are transferred through `WebSocket`. DOM element is an `img` tag.
- Any websocket enabled browser can support the image stream (including mobile)
- Can save to WebM or MP4
- No Mootools (yes, you can shake my hand later)
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

- https://github.com/moeiscool/Shinobi/blob/master/INSTALL.md

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
    image : shinobi.jpg - the background image on the front page is not mine, there were no credits where i found it. it just looks cool :D
    
    and maybe a few others.
    