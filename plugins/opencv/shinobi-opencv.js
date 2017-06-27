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
var fs=require('fs');
var cv=require('opencv');
var config=require('./conf.json');
s={
    group:{},
    dir:{
        cascades:__dirname+'/cascades/'
    }
}
s.findCascades=function(callback){
    var tmp={};
    tmp.foundCascades=[];
    fs.readdir(s.dir.cascades,function(err,files){
        files.forEach(function(cascade,n){
            if(cascade.indexOf('.xml')>-1){
                tmp.foundCascades.push(cascade.replace('.xml',''))
            }
        })
        s.cascadesInDir=tmp.foundCascades;
        callback(tmp.foundCascades)
    })
}
s.findCascades(function(){
    //get cascades
})
io = require('socket.io-client')('ws://'+config.host+':'+config.port);//connect to master
s.cx=function(x){x.pluginKey=config.key;x.plug=config.plug;return io.emit('ocv',x)}
io.on('connect',function(d){
    s.cx({f:'init',plug:config.plug});
})
io.on('disconnect',function(d){
    io.connect()
})
io.on('f',function(d){
    switch(d.f){
        case'refreshPlugins':
            s.findCascades(function(cascades){
                s.cx({f:'s.tx',data:{f:'detector_cascade_list',cascades:cascades},to:'GRP_'+d.ke})
            })
        break;
        case'readPlugins':
            s.cx({f:'s.tx',data:{f:'detector_cascade_list',cascades:s.cascadesInDir},to:'GRP_'+d.ke})
        break;
        case'init_monitor':
            if(s.group[d.ke]&&s.group[d.ke][d.id]){
                s.group[d.ke][d.id].canvas={}
                s.group[d.ke][d.id].canvasContext={}
                s.group[d.ke][d.id].blendRegion={}
                s.group[d.ke][d.id].blendRegionContext={}
                s.group[d.ke][d.id].lastRegionImageData={}
                delete(s.group[d.ke][d.id].cords)
                delete(s.group[d.ke][d.id].buffer)
            }
        break;
        case'frame':
            d.details={}
            try{
                if(!s.group[d.ke]){
                    s.group[d.ke]={}
                }
                if(!s.group[d.ke][d.id]){
                    s.group[d.ke][d.id]={
                        canvas:{},
                        canvasContext:{},
                        lastRegionImageData:{},
                        blendRegion:{},
                        blendRegionContext:{},
                    }
                }
                if(!s.group[d.ke][d.id].buffer){
                  s.group[d.ke][d.id].buffer=[d.frame];
                }else{
                  s.group[d.ke][d.id].buffer.push(d.frame)
                }
                if(d.frame[d.frame.length-2] === 0xFF && d.frame[d.frame.length-1] === 0xD9){
                    s.group[d.ke][d.id].buffer=Buffer.concat(s.group[d.ke][d.id].buffer);
                      cv.readImage(s.group[d.ke][d.id].buffer, function(err,im){
                          if(err){console.log(err);return false;}
                          var width = im.width();
                          var height = im.height();

                          if (width < 1 || height < 1) {
                             throw new Error('Image has no size');
                          }
            //              if(d.mon.detector_face==='1'){
            //                  im.detectObject(cv.EYE_CASCADE, {}, function(err,mats){
            //                      if(err){console.log(err);return false;}
            //                      if(mats&&mats.length>0){
            //                          d.details.EYE_CASCADE=mats;
            //                          console.log('EYE_CASCADE',mats)
            //    //                    for (var i=0;i<mats.length; i++){
            //    //                      var x = mats[i];
            //    //                      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
            //    //                    }
            ////                          s.cx({f:'trigger',id:d.id,ke:d.ke})
            //                      }
            //                      im.detectObject(cv.FACE_CASCADE, {}, function(err, mats){
            //                          if(err){console.log(err);return false;}
            //                          if(mats&&mats.length>0){
            //                              d.details.FACE_CASCADE=mats;
            //    //                        for (var i=0;i<mats.length; i++){
            //    //                          var x = mats[i];
            //    //                          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
            //    //                        }
            ////                              s.cx({f:'trigger',id:d.id,ke:d.ke})
            //    //                          s.cx({f:'frame',frame:im.toBuffer(),id:d.id,ke:d.ke})
            //                          }
            //                      });
            //                  });
            //              }
                          if(d.mon.detector_cascades&&d.mon.detector_cascades instanceof Array){
                              d.mon.detector_cascades.forEach(function(v,n){
                                  im.detectObject(s.dir.cascades+v+'.xml',{}, function(err,mats){
                                      if(err){console.log(err);return false;}
                                      if(mats&&mats.length>0){
                                          d.details.CAR_SIDE_CASCADE=mats;
                                          s.cx({f:'trigger',id:d.id,ke:d.ke,details:{plug:config.plug,name:v,reason:'detectObject',matrices:mats}})
                                      }
                                  })
                              })
                          }
                      });
                    s.group[d.ke][d.id].buffer=null;
                }
            } catch(err){
                    console.error(err)
                }
        break;
    }
})