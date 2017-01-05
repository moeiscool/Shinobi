# Shinobi

<center>
<a href="https://www.youtube.com/user/MrMoea92">YouTube</a> - <a href="https://discord.gg/mdhmvuH">Discord</a> - <a href="https://twitter.com/ShinobiCCTV">Twitter</a> - <a href="https://www.facebook.com/Shinobi-1223193167773738/?ref=bookmarks">Facebook</a> - <a href="https://www.reddit.com/r/ShinobiCCTV/">Reddit</a> - <a href="https://www.bountysource.com/teams/shinobi">Bountysource</a> - <a href="https://pledgie.com/campaigns/33051">Pledgie</a> - <a href="https://www.gofundme.com/help-me-fund-my-program">GoFundMe</a> - <a href="https://gratipay.com/~moe_alam/">GratiPay</a>
</center>

Shinobi is an Open Source CCTV software written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. <s>Currently it is being crafted for IP Cameras, not local</s>.
Shinobi can record IP Cameras and Local Cameras.

# Supported Cameras

- https://github.com/moeiscool/Shinobi/wiki/Supported-Cameras

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo.gif?raw=true">

# Why make this? Other solutions already exist.

ZoneMinder was the first choice but it proved unstable. A few reasons are mentioned below. Solutions such as ispyconnect are not relevant as they have a cost for using their platform.

- *MJPEG streams are beyond unusable in modern applications.*
    - Essentially with MJPEG you are opening a new stream everytime you create an image with an MJPEG url. Even if you remove this element it will continue to eat resources from the server and client. Only way to deal with it currently is through an `iframe` or `popup`. Neither of which should be considered acceptable.
    - Shinobi addresses this with `WebSocket` streams. As frames are captured by FFMPEG they are base64 encoded and sent to the client.
    
- *JPEG Storage is just a terrible idea.*
    - Saving each frame as a separate file in JPEG format can have a seriously detrmental effect on storage space and the hardware itself. Hardware is more likely to fail under the stress of continuously saving frames to storage.
    - Shinobi saves to WebM and MP4 files. While MP4 takes a fair amount of space.. its level of CPU usage during encoding for H.264 streams is just amazing.

- *Using languages that are not needed.*
    - You'll find that ZoneMinder uses multiple languages to achieve very small results. This probably just because of the time it was written in... but with that said all the devs currently working on it should have addressed these issues and removed unecessary steps, languages, and files. ZoneMinder uses Perl, PHP, JavaScript, C, HTML, CSS, MySQL, and probably more.
    - Shinobi uses JavaScript, HTML, CSS, and MySQL. Simple right? It should be.

# Info

- Written in a simple structure. `camera.js` and `web` folder.
- Streams are transferred through `WebSocket`. DOM element is an `img` tag.
- Any websocket enabled browser can support the image stream (including mobile)
- Can save to WebM or MP4 *(Your version of FFMPEG must have libvpx and libx264)*
- No Mootools (yes, you can shake my hand later)
- Calendar view for Events

# Supported Systems

- https://github.com/moeiscool/Shinobi/wiki/Supported-Systems

# How to Install and Run

- https://github.com/moeiscool/Shinobi/blob/master/INSTALL.md

# To Do

- Fix Pipe error that occasionally occurs. `(appears to be caused by JPEG stream emit or pipe into ffmpeg, MJPEG is not affected)` - this will be addressed by segmenting feature.
- Save events with blank frames and force real duration instead of based on frame count.
- better mobile support.

# Donate

If you like Shinobi please consider donating.

<a title="USD,XBT..." href='https://www.bountysource.com/teams/shinobi'><img src='https://d2bbtvgnhux6eq.cloudfront.net/assets/Bountysource-green-f2f437ed727ee2cacaee3f559c1907cb.png' ></a> <a title="CAD" href='https://gratipay.com/~moe_alam/'><img alt='Click here to lend your support to: Shinobi, Open Source CCTV written in Node.js and make a donation!' src='https://assets.gratipay.com/gratipay.svg?etag=3tGiSB5Uw_0-oWiLLxAqpQ~~' border='0' ></a> <a href='https://pledgie.com/campaigns/33051'><img alt='Click here to lend your support to: Shinobi, Open Source CCTV written in Node.js and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/33051.png?skin_name=chrome' border='0' ></a> <a target="_blank" class="badge-widget" style="border: none;" href="//www.gofundme.com/help-me-fund-my-program?utm_medium=wdgt" title="Visit this page now."><img src="https://funds.gofundme.com/css/3.0_donate/green/widget.png"></a>

# Author

Moe Alam
https://twitter.com/moe_alam
Find me on <a href="https://discord.gg/mdhmvuH">Discord</a>! :) 

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
    