//
// Shinobi
// Copyright (C) 2016-2025 Moe Alam, moeiscool
// Please Donate if you consider this platform for commercial purposes :)
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
//# Donate
//
//If you like what I am doing here and want me to continue please consider donating :)
//
//PayPal : paypal@m03.ca
//Patreon : https://patreon.com/moeiscool


var fs = require('fs');
var mysql = require('mysql');
var moment = require('moment');
var request = require("request");
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var connectionTester = require('connection-tester');
var spawn = require('child_process').spawn;
server.listen(80);

exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9");//kill any ffmpeg running

var db_config=JSON.parse(fs.readFileSync('conf.json','UTF8'));
var sql=mysql.createConnection(db_config);
s={running:{},tmp:{},mjpeg:{},build:{},dir:{events:__dirname+'/events/',frames:__dirname+'/frames/'},users:{}};
s.build_at=100;
s.interval=1000;
s.deleteRoute=function(xx,ar){
    ar=[];
    Object.keys(app._router.stack).forEach(function(n){
        if(app._router.stack[n].path&&app._router.stack[n].path!==xx){ar.push(app._router.stack[n])}
    })
    app._router.stack=ar;
}
s.md5=function(x){return crypto.createHash('md5').update(x).digest("hex");}
s.base64=function(file,err){try{var bitmap = fs.readFileSync(file);return new Buffer(bitmap).toString('base64');}catch(er){return err;}}
s.tx=function(z,y,x){if(x){return x.broadcast.to(y).emit('f',z)};io.to(y).emit('f',z);}
s.getDirs=function(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}
s.gid=function(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
s.moment=function(e,x){if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};return moment(e).utcOffset('-0800').format(x)}
s.kill=function(x,p){if(!x||x===1){return};p=x.pid;x.stdin.pause();x.kill();setTimeout(function(){exec('kill -9 '+p)},1000)}

s.com = spawn('dstat', ['-c', '--nocolor']);
s.com.stdout.on('data', function(data,txt){
	txt = new Buffer(data).toString('utf8', 0, data.length);
	s.tx({f:'cpu',data:100 - parseInt(txt.split('  ')[2])},'GRP_2Df5hBE');
});
////Camera Controller
s.camera=function(e,cn,tx){
    if(!e){e={}};if(cn&&cn.ke){e.ke=cn.ke};
    switch(e.mode){
        case'add':
            if(e.mon&&e.mon.mid&&e.mon.name){
                e.set=[],e.ar=[];
                sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[cn.ke,e.mon.mid],function(er,r){
                    if(r&&r[0]){
                        Object.keys(e.mon).forEach(function(v){
                            if(e.mon[v]&&e.mon[v]!==''){
                                e.set.push(v+'=?'),e.ar.push(e.mon[v]);
                            }
                        })
                        e.set=e.set.join(',');
                        e.ar.push(cn.ke),e.ar.push(e.mon.mid);
                        sql.query('UPDATE Monitors SET '+e.set+' WHERE ke=? AND mid=?',e.ar)
                    }else{
                        e.st=[];
                        Object.keys(e.mon).forEach(function(v){
                            if(e.mon[v]&&e.mon[v]!==''){
                                e.set.push(v),e.st.push('?'),e.ar.push(e.mon[v]);
                            }
                        })
                        e.set.push('ke'),e.st.push('?'),e.ar.push(cn.ke);
                        e.set=e.set.join(','),e.st=e.st.join(',');
                        sql.query('INSERT INTO Monitors ('+e.set+') VALUES ('+e.st+')',e.ar)
                    }
                    e.mon.id=e.mon.mid;e.ke=cn.ke;
                    if(s.users[cn.ke].mon[e.mon.id]&&s.users[cn.ke].mon[e.mon.id].started===1){
                        e.mode2=e.mon.mode,e.mon.mode='stop',e.callback=function(){delete(e.callback);e.mon.mode=e.mode2;s.camera(e.mon)};
                        s.camera(e.mon);
                    }else{
                        s.camera(e.mon);
                    }
                })
            }
        break;
        case'frame_emitter':
            switch(e.ff){
                case'start':
                    if(s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                                s.users[e.ke].mon[e.id].stream_frame=setInterval(function(){
                        e.dir=s.dir.frames+e.ke+'/'+e.id+'/f.jpg';
                        if (fs.existsSync(e.dir)){
//                            s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:fs.readFileSync(e.dir),frame_format:'ab'},'MON_'+e.id);
                        }else{
                            console.log('No Frame',e.id)
                        }
                                },s.interval)
                    }
                break;
                default:
                    if(s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length===0){
                    clearInterval(s.users[e.ke].mon[e.id].stream_frame)
                    }
                break;
            }
        break;
        case'snapshot'://get snapshot from monitor URL
            e.url=e.mon.protocol+'://'+e.mon.host+':'+e.mon.port+e.mon.path;
            if(e.mon.type==='jpeg'){
            request({url:e.url,method:'GET',encoding:null},function(err){if(err){return};}).on('complete',function(resp){
                if(resp.body){
                    s.tx({f:'monitor_snapshot',snapshot:resp.body,snapshot_format:'ab',id:e.id},'GRP_'+e.ke)
                }
                }).on('error',function(){s.tx({f:'monitor_snapshot',snapshot:'No Image',snapshot_format:'plc',id:e.id},'GRP_'+e.ke)})
            }else{s.tx({f:'monitor_snapshot',snapshot:'No Image',snapshot_format:'plc',id:e.id},'GRP_'+e.ke)}
        break;
        case'record_off'://stop recording and start
            if(!s.users[e.ke].mon[e.id].record){s.users[e.ke].mon[e.id].record={}}
            s.users[e.ke].mon[e.id].record.yes=0;clearInterval(s.users[e.ke].mon[e.id].record.purge);
            e.mode='start';s.camera(e);
        break;
        case'watch_on'://live streamers - join
            if(!s.users[cn.ke].mon[e.id]){s.users[cn.ke].mon[e.id]={}}
            if(!s.users[cn.ke].mon[e.id].watch){s.users[cn.ke].mon[e.id].watch={}}
            if(s.users[cn.ke].mon[e.id].watch[cn.id]){e.mode='watch_off';s.camera(e,cn,tx);return}
            if(!cn.monitor_watching){cn.monitor_watching={}}
            if(!cn.monitor_watching[e.id]){cn.monitor_watching[e.id]={}}
            s.users[cn.ke].mon[e.id].watch[cn.id]={};
            if(!s.users[e.ke].mon[e.id].livestream&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[e.ke,e.id],function(err,r) {
                    if(r&&r[0]){
                        r=r[0];
                        e.url=r.protocol+'://'+r.host+':'+r.port+r.path;
                        s.users[e.ke].mon.type=r.type;
                        switch(r.type){
                            case'mjpeg':
                                s.users[e.ke].mon[e.id].livestream=1;
//                                s.camera({mode:'frame_emitter',id:e.id,ke:e.ke,ff:'start'})
                            break;
                            case'jpeg':
                                
                            break;
                        }
                    }
                })
            }
        break;
        case'watch_off'://live streamers - leave
           if(cn.monitor_watching){delete(cn.monitor_watching[e.id])}
            if(s.users[e.ke].mon[e.id]&&s.users[e.ke].mon[e.id].watch){
                delete(s.users[e.ke].mon[e.id].watch[cn.id]),e.ob=Object.keys(s.users[e.ke].mon[e.id].watch).length
                s.kill(s.users[e.ke].mon[e.id].livestream);
                if(e.ob===0){
                   if(s.users[e.ke].mon.type==='mjpeg'){
    //                   s.camera({mode:'frame_emitter',id:e.id,ke:e.ke})
    //                   s.deleteRoute(s.users[e.ke].mon[e.id].livestream);
                   }
                   delete(s.users[e.ke].mon[e.id].livestream)
                   delete(s.users[e.ke].mon[e.id].watch)
                }
            }else{
                e.ob=0;
            }
        break;
        case'stop'://stop monitor
            s.kill(s.users[e.ke].mon[e.id].spawn);
            clearInterval(s.users[e.ke].mon[e.id].running);delete(s.users[e.ke].mon[e.id].running);
            s.users[e.ke].mon[e.id].started=0;
            if(s.users[e.ke].mon[e.id].record){clearInterval(s.users[e.ke].mon[e.id].record.purge)}
            s.tx({f:'monitor_stopping',id:e.id,time:s.moment(),reason:e.reason},'GRP_'+e.ke);
            sql.query("UPDATE Monitors SET mode=? WHERE mid=? AND ke=?",['stop',e.id,e.ke])
        break;
        case'start':case'record'://stop or record monitor url
            if(!e.url){e.url=e.protocol+'://'+e.host+':'+e.port+e.path}
            if(!s.users[e.ke].mon){s.users[e.ke].mon={}}
            if(!e.url||!e.mode||!e.id||s.users[e.ke].mon[e.id].started===1){return}
            s.users[e.ke].mon[e.id].started=1;
            s.kill(s.users[e.ke].mon[e.id].spawn);
            if(e.mode==='record'){s.users[e.ke].mon[e.id].record.yes=1;clearInterval(s.users[e.ke].mon[e.id].record.purge);}
                e.dir=s.dir.frames+e.ke+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.frames+e.ke+'/'+e.id+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.events+e.ke+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.events+e.ke+'/'+e.id+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
            s.tx({f:'monitor_starting',id:e.id,time:s.moment()});

            e.error_count=0;
//                e.error=0;
//            e.frame_count=0;
                e.fn=function(time){//this function loops to create new files
                    try{
                    if(time){e.time=time}else{e.time=moment()};
                    e.time=e.time.utcOffset('-0800');
                    if(e.filename&&s.users[e.ke].mon[e.id].record.yes===1){
                        if(fs.existsSync(e.dir+e.filename+'.webm')){
                        e.save=[e.id,e.ke,s.users[e.ke].mon[e.id].record.time.format('YYYY-MM-DD HH:mm:ss'),fs.statSync(e.dir+e.filename+'.webm')["size"]];

                        
                           sql.query('INSERT INTO Videos (mid,ke,time,size) VALUES (?,?,?,?)',e.save)
                           s.tx({f:'event_build_success',filename:s.moment(s.users[e.ke].mon[e.id].record.time)+'.webm',mid:e.id,ke:e.ke},'GRP_'+e.ke);
                        
                        
//                        exec('ffprobe -loglevel quiet -print_format json -show_format -show_streams -count_frames '+s.dir.events+e.ke+'/'+e.id+'/'+s.users[e.ke].mon[e.id].record.time.format('YYYY-MM-DDTHH-mm-ss')+'.webm',function(err,p){
//                           if(err){console.log('PROBE:',err)}else{
//                           p=JSON.parse(p);e.save[3]=p.format.duration,e.save[4]=p.format.size,e.save[5]=p.streams.nb_read_frames;
//                               sql.query('INSERT INTO Videos (mid,ke,time,duration,size,frames) VALUES (?,?,?,?,?,?)',e.save)
//                               s.tx({f:'event_build_success',filename:s.moment(s.users[e.ke].mon[e.id].record.time)+'.webm',mid:e.id,ke:e.ke},'GRP_'+e.ke);
//                           }
//                        });
                        s.users[e.ke].mon[e.id].record.time=e.time;
                        }
                    }
                    e.filename=e.time.format('YYYY-MM-DDTHH-mm-ss');
                    s.kill(s.users[e.ke].mon[e.id].spawn);
                        
                        
                            e.hosty=e.host.split('@');
                            if(e.hosty[1]){e.hosty=e.hosty[1];}else{e.hosty=e.hosty[0];}
                            connectionTester.test(e.hosty,e.port,2000,function(err,o){
                                if(o.success===true){
                                e.pipe=' -vf fps=1 -s 640x360 -f mjpeg pipe:2';
                                switch(e.type){
                                    case'jpeg':
                                        e.args = '-loglevel quiet -f image2pipe -framerate 1 -vcodec mjpeg -i - -f webm -framerate 2 -q:v 1 '+e.dir+e.filename+'.webm';
                                        s.users[e.ke].mon[e.id].spawn = spawn('ffmpeg',e.args.split(' '));
                                        e.captureOne=function(f){
                                            request({url:e.url,method:'GET',encoding: null},function(er,resp,body){
                                                if(er){++e.error_count;return}
            //                                    if(e.error_count>4){s.camera({mode:'stop',id:e.id,ke:e.ke})}
                                                clearTimeout(e.timeOut),e.timeOut=setTimeout(function(){e.error_count=0;},3000)
                                            }).on('complete',function(data){
                                                if(s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                                                s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:data.body,frame_format:'ab'},'MON_'+e.id);
                                            }
                                                setTimeout(function(){e.captureOne()},500);
                                            }).on('error',function(er){}).pipe(s.users[e.ke].mon[e.id].spawn.stdin,{end:false})
                                        }
                                        e.captureOne()
                                    break;
                                    case'mjpeg':
                                           e.args='-loglevel quiet -f mjpeg -framerate '+e.fps+' -i '+e.url+' -vcodec libvpx -framerate '+e.fps+' -q:v 1 '+e.dir+e.filename+'.webm'+e.pipe;
                                           s.users[e.ke].mon[e.id].spawn=spawn('ffmpeg',e.args.split(' '));
                                        s.users[e.ke].mon[e.id].spawn.on('error',function(er){++e.error_count;if(e.error_count>4){console.log('Camera Error, Stopping');s.camera({mode:'stop',id:e.id,ke:e.ke})}})
                                        e.frame_count=0;
                                        s.users[e.ke].mon[e.id].spawn.stderr.on('data',function(d){
                                            if(s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                                                s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:d,frame_format:'ab'},'MON_'+e.id);
                                            }
                                        });
                                    break;
                                }
                                }else{
                                    console.log('Cannot Connect, Retrying...',e.id);++e.error_count;setTimeout(function(){if(e.error_count>4){console.log('Camera Error, Stopping',e.id);s.camera({mode:'stop',id:e.id,ke:e.ke})}else{e.fn();}},5000);return;             
                                }
                            });
                    }catch(err){++e.error_count;console.log(err);s.tx({f:'error',data:err},'GRP_2Df5hBE');}
                }
                s.users[e.ke].mon[e.id].record.time=moment();//initial time.
                s.users[e.ke].mon[e.id].running=setInterval(function(){//start loop
                     e.fn()
                },60000*15);//every 15 minutes start a new file.
                e.fn(s.users[e.ke].mon[e.id].record.time)//start drawing files
        break;
    }
    if(typeof e.callback==='function'){setTimeout(function(){e.callback()},5000);}
}
////File Editor
s.file=function(e){
    if(!e){e={}};
    switch(e.mode){
        case'file_size':
             return fs.statSync(e.filename)["size"];
        break;
        case'delete_files':
            if(!e.age_type){e.age_type='min'};if(!e.age){e.age='1'};
            exec('find '+e.path+' -type f -c'+e.age_type+' +'+e.age+' -exec rm -rf {} +');
        break;
    }
}

////Socket Stuff
//
s.cn=function(cn){return{id:cn.id,ke:cn.ke,uid:cn.uid}}
io.on('connection', function (cn) {
function tx(z){if(!z.ke){z.ke=cn.ke;};cn.emit('f',z);}
    cn.on('f',function(d){
        if(!cn.ke&&d.f==='init'){
            sql.query('SELECT * FROM Users WHERE ke=? AND auth=? AND uid=?',[d.ke,d.auth,d.uid],function(err,r) {
                if(r&&r[0]){
                    r=r[0];cn.join('GRP_'+d.ke);
                    cn.ke=d.ke,cn.uid=d.uid;
                    if(!s.users[d.ke])s.users[d.ke]={};
                    if(!s.users[d.ke].vid)s.users[d.ke].vid={};
                    s.users[d.ke].vid[cn.id]={};
                    if(!s.users[d.ke].mon){
                        s.users[d.ke].mon={}
                        if(!s.users[d.ke].mon){s.users[d.ke].mon={}}
                    }
                    sql.query('SELECT * FROM Monitors WHERE ke=?',[d.ke],function(err,rr) {
                        if(rr&&rr[0]){
                            rr.forEach(function(t){
//                                s.camera({mode:'snapshot',id:t.mid,ke:t.ke,mon:t})
                            })
                        }
                        tx({f:'init_success',monitors:rr,users:s.users[d.ke].vid})
                    })
                }else{
                    tx({ok:false,msg:'Not Authorized',token_used:d.auth,ke:d.ke
                       });
                    cn.disconnect();
                }
            })
            return;
        }
        if((d.id||d.uid||d.mid)&&cn.ke){
            try{
            switch(d.f){
                case'get':
                    switch(d.ff){
//                        case'events':case'frames':
//                            d.cx={f:'get_'+d.ff,id:d.id};
//                            fs.readdir(s.dir[d.ff]+d.ke+'/'+d.id,function(err,files){
//                                d.cx[d.ff]=files;
//                                tx(d.cx)
//                            })
//                        break;
                        case'events':
                            d.cx={f:'get_'+d.ff,mid:d.mid};
                            d.sql="SELECT * FROM Videos WHERE ke=?";d.ar=[d.ke];
                            if(d.mid){d.sql+='AND mid=?';d.ar.push(d.mid)}
                            sql.query(d.sql,d.ar,function(err,r){
                                d.cx[d.ff]=r,tx(d.cx);
                            });
                        break;
                    }
                break;
                case'monitor':
                    switch(d.ff){
                        case'add':
                            d.mode='add';s.camera(d,cn,tx);
                        break;
                        case'record_on':case'record_off':
                            if(!d.ke){d.ke=cn.ke;}
                    sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[cn.ke,d.id],function(err,r) {
                        if(r&&r[0]){r=r[0]
                            if(d.ff==='record_on'){d.mode='record'}else{d.mode='start'};d.type=r.type;
                            sql.query("UPDATE Monitors SET mode=? WHERE mid=? AND ke=?",[d.mode,d.id,d.ke],function(){
                                
                                d.mode2=d.mode,d.mode='stop',d.callback=function(){delete(d.callback);d.mode=d.mode2;s.camera(d)};s.camera(d);
                                tx({f:d.ff,id:d.id})
                            })
                        }
                    })
                        break;
                        case'watch_on':
                            if(!d.ke){d.ke=cn.ke}
                            if(!s.users[d.ke]||!s.users[d.ke].mon[d.id]){return false}
                            d.mode=d.ff,s.camera(d,cn,tx)
                            cn.join('MON_'+d.id);
                            if(s.users[d.ke]&&s.users[d.ke].mon&&s.users[d.ke].mon[d.id]&&s.users[d.ke].mon[d.id].watch){
                                
tx({f:'monitor_watch_on',viewers:Object.keys(s.users[d.ke].mon[d.id].watch).length,id:d.id})
                           }
                        break;
                        case'watch_off':
                            if(!d.ke){d.ke=cn.ke;};cn.leave('MON_'+d.id);d.mode=d.ff;s.camera(d,cn,tx);
                            tx({f:'monitor_watch_off',viewers:d.ob,id:d.id})
                        break;
                        case'start':case'stop':
                    sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[cn.ke,d.id],function(err,r) {
                        if(r&&r[0]){r=r[0]
                            s.camera({type:r.type,url:r.protocol+'://'+r.host+':'+r.port+r.path,id:d.id,mode:d.ff,ke:cn.ke});
                        }
                    })
                        break;
                    }
                break;
                case'event':
                    switch(d.ff){
                        case'delete':
                            
                        break;
                    }
                break;
            }
        }catch(er){console.log(er)}
        }else{
            tx({ok:false,msg:'Not Authorized, Submit init command with "auth","ke", and "uid"'});
        }
    });
    cn.on('disconnect', function () {
        if(cn.monitor_watching){
            cn.monitor_count=Object.keys(cn.monitor_watching)
            if(cn.monitor_count.length>0){
                cn.monitor_count.forEach(function(v){
                    s.camera({mode:'watch_off',id:v,ke:cn.ke},s.cn(cn))
                })
            }
        }
        if(cn.ke){
            delete(s.users[cn.ke].vid[cn.id]);
        }
    })
});
////Pages
app.use(express.static(__dirname+'/events'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', function (req,res){
    res.sendFile(__dirname+'/web/index.html');
});
app.post('/auth/:mail/:pass',function (req,res){
    if(req.params.mail&&req.params.pass){
    sql.query('SELECT * FROM Users WHERE mail=? AND pass=?',[decodeURI(req.params.mail),s.md5(decodeURI(req.params.pass))],function(err,r) {
        req.resp={ok:false};
        res.setHeader('Content-Type', 'application/json');
        if(r&&r[0]){
            r=r[0];r.auth=s.md5(s.gid());
            sql.query("UPDATE Users SET auth=? WHERE ke=? AND uid=?",[r.auth,r.ke,r.uid])
            req.resp={ok:true,auth_token:r.auth,ke:r.ke,uid:r.uid,body:fs.readFileSync(__dirname+'/web/pages/home.html','utf8')};
        }else{
            
        }
        res.send(JSON.stringify(req.resp))
        res.end();
    })
    }else{
        res.send(req.params)
        res.end();
    }
})

app.post('/add/:f', function (req,res){
    switch(req.params.f){
        case'user':
            
        break;
    }
})
app.get('/libs/:f/:f2', function (req,res){
    req.dir=__dirname+'/web/libs/'+req.params.f+'/'+req.params.f2;
    if (fs.existsSync(req.dir)){
        fs.createReadStream(req.dir).pipe(res);
    }
})
app.get('/:suf/:ke/:id/:file', function (req,res){
    req.dir=__dirname+'/'+req.params.suf+'/'+req.params.ke+'/'+req.params.id+'/'+req.params.file;
    if (fs.existsSync(req.dir)){
        res.setHeader('content-type','video/webm');
        res.sendFile(req.dir);
    }else{
        res.send('File Not Found')
    }
});
app.get(['/events/:ke','/events/:ke/:id'], function (req,res){
    req.sql='SELECT * FROM Videos WHERE ke=?';req.ar=[req.params.ke];
    if(req.params.id){req.sql+='and mid=?';req.ar.push(req.params.id)}
    sql.query(req.sql,req.ar,function(err,r){
        
        r.forEach(function(v){
            v.href='/events/'+v.ke+'/'+v.mid+'/'+s.moment(v.time)+'.webm';
        })
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(r, null, 3));
    })
});
//audit the event files every hour
//s.audit=setInterval(function(){
//    s.getDirs(s.dir.events).forEach(function(v){
//        //delete older than 14 days
//        s.file({mode:'delete_files',path:s.dir.events+v,age_type:'time',age:14})
//    })
//},60000*6)

//s.users[cn.ke].mon[e.id].s={
//    "2041045":{url:'http://66.51.141.204:1045/cgi-bin/snapshot.cgi?1',id:'2041045',name:'Surrey-45-Front'},
//    "2041037":{url:'http://66.51.141.204:1037/snapshot/view0.jpg',id:'2041037',name:'Surrey-37-Front_Parking_Inward'},
//    "1381009":{url:'http://66.51.141.138:1009/snapshot/view0.jpg',id:'1381009',name:'Denman-9-Roof'},
//}

//preliminary monitor start
if (!fs.existsSync(s.dir.frames)){
    fs.mkdirSync(s.dir.frames);
}
if (!fs.existsSync(s.dir.events)){
    fs.mkdirSync(s.dir.events);
}
sql.query('SELECT * FROM Monitors WHERE mode != "stop"', function(err,r) {
    if(err){console.log(err)}
    if(r&&r[0]){
        r.forEach(function(v){
            if(!s.users[v.ke]){s.users[v.ke]={}};
            if(!s.users[v.ke].mon){s.users[v.ke].mon={}}
            if(!s.users[v.ke].mon[v.mid]){s.users[v.ke].mon[v.mid]={}}
            if(!s.users[v.ke].mon[v.mid].watch){s.users[v.ke].mon[v.mid].watch={}};
            if(v.type==='record'){v.record=1}else{v.record=0}
            if(!s.users[v.ke].mon[v.mid].record){s.users[v.ke].mon[v.mid].record={yes:v.record}};
            if(!s.users[v.ke].mon[v.mid].started){s.users[v.ke].mon[v.mid].started={}};
            if(!s.users[v.ke].mon[v.mid].running){s.users[v.ke].mon[v.mid].running={}};
            r.ar={};
            r.ar.url=v.protocol+'://'+v.host+':'+v.port+v.path,r.ar.id=v.mid;
            Object.keys(v).forEach(function(b){
                r.ar[b]=v[b];
            })
            s.camera(r.ar);
        });
    }
});