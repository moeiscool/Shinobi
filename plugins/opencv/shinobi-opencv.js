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
s.cx({f:'init'});

io.on('f',function(d){
    switch(d.f){
        case'frame':
            d.details={}
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
                      d.details.EYE_CASCADE=faces;
//                    for (var i=0;i<faces.length; i++){
//                      var x = faces[i];
//                      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
//                    }
                  }
                  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
                      if(err){console.log(err);return false;}
                      if(faces&&faces.length>0){
                          d.details.FACE_CASCADE=faces;
//                        for (var i=0;i<faces.length; i++){
//                          var x = faces[i];
//                          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
//                        }
                          sql.query('INSERT INTO Events (ke,mid,details) VALUES (?,?,?)',[d.ke,d.id,JSON.stringify(d.details)])
//                          s.cx({f:'frame',frame:im.toBuffer(),id:d.id,ke:d.ke})
                      }
                  });
              });
          });
        break;
    }
})