# Shinobi

<center>
<a href="https://www.youtube.com/user/MrMoea92">YouTube</a> - <a href="https://shinobicctv.herokuapp.com/">Slack</a> - <a href="https://twitter.com/ShinobiCCTV">Twitter</a> - <a href="https://www.facebook.com/Shinobi-1223193167773738/?ref=bookmarks">Facebook</a> - <a href="https://www.reddit.com/r/ShinobiCCTV/">Reddit</a> - <a href="https://shinobi.video/docs/donate"><b>Donate</b></a>
</center>

Shinobi is the Open Source CCTV platform written in Node.JS. Designed with multiple account system, Streams by WebSocket, and Save to WebM. Shinobi can record IP Cameras and Local Cameras.

Shinobi is not made by the current or previous ZoneMinder developers. This app is inspired by ZoneMinder and all it's glory.

<img src="https://github.com/moeiscool/Shinobi/blob/master/web/libs/img/demo5.jpg?raw=true">

# Key Aspects

- Records IP Cameras and Local Cameras
- Streams by WebSocket, HLS (includes audio), and MJPEG
- Save to WebM and MP4
  - Can save Audio
- Push Events - When a video is finished it will appear in the dashboard without a refresh
- Region Motion Detection (Similar to ZoneMinder Zone Detection)
  - Represented by a Motion Guage on each monitor
- 1 Process for Each Camera to do both, Recording and Streaming
- Timeline for viewing Motion Events and Videos
- Sub-Accounts with permissions
  - Monitor Viewing
  - Monitor Editing
  - Video Deleting
  - Separate API keys for sub account
- Cron Filters can be set based on master account
- Stream Analyzer built-in (FFprobe GUI)
- Monitor Groups
- Can snapshot images from stream directly
- Lower Bandwith Mode (JPEG Mode)
  - Snapshot (cgi-bin) must be enabled in Monitor Settings
- Control Cameras from Interface
- API
  - Get videos
  - Get monitors
  - Change monitor modes : Disabled, Watch, Record
  - Embedding streams
- Dashboard Framework made with Google Material Design Lite, jQuery, and Bootstrap

## Help make Shinobi the best Open Source CCTV Solution.
<a href="https://shinobi.video/docs/donate">Donate</a>

As much as Shinobi is free, development and research is not. Please consider supporting Shinobi.

**Paid Support / Donation :** <a href="http://cloudchat.online/cart/shinobi/">from @moeiscool, The Lead Developer</a></p>

# Why make this?

https://github.com/moeiscool/Shinobi/wiki#why-make-this-other-solutions-already-exist

# More about Shinobi in the Wiki

https://github.com/moeiscool/Shinobi/wiki

# Supported Cameras

https://github.com/moeiscool/Shinobi/wiki/Supported-Cameras


# Supported Systems

https://github.com/moeiscool/Shinobi/wiki/Supported-Systems

# How to Install and Run

<a href="https://github.com/moeiscool/Shinobi/wiki/Install">Installation Tutorials</a>

<a href="https://github.com/moeiscool/Shinobi/wiki/Troubleshooting">Troubleshooting Guide</a>

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
    
    vbox.css (Classic Dashboard) - An unknown but seriously awesome dev
    Material Design Lite (V2 Dashboard) - https://github.com/google/material-design-lite
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
    