# Shinobi

<center>
<a href="https://www.youtube.com/user/MrMoea92">YouTube</a> - <a href="https://shinobicctv.herokuapp.com/">Slack</a> - <a href="https://twitter.com/ShinobiCCTV">Twitter</a> - <a href="https://www.facebook.com/Shinobi-1223193167773738/?ref=bookmarks">Facebook</a> - <a href="https://www.reddit.com/r/ShinobiCCTV/">Reddit</a> - <a href="https://www.bountysource.com/teams/shinobi">Bountysource</a> - <a href="https://pledgie.com/campaigns/33051">Pledgie</a> - <a href="https://gratipay.com/~moe_alam/">GratiPay</a>
</center>

Shinobi is an Open Source CCTV software written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. <s>Currently it is being crafted for IP Cameras, not local</s>.
Shinobi can record IP Cameras and Local Cameras.

# Key Aspects

- Written in a simple structure. `camera.js` and `web` folder.
- Streams are transferred through `WebSocket`. DOM element is an `canvas` tag.
- Any websocket enabled browser can support the image stream (including mobile)
- Can save to WebM or MP4 *(Your version of FFMPEG must have libvpx and libx264)*
- No Mootools (yes, you can shake my hand later)
- Calendar view for Events

# More about Shinobi in the Wiki

https://github.com/moeiscool/Shinobi/wiki

# Supported Cameras

https://github.com/moeiscool/Shinobi/wiki/Supported-Cameras

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo.gif?raw=true">

# Supported Systems

- https://github.com/moeiscool/Shinobi/wiki/Supported-Systems

# How to Install and Run

- https://github.com/moeiscool/Shinobi/blob/master/INSTALL.md

# To Do

- Fix Pipe error that occasionally occurs. `(appears to be caused by JPEG stream emit or pipe into ffmpeg, MJPEG is not affected)` - this will be addressed by segmenting feature.
- Save events with blank frames and force real duration instead of based on frame count.
- better mobile support.

# Help Shinobi

If you like Shinobi please check out some ways you can help <a href="https://github.com/moeiscool/Shinobi/wiki/Support-Shinobi">Support Shinobi</a>.

# Author

Moe Alam

Follow me on Twitter https://twitter.com/moe_alam

<a title="Find me on Slack, Get an Invite" href="https://shinobicctv.herokuapp.com/"><img src="https://camo.githubusercontent.com/5843e066b5f0a7b5ff5942921aedcbac70766ed5/68747470733a2f2f612e736c61636b2d656467652e636f6d2f35656230302f696d672f6c616e64696e672f77686572655f776f726b5f68617070656e732f6c6f676f2d6461726b2d626c75652e706e67"></a>

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
    