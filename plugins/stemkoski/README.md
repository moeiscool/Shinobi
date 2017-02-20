# Shinobi stemkoski Motion Detector
Based on <a href="https://stemkoski.github.io/Three.js/Webcam-Motion-Detection.html">stemkoski JS Motion Detection</a>

Install required libraries.

**Ubuntu and Debian only**

```
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

**CentOS only**

```
su -c 'yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel'
yum search arial
yum install liberation-sans-fonts.noarch
```

**Install the Node.js Canvas engine**

```
sudo npm install canvas
```

Copy the config file.

```
cp conf.sample.json conf.json
```

Edit it the new file. Host should be `localhost` and port should match the `listening port for camera.js`.

```
nano conf.json
```


```
Thanks to Cairo and others for these dependencies. Thanks to stemkoski as the JS image comparing is based on their research.

Shinobi Plugin by : Moe Alam
```