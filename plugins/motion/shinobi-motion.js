//
// Shinobi - Motion Plugin
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
var fs = require('fs');
var Canvas = require('canvas');
var config=require('./conf.json');
s={
    canvas:{},
    canvasContext:{},
    img:{},
    lastImageData:{},
    lastRegionImageData:{},
    blendRegion:{},
    blendRegionContext:{},
    lastFrames:{},
    globalCoords:{},
    globalCoordsObject:{}
}
s.blenderRegion=function(d,cord){
	d.width  = s.img[d.id].width;
	d.height = s.img[d.id].height;
    if(!s.canvas[d.id+'_'+cord.name]){
        if(!cord.sensitivity||isNaN(cord.sensitivity)){
            cord.sensitivity=d.mon.detector_sensitivity;
        }
        s.canvas[d.id+'_'+cord.name] = new Canvas(d.width,d.height);
        s.canvasContext[d.id+'_'+cord.name] = s.canvas[d.id+'_'+cord.name].getContext('2d');
        s.canvasContext[d.id+'_'+cord.name].fillStyle = '#005337';
        s.canvasContext[d.id+'_'+cord.name].fillRect( 0, 0,d.width,d.height);
        if(cord.points&&cord.points.length>0){
            s.canvasContext[d.id+'_'+cord.name].beginPath();
            for (var b = 0; b < cord.points.length; b++){
                cord.points[b][0]=parseFloat(cord.points[b][0]);
                cord.points[b][1]=parseFloat(cord.points[b][1]);
                if(b===0){
                    s.canvasContext[d.id+'_'+cord.name].moveTo(cord.points[b][0],cord.points[b][1]);
                }else{
                    s.canvasContext[d.id+'_'+cord.name].lineTo(cord.points[b][0],cord.points[b][1]);
                }
            }
            s.canvasContext[d.id+'_'+cord.name].clip();
        }
    }
    try{
    s.canvasContext[d.id+'_'+cord.name].drawImage(s.img[d.id], 0, 0, d.width, d.height);
    }catch(err){
        console.log(err)
    }
    if(!s.blendRegion[d.id+'_'+cord.name]){
        s.blendRegion[d.id+'_'+cord.name] = new Canvas(d.width, d.height);
        s.blendRegionContext[d.id+'_'+cord.name] = s.blendRegion[d.id+'_'+cord.name].getContext('2d');
    }
    var sourceData = s.canvasContext[d.id+'_'+cord.name].getImageData(0, 0, d.width, d.height);
	// create an image if the previous image doesn�t exist
	if (!s.lastRegionImageData[d.id+'_'+cord.name]) s.lastRegionImageData[d.id+'_'+cord.name] = s.canvasContext[d.id+'_'+cord.name].getImageData(0, 0, d.width, d.height);
	// create a ImageData instance to receive the blended result
	var blendedData = s.canvasContext[d.id+'_'+cord.name].createImageData(d.width, d.height);
	// blend the 2 images
	s.differenceAccuracy(blendedData.data,sourceData.data,s.lastRegionImageData[d.id+'_'+cord.name].data);
	// draw the result in a canvas
	s.blendRegionContext[d.id+'_'+cord.name].putImageData(blendedData, 0, 0);
	// store the current webcam image
	s.lastRegionImageData[d.id+'_'+cord.name] = sourceData;
    blendedData = s.blendRegionContext[d.id+'_'+cord.name].getImageData(0, 0, d.width, d.height);
    var i = 0;
    var average = 0;
    while (i < (blendedData.data.length * 0.25)) {
        average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]);
        ++i;
    }
    average = (average / (blendedData.data.length * 0.25))*100;
    if (average > cord.sensitivity){
        s.cx({f:'trigger',id:d.id,ke:d.ke,frame:d.buffer,details:{plug:config.plug,name:cord.name,reason:'motion',confidence:average}})

    }
    s.canvasContext[d.id+'_'+cord.name].clearRect(0, 0, d.width, d.height);
    s.blendRegionContext[d.id+'_'+cord.name].clearRect(0, 0, d.width, d.height);
}
function fastAbs(value) {
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

s.checkAreas=function(d){
    if(!s.globalCoords[d.id]){
        if(!d.mon.cords){d.mon.cords={}}
        s.globalCoords[d.id]=Object.values(d.mon.cords);
        s.globalCoordsObject[d.id]=d.mon.cords;
    }
    if(d.mon.detector_frame==='1'&&!s.globalCoordsObject[d.id].frame){
        s.globalCoordsObject[d.id].frame={name:'frame',s:d.mon.detector_sensitivity,points:[[0,0],[0,s.img[d.id].height],[s.img[d.id].width,s.img[d.id].height],[s.img[d.id].width,0]]};
        s.globalCoords[d.id].push(s.globalCoordsObject[d.id].frame);
    }
	for (var b = 0; b < s.globalCoords[d.id].length; b++){
        if(!s.globalCoords[d.id][b]){return}
        s.blenderRegion(d,s.globalCoords[d.id][b])
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
        case'init_monitor':
            if(d.mon.detector_scale_x===''||d.mon.detector_scale_y===''){
                d.mon.detector_scale_x=320;
                d.mon.detector_scale_y=240;
            }
            if(!s.globalCoords[d.id]){
                if(!d.mon.cords){d.mon.cords={}}
                s.globalCoords[d.id]=Object.values(d.mon.cords);
                s.globalCoordsObject[d.id]=d.mon.cords;
            }
            if(d.mon.detector_frame==='1'&&!s.globalCoordsObject[d.id].frame){
                s.globalCoordsObject[d.id].frame={name:'frame',s:d.mon.detector_sensitivity,points:[[0,0],[0,d.mon.detector_scale_y],[d.mon.detector_scale_x,d.mon.detector_scale_y],[d.mon.detector_scale_x,0]]};
                s.globalCoords[d.id].push(s.globalCoordsObject[d.id].frame);
            }
        break;
        case'frame':
            if(!d.buffer){
              d.buffer=[d.frame];
            }else{
              d.buffer.push(d.frame)
            }
            if(d.frame[d.frame.length-2] === 0xFF && d.frame[d.frame.length-1] === 0xD9){
                d.buffer=Buffer.concat(d.buffer);
                if(!s.globalCoords[d.id]){
                    s.globalCoords[d.id]=Object.values(d.mon.cords);
                    s.globalCoordsObject[d.id]=d.mon.cords;
                }
                if(!s.img[d.id]){
                    s.img[d.id] = new Canvas.Image;
                }
                if(d.mon.detector_scale_x===''||d.mon.detector_scale_y===''){
                    d.mon.detector_scale_x=320;
                    d.mon.detector_scale_y=240;
                }else{
                    s.img[d.id].width=d.mon.detector_scale_x;
                    s.img[d.id].height=d.mon.detector_scale_y;
                }
                if(s.img[d.id].width===0||s.img[d.id].height===0){
                    s.img[d.id].width=d.mon.detector_scale_x;
                    s.img[d.id].height=d.mon.detector_scale_y;
                }
                s.img[d.id].src = d.buffer;
                s.checkAreas(d);
                d.buffer=null;
            }
        break;
    }
})