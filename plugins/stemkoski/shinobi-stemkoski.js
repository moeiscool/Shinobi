//
// Shinobi - OpenCV Plugin
// Copyright (C) 2016-2025 Moe Alam, moeiscool
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// # Donate
//
// If you like what I am doing here and want me to continue please consider donating :)
// PayPal : paypal@m03.a
//
process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
var Canvas = require('canvas');
var config=require('./conf.json');
s={
    canvas:{},
    canvasContext:{},
    img:{},
    lastImageData:{},
    blend:{},
    blendContext:{}
}
//s.cords=[
//    { name:"red", x:320 - 32 - 10, y:10, w:32, h:32 },
//    { name:"yellow", x:320 - 32 - 10, y:10, w:32, h:32 },
//    { name:"green", x:238, y:10, w:32, h:32 }
//]
s.blender=function(mid){
	var width  = s.img[mid].width;
	var height = s.img[mid].height;
    if(width===0||height===0){return}
    var sourceData = s.canvasContext[mid].getImageData(0, 0, width, height);
	// create an image if the previous image doesn�t exist
	if (!s.lastImageData[mid]) s.lastImageData[mid] = s.canvasContext[mid].getImageData(0, 0, width, height);
	// create a ImageData instance to receive the blended result
	var blendedData = s.canvasContext[mid].createImageData(width, height);
	// blend the 2 images
	s.differenceAccuracy(blendedData.data,sourceData.data,s.lastImageData[mid].data);
	// draw the result in a canvas
	s.blendContext[mid].putImageData(blendedData, 0, 0);
	// store the current webcam image
	s.lastImageData[mid] = sourceData;
}
function fastAbs(value) {
    // funky bitwise, equal Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}

function difference(target, data1, data2) {
    // blend mode difference
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        target[4 * i] = data1[4 * i] == 0 ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);
        target[4 * i + 1] = data1[4 * i + 1] == 0 ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);
        target[4 * i + 2] = data1[4 * i + 2] == 0 ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);
        target[4 * i + 3] = 0xFF;
        ++i;
    }
}
s.differenceAccuracy=function(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4 * i] = diff;
        target[4 * i + 1] = diff;
        target[4 * i + 2] = diff;
        target[4 * i + 3] = 0xFF;
        ++i;
    }
}

s.checkAreas=function(d,mon){
    var cords=mon.cords;
	for (var b = 0; b < cords.length; b++){
		// get the pixels in a note area from the blended image
        var blendedData = s.blendContext[d.id].getImageData(0, 0,s.img[d.id].width,s.img[d.id].height);
//        var blendedData = s.blendContext[d.id].getImageData(cords[b].x, cords[b].y, cords[b].w, cords[b].h);
        var i = 0;
        var average = 0;
        while (i < (blendedData.data.length * 0.25)) {
            // make an average between the color channel
            average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]);
            ++i;
        }
        // calculate an average between the color values of the spot area
        average = average / (blendedData.data.length * 0.25);
        console.log(cords[b].name,average);
		if (average > 0.3){
//			console.log('Possible Motion : '+cords[b].name); // do stuff
            //tell server you got some motion
            s.cx({f:'trigger',id:d.id,ke:d.ke,details:{plug:config.plug,reason:'motion',confidence:average}})
		}
	}
}


sql={
    query:function(x,y,z){
        s.cx({f:'sql',query:x,values:y});if(typeof z==='function'){z();}
    }
}
io = require('socket.io-client')('ws://'+config.host+':'+config.port);//connect to master
s.cx=function(x){return io.emit('ocv',x)}
io.on('connect',function(d){
    s.cx({f:'init',plug:config.plug});
})
io.on('disconnect',function(d){
    io.connect();
})
io.on('f',function(d){
    switch(d.f){
        case'frame':
            if(!d.buffer){
              d.buffer=d.frame;
            }else{
              d.buffer=Buffer.concat([d.buffer,d.frame]);
            }
            if(d.frame[d.frame.length-2] === 0xFF && d.frame[d.frame.length-1] === 0xD9){
                if(!s.img[d.id]){
                    s.img[d.id] = new Canvas.Image;
                }
                s.img[d.id].src = d.buffer;
                if(!s.canvas[d.id]){
                    s.canvas[d.id] = new Canvas(s.img[d.id].width,s.img[d.id].height);
                    s.canvasContext[d.id] = s.canvas[d.id].getContext('2d');
                    s.canvasContext[d.id].translate(s.img[d.id].width, 0);
                    s.canvasContext[d.id].scale(-1, 1);
                    s.canvasContext[d.id].fillStyle = '#005337';
                    s.canvasContext[d.id].fillRect( 0, 0, s.img[d.id].width, s.img[d.id].height );
                }
                if(!s.blend[d.id]){
                    s.blend[d.id] = new Canvas(s.img[d.id].width,s.img[d.id].height);
                    s.blendContext[d.id] = s.blend[d.id].getContext('2d');
                }
                try{
                s.canvasContext[d.id].drawImage(s.img[d.id], 0, 0, s.img[d.id].width / 4, s.img[d.id].height / 4);
                }catch(err){
                    console.log(err)
                }
                s.blender(d.id);
                s.checkAreas({id:d.id,ke:d.ke},d.mon);
                d.buffer=null;
            }
        break;
    }
})