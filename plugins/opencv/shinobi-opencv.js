var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
const del = require('del');
var cv=require('opencv');
var config=require('./conf.json');
var sql=mysql.createConnection(config.db);
s={}
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    e=moment(e);if(config.utcOffset){e=e.utcOffset(config.utcOffset)}
    return e.format(x);
}
s.moment_noOffset=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    return moment(e).format(x);
}
s.nameToTime=function(x){x=x.replace('.webm','').replace('.mp4','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
io = require('socket.io-client')('ws://'+config.host+':'+config.port);//connect to master

s.cx=function(x){return io.emit('ocv',x)}
s.cx({f:'init'});

io.on('f',function(d){
    switch(d.f){
        case'frame':
          cv.readImage(d.frame, function(err,im){
              if(err){console.log(err);return false;}
              var width = im.width();
              var height = im.height();

            if (width < 1 || height < 1) {
                throw new Error('Image has no size');
            }
              im.detectObject(cv.EYE_CASCADE, {}, function(err,faces){
                  if(err){console.log(err);return false;}
                  if(faces&&faces.length>0){
                    for (var i=0;i<faces.length; i++){
                      var x = faces[i];
                      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
                    }
                  }
                  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
                      if(err){console.log(err);return false;}
                      if(faces&&faces.length>0){
                        for (var i=0;i<faces.length; i++){
                          var x = faces[i];
                          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
                        }
                          s.cx({f:'frame',frame:im.toBuffer(),id:d.id,ke:d.ke})
                      }
                  });
              });
          });
        break;
    }
})