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
var cv=require('opencv');
var config=require('./conf.json');
s={}
sql={
    query:function(x,y,z){
        s.cx({f:'sql',query:x,values:y});if(typeof z==='function'){z();}
    }
}
io = require('socket.io-client')('ws://'+config.host+':'+config.port);//connect to master
s.cx=function(x){return io.emit('ocv',x)}

io.on('connect',function(d){
    s.cx({f:'init',plug:'opencv'});
});
io.on('disconnect',function(d){
    io.connect()
})
io.on('f',function(d){
    switch(d.f){
        case'frame':
            d.details={}
          cv.readImage(d.frame,function(err,im){
              if(err){console.log(err);return false;}
              var width = im.width();
              var height = im.height();

              if (width < 1 || height < 1) {
                 throw new Error('Image has no size');
              }
              if(d.mon.detector_face==='1'){
                  im.detectObject(cv.EYE_CASCADE, {}, function(err,mats){
                      if(err){console.log(err);return false;}
                      if(mats&&mats.length>0){
                          d.details.EYE_CASCADE=mats;
    //                    for (var i=0;i<mats.length; i++){
    //                      var x = mats[i];
    //                      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    //                    }
                          s.cx({f:'trigger',id:d.id,ke:d.ke})
                      }
                      im.detectObject(cv.FACE_CASCADE, {}, function(err, mats){
                          if(err){console.log(err);return false;}
                          if(mats&&mats.length>0){
                              d.details.FACE_CASCADE=mats;
    //                        for (var i=0;i<mats.length; i++){
    //                          var x = mats[i];
    //                          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    //                        }
                              if(d.mon.detector_save==='1'){
                                  sql.query('INSERT INTO Events (ke,mid,details) VALUES (?,?,?)',[d.ke,d.id,JSON.stringify(d.details)])
                              }
                              s.cx({f:'trigger',id:d.id,ke:d.ke})
    //                          s.cx({f:'frame',frame:im.toBuffer(),id:d.id,ke:d.ke})
                          }
                      });
                  });
              }
              if(d.mon.detector_fullbody==='1'){
                  im.detectObject(cv.FULLBODY_CASCADE,{}, function(err,mats){
                      if(err){console.log(err);return false;}
                      if(mats&&mats.length>0){
                          d.details.FULLBODY_CASCADE=mats;
                          if(d.mon.detector_save==='1'){
                              sql.query('INSERT INTO Events (ke,mid,details) VALUES (?,?,?)',[d.ke,d.id,JSON.stringify(d.details)])
                          }
                          s.cx({f:'trigger',id:d.id,ke:d.ke})
                      }
                  })
              }
              if(d.mon.detector_car==='1'){
                  im.detectObject(cv.CAR_SIDE_CASCADE,{}, function(err,mats){
                      if(err){console.log(err);return false;}
                      if(mats&&mats.length>0){
                          d.details.CAR_SIDE_CASCADE=mats;
                          if(d.mon.detector_save==='1'){
                              sql.query('INSERT INTO Events (ke,mid,details) VALUES (?,?,?)',[d.ke,d.id,JSON.stringify(d.details)])
                          }
                          s.cx({f:'trigger',id:d.id,ke:d.ke})
                      }
                  })
              }
          });
        break;
    }
})