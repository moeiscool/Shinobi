# Shinobi

Shinobi is an Open Source CCTV software written in Node.JS

# Why?

Most people probably first think of ZoneMinder when they look to open-source CCTV software. Frankly from my point of view zm has been nothing but a pain. It eats resources when it doesn't have to.

-MJPEG stream that are presented in the browser. They cannot be terminated without a hard refresh of the page... or by putting it in and iframe or popup as the writers of the zm community have done.

This method puts serious strain on the client browser. zm has caused countless browser crashes while just viewing multiple streams.

-It also by default records to JPEG.. if video formats are desired one must install bleeding edge or branches of the main software. Then being left with even less support and more of a mess than previous.

-zm has so many bugs and bounties many of them are just being left behind in the ocean of bugs reports.

# Shinobi is the solution to ZoneMinder's short comings.

*Add some features here*

# How to Install and Run

Setup `conf.json` with your SQL details. Then open the directory where `camera.js` is located then go to `sql` and install the SQL files in your database. `Framework` then `Default Data`. Return to main directory.

with terminal while in the directory run `npm install` then to start `node camera.js`

to daemonize the process install pm2 with `npm install pm2 -g` then run `pm2 start camera.js`

open up `localhost` in your browser.

run `pm2 logs` to see the console for any errors.

# To Do

-Organize this README
-Fix Pipe error that occasionally occurs
-better vieweing for saved events
-purging for old events (a cron script)

# Donate

If you like what I am doing here and want me to continue please consider donating :)

PayPal : paypal@m03.ca

# Author

Moe Alam, just a guy who needed CCTV