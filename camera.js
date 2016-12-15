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
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var request = require("request");
var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var connectionTester = require('connection-tester');
var db_config=JSON.parse(fs.readFileSync('conf.json','UTF8'));
var sql=mysql.createConnection(db_config);
server.listen(80);

exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9");//kill any ffmpeg running

process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
////close open events
sql.query('SELECT * FROM Videos WHERE status=?',[0],function(err,r){
    if(r&&r[0]){
        r.forEach(function(v){
            s.init(0,v);
            v.filename=s.moment(v.time);
            s.event('close',v);
//            delete(s.users[v.ke].mon[v.mid]);
        })
    }
})

//init main container for easy global variables.
s={child_help:false};
//key for child servers
s.child_nodes={};
s.child_key='3123asdasdf1dtj1hjk23sdfaasd12asdasddfdbtnkkfgvesra3asdsd3123afdsfqw345';
s.md5=function(x){return crypto.createHash('md5').update(x).digest("hex");}
s.tx=function(z,y,x){if(x){return x.broadcast.to(y).emit('f',z)};io.to(y).emit('f',z);}
s.cx=function(z,y,x){if(x){return x.broadcast.to(y).emit('c',z)};io.to(y).emit('c',z);}

s.com = spawn('dstat', ['-c', '--nocolor']);
s.com.stdout.on('data', function(data,txt){
	txt = new Buffer(data).toString('utf8', 0, data.length);
	s.tx({f:'cpu',data:100 - parseInt(txt.split('  ')[2])},'GRP_2Df5hBE');
});


//load camera controller vars
s.nameToTime=function(x){x=x.split('.')[0].split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
s.ratio=function(width,height,ratio){ratio = width / height;return ( Math.abs( ratio - 4 / 3 ) < Math.abs( ratio - 16 / 9 ) ) ? '4:3' : '16:9';}
s.gid=function(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
s.moment=function(e,x){if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};return moment(e).utcOffset('-0800').format(x)}
s.kill=function(x,e,p){
    if(s.users[e.ke]&&s.users[e.ke].mon[e.id]){
        if(e&&s.users[e.ke].mon[e.id].record){
            clearTimeout(s.users[e.ke].mon[e.id].record.capturing);
//            if(s.users[e.ke].mon[e.id].record.request){s.users[e.ke].mon[e.id].record.request.abort();delete(s.users[e.ke].mon[e.id].record.request);}
        };
        if(s.users[e.ke].mon[e.id].child_node){
            s.cx({f:'kill',d:s.init('clean',e)},s.users[e.ke].mon[e.id].child_node_id)
        }else{
            if(!x||x===1){return};p=x.pid;x.stdin.pause();setTimeout(function(){x.kill('SIGTERM');delete(x);setTimeout(function(){exec('kill -9 '+p)},1000)},1000)
        }
    }
}
s.cameraVals=function(e){
    e.t=Object.keys(s.users[e.ke].mon[e.id]);e.a={};
    e.t.forEach(function(n){
       if(s.users[e.ke].mon[e.id][n] instanceof Object){e.a[n]=s.users[e.ke].mon[e.id][n]};
    });
    return e.a;
}
//directories
s.users={};
s.dir={events:__dirname+'/events/',frames:__dirname+'/frames/'};
if (!fs.existsSync(s.dir.frames)){
    fs.mkdirSync(s.dir.frames);
}
if (!fs.existsSync(s.dir.events)){
    fs.mkdirSync(s.dir.events);
}
////Camera Controller
s.init=function(x,e){
    if(!e){e={}}
    switch(x){
        case 0://camera
            if(!s.users[e.ke]){s.users[e.ke]={}};
            if(!s.users[e.ke].mon){s.users[e.ke].mon={}}
            if(!s.users[e.ke].mon[e.mid]){s.users[e.ke].mon[e.mid]={}}
            if(!s.users[e.ke].mon[e.mid].watch){s.users[e.ke].mon[e.mid].watch={}};
            if(e.type==='record'){e.record=1}else{e.record=0}
            if(!s.users[e.ke].mon[e.mid].record){s.users[e.ke].mon[e.mid].record={yes:e.record}};
            if(!s.users[e.ke].mon[e.mid].started){s.users[e.ke].mon[e.mid].started=0};
        break;
        case'sync':
            e.cn=Object.keys(s.child_nodes);
            e.cn.forEach(function(v){
                if(s.users[e.ke]){
                   s.cx({f:'sync',sync:s.init('clean',s.users[e.ke].mon[e.mid]),ke:e.ke,mid:e.mid},s.child_nodes[v].cnid);
                }
            });
        break;
        case'clean':
            x={keys:Object.keys(e),ar:{}};
            x.keys.forEach(function(v){
                if(v!=='record'&&v!=='spawn'&&v!=='running'&&(v!=='time'&&typeof e[v]!=='function')){x.ar[v]=e[v];}
            });
            return x.ar;
        break;
        case'url':
            if(e.port==80){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+e.host+e.porty+e.path;return e.url;
        break;
    }
    if(typeof e.callback==='function'){setTimeout(function(){e.callback()},500);}
}
s.event=function(x,e){
    if(!e){e={}};
    if(e.mid){e.id=e.mid};
    switch(x){
        case'delete':
            e.dir=s.dir.events+e.ke+'/'+e.id+'/';
            e.save=[e.id,e.ke,s.nameToTime(e.filename),0];
            sql.query('DELETE FROM Videos WHERE `mid`=? AND `ke`=? AND `time`=? AND `status`=?',e.save)
            s.tx({f:'event_delete',filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),end:moment().format('YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
            if(fs.existsSync(e.dir+e.filename+'.'+e.ext)){
                return fs.unlinkSync(e.dir+e.filename+'.'+e.ext);
            }
        break;
        case'open':
            e.save=[e.id,e.ke,s.nameToTime(e.filename),e.ext];
            sql.query('INSERT INTO Videos (mid,ke,time,ext) VALUES (?,?,?,?)',e.save)
            s.tx({f:'event_build_start',filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),end:moment().format('YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
        break;
        case'close':
            e.dir=s.dir.events+e.ke+'/'+e.id+'/';
            if(s.users[e.ke]&&s.users[e.ke].mon[e.id]){
                if(s.users[e.ke].mon[e.id].open&&!e.filename){e.filename=s.users[e.ke].mon[e.id].open;}
                if(s.users[e.ke].mon[e.id].child_node){
                    s.cx({f:'close',d:s.init('clean',e)},s.users[e.ke].mon[e.id].child_node_id);
                }else{
                    console.log(e.dir+e.filename+'.'+e.ext)
                    if(fs.existsSync(e.dir+e.filename+'.'+e.ext)){
                        e.filesize=fs.statSync(e.dir+e.filename+'.'+e.ext)["size"];
                        if((e.filesize/100000).toFixed(2)>0.25){
                            e.save=[e.filesize,e.frames,1,e.id,e.ke,s.nameToTime(e.filename)];
                            sql.query('UPDATE Videos SET `size`=?,`frames`=?,`status`=? WHERE `mid`=? AND `ke`=? AND `time`=?',e.save)
         s.tx({f:'event_build_success',filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),end:moment().format('YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
                        }else{
                            s.event('delete',e);
                        }
                    }else{
                        
                        s.event('delete',e);
                    }
                }
            }
            delete(s.users[e.ke].mon[e.id].open);
//            s.init('sync',e)
        break;
    }
}
s.ffmpeg=function(y,e,x){
    if(!x){x={tmp:''}}
    switch(y){
    case'args':
            x.time=' -vf drawtext=fontfile=/usr/share/fonts/truetype/freefont/FreeSans.ttf:text=\'%{localtime}\':x=(w-tw)/2:y=0:fontcolor=white:box=1:boxcolor=0x00000000@1:fontsize=10';
        switch(e.ext){
            case'mp4':
                switch(e.type){
                    case'jpeg':case'mjpeg':
                        x.vcodec='libx264';
                    break;
                    case'h264':
                        x.acodec='copy',x.vcodec='copy';
                    break;
                }
            break;
            case'webm':
                x.acodec='libvorbis',x.vcodec='libvpx';
            break;
        }
        switch(e.type){
            case'jpeg':
                x.tmp='-loglevel quiet -f image2pipe -framerate 1 -vcodec mjpeg -i -'+x.time+' -vcodec '+x.vcodec+' -framerate 2 -q:v 1 '+e.dir+e.filename+'.'+e.ext;
            break;
            case'mjpeg':
                x.tmp='-loglevel quiet -use_wallclock_as_timestamps 1 -reconnect 1 -r 5 -f mjpeg -i '+e.url+x.time+' -vcodec '+x.vcodec+' -r '+e.fps+' -q:v 1 '+e.dir+e.filename+'.'+e.ext+' -f image2pipe -vf fps=1 -s '+e.ratio+' pipe:1';
            break;
            case'h264':
                x.tmp='-loglevel warning -use_wallclock_as_timestamps 1 -i '+e.url+' -r '+e.fps+' -acodec '+x.acodec+' -vcodec '+x.vcodec+' -q:v 1 '+e.dir+e.filename+'.'+e.ext+' -f image2pipe -vf fps=1 -s '+e.ratio+' pipe:1';
                console.log(x.tmp)
            break;
        }
        return x.tmp.split(' ');
    break;
    }
}
s.camera=function(x,e,cn,tx){
    var ee=s.init('clean',e);
    if(!e){e={}};if(cn&&cn.ke&&!e.ke){e.ke=cn.ke};
    if(!e.mode){e.mode=x;}
    if(!e.id&&e.mid){e.id=e.mid}
    switch(x){
        case'snapshot'://get snapshot from monitor URL
            e.url=s.init('url',e.mon);
            if(e.mon.type==='jpeg'){
                request({url:e.url,method:'GET',encoding:null},function(err,data){
                    if(err){s.tx({f:'monitor_snapshot',snapshot:'No Image',snapshot_format:'plc',mid:e.id},'GRP_'+e.ke);return};
                    s.tx({f:'monitor_snapshot',snapshot:data.body,snapshot_format:'ab',mid:e.id},'GRP_'+e.ke)
                })
            }else{
                s.tx({f:'monitor_snapshot',snapshot:'No Image',snapshot_format:'plc',mid:e.id},'GRP_'+e.ke)
            }
        break;
        case'record_off'://stop recording and start
            if(!s.users[e.ke].mon[e.id].record){s.users[e.ke].mon[e.id].record={}}
            s.users[e.ke].mon[e.id].record.yes=0;
            s.camera('start',e);
        break;
        case'watch_on'://live streamers - join
            s.init(0,{mid:e.id,ke:e.ke})
//            if(s.users[e.ke].mon[e.id].watch[cn.id]){s.camera('watch_off',e,cn,tx);return}
            if(!cn.monitor_watching){cn.monitor_watching={}}
            if(!cn.monitor_watching[e.id]){cn.monitor_watching[e.id]={ke:e.ke}}
            s.users[e.ke].mon[e.id].watch[cn.id]={};
//            if(Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
//                sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[e.ke,e.id],function(err,r) {
//                    if(r&&r[0]){
//                        r=r[0];
//                        r.url=s.init('url',r);
//                        s.users[e.ke].mon.type=r.type;
//                    }
//                })
//            }
        break;
        case'watch_off'://live streamers - leave
           if(cn.monitor_watching){delete(cn.monitor_watching[e.id])}
            if(s.users[e.ke].mon[e.id]&&s.users[e.ke].mon[e.id].watch){
                delete(s.users[e.ke].mon[e.id].watch[cn.id]),e.ob=Object.keys(s.users[e.ke].mon[e.id].watch).length
                if(e.ob===0){
                   if(s.users[e.ke].mon.type==='mjpeg'){
    //                   s.camera({mode:'frame_emitter',id:e.id,ke:e.ke})
                   }
                   delete(s.users[e.ke].mon[e.id].watch)
                }
            }else{
                e.ob=0;
            }
            s.tx({f:'monitor_watch_off',viewers:e.ob,ke:e.ke,id:e.id,cnid:cn.id},'MON_'+e.id);
        break;
        case'stop'://stop monitor
            if(!s.users[e.ke]||!s.users[e.ke].mon[e.id]){return}
            if(s.users[e.ke].mon[e.id].open){ee.filename=s.users[e.ke].mon[e.id].open,ee.ext=s.users[e.ke].mon[e.id].open_ext;s.event('close',ee)}
            if(s.users[e.ke].mon[e.id].started!==1){return}
            s.kill(s.users[e.ke].mon[e.id].spawn,e);
            clearInterval(s.users[e.ke].mon[e.id].running);
            s.users[e.ke].mon[e.id].started=0;
            s.tx({f:'monitor_stopping',id:e.id,ke:e.ke,time:s.moment(),reason:e.reason},'GRP_'+e.ke);
//            delete(s.users[e.ke].mon[e.id]);
        break;
        case'start':case'record'://stop or record monitor url
            s.init(0,{ke:e.ke,mid:e.id})
            e.url=s.init('url',e);
            if(s.users[e.ke].mon[e.id].started===1){return}
            s.users[e.ke].mon[e.id].started=1;
            s.kill(s.users[e.ke].mon[e.id].spawn,e);
            if(x==='record'){
                s.users[e.ke].mon[e.id].record.yes=1;
                e.dir=s.dir.events+e.ke+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.events+e.ke+'/'+e.id+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
            }else{
                e.dir=s.dir.frames+e.ke+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.frames+e.ke+'/'+e.id+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
            }
            s.tx({f:'monitor_starting',id:e.id,time:s.moment()});
            e.error_count=0;
//                e.error=0;
                e.set=function(x){
                    clearInterval(s.users[e.ke].mon[e.id].running);
                    s.users[e.ke].mon[e.id].running=setInterval(function(){//start loop
                         e.fn(x)
                    },60000*15);//every 15 minutes start a new file.
                }
                e.init_event=function(){
                    e.time=moment();
                    e.time=e.time.utcOffset('-0800');
                    if(s.users[e.ke].mon[e.id].open&&s.users[e.ke].mon[e.id].record.yes===1){
                        s.event('close',e);
                    }
                    e.filename=e.time.format('YYYY-MM-DDTHH-mm-ss');
                    s.users[e.ke].mon[e.id].open=e.filename;
                    s.users[e.ke].mon[e.id].open_ext=e.ext;
                    s.kill(s.users[e.ke].mon[e.id].spawn,e);
                    e.hosty=e.host.split('@');
                    if(e.hosty[1]){e.hosty=e.hosty[1];}else{e.hosty=e.hosty[0];}
                }
                switch(s.ratio(e.width,e.height)){
                    case'16:9':
                        e.ratio='640x360';
                    break;
                    default:
                        e.ratio='640x480';
                    break;
                }
                e.fn=function(){//this function loops to create new files
                    try{
                        e.init_event();
                        connectionTester.test(e.hosty,e.port,2000,function(err,o){
                            if(o.success===true){
                                s.event('open',e);
                                e.frames=0;
                                s.users[e.ke].mon[e.id].spawn = spawn('ffmpeg',s.ffmpeg('args',e));
                                if(!s.users[e.ke].mon[e.id].record){s.users[e.ke].mon[e.id].record={yes:1}}
                                switch(e.type){
                                    case'jpeg':
                                        e.captureOne=function(f){
                                            s.users[e.ke].mon[e.id].record.request=request({url:e.url,method:'GET',encoding: null,timeout:3000},function(er,data){
                                               ++e.frames; if(s.users[e.ke].mon[e.id].spawn&&s.users[e.ke].mon[e.id].spawn.stdin){
                                                if(er){++e.error_count;console.error('Snapshot Error '+e.id,er)
                                                          return;
                                                }

                                                   s.users[e.ke].mon[e.id].spawn.stdin.write(data.body);
                                                if(s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                                                    s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:data.body.toString('base64'),frame_format:'b64'},'MON_'+e.id);
                                                }
                                                s.users[e.ke].mon[e.id].record.capturing=setTimeout(function(){e.captureOne()},800);
                                                clearTimeout(e.timeOut),e.timeOut=setTimeout(function(){e.error_count=0;},3000)
                                                }
                                            }).on('error', function(err){
//                                                if(s.users[e.ke]&&s.users[e.ke].mon[e.id]&&s.users[e.ke].mon[e.id].record&&s.users[e.ke].mon[e.id].record.request){s.users[e.ke].mon[e.id].record.request.abort();}
                                                clearTimeout(s.users[e.ke].mon[e.id].record.capturing);
                                             if(e.error_count>4){e.fn();return}
                                                e.captureOne();
                                            });
                                      }
                                      e.captureOne()
                                    break;
                                    case'mjpeg':case'h264':
                                        if(!s.users[e.ke]||!s.users[e.ke].mon[e.id]){s.init(0,e)}
                                        s.users[e.ke].mon[e.id].spawn.on('error',function(er){++e.error_count;if(e.error_count>4){console.log('Camera Error, Stopping');s.camera('stop',{id:e.id,ke:e.ke})}})
                                        s.users[e.ke].mon[e.id].spawn.stdout.on('data',function(d){
                                           ++e.frames; if(s.users[e.ke]&&s.users[e.ke].mon[e.id]&&s.users[e.ke].mon[e.id].watch&&Object.keys(s.users[e.ke].mon[e.id].watch).length>0){
                                                s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:d.toString('base64'),frame_format:'b64'},'MON_'+e.id);

                                            }
                                        });
                                        s.users[e.ke].mon[e.id].spawn.stderr.on('data',function(d){
                                            d=d.toString();console.log('SPAWN ERROR '+e.id,d);
                                            e.chk=function(x){return d.indexOf(x)>-1;}
                                            switch(true){
//                                                case e.chk('av_interleaved_write_frame'):
                                                case e.chk('No such file or directory'):
                                                case e.chk('Invalid data found when processing input'):
                                                    if(e.frames===0){s.event('delete',e)};e.fn();
                                                break;
                                                case e.chk('Immediate exit requested'):
                                                case e.chk('timed out'):
                                                case e.chk('reset by peer'):
                                                   if(e.frames===0){s.event('delete',e)};s.camera('stop',e);return;
                                                break;
                                            }
                                        });
                                    break;
                                }
                                }else{
                                    console.log('Cannot Connect, Retrying...',e.id);++e.error_count;clearTimeout(e.err_timeout);e.err_timeout=setTimeout(function(){if(e.error_count>4){console.log('Camera Error, Stopping',e.id);s.camera('stop',{id:e.id,ke:e.ke})}else{}},5000);return;             
                                }
                        });
                    }catch(err){++e.error_count;console.error('Frame Capture Error '+e.id,err);s.tx({f:'error',data:err},'GRP_2Df5hBE');}
                }
                //start drawing files
                if(s.child_help===true){
                    e.ch=Object.keys(s.child_nodes);
                    if(e.ch.length>0){
                        e.ch_stop=0;
                        e.fn=function(n){
                            e.init_event();
                        connectionTester.test(e.hosty,e.port,2000,function(err,o){
                            if(o.success===true){
                                s.event('open',e);
                                e.frames=0;
                                s.users[e.ke].mon[e.id].spawn={};
                                s.users[e.ke].mon[e.id].child_node=n;
                                s.cx({f:'spawn',d:s.init('clean',e),mon:s.init('clean',s.users[e.ke].mon[e.mid])},s.users[e.ke].mon[e.mid].child_node_id)
                            }else{
                                console.log('Cannot Connect, Retrying...',e.id);++e.error_count;setTimeout(function(){if(e.error_count>4){console.log('Camera Error, Stopping',e.id);s.camera('stop',{id:e.id,ke:e.ke})}else{e.fn();}},5000);return;             
                            }
                        })
                        }
                        e.ch.forEach(function(n){
                            if(e.ch_stop===0&&s.child_nodes[n].cpu<80){
                                e.ch_stop=1;
                                e.set(n);s.users[e.ke].mon[e.mid].child_node=n;
                                e.set(n);s.users[e.ke].mon[e.mid].child_node_id=s.child_nodes[n].cnid;
                                e.fn(n);
                            }
                        })

                    }else{
                        e.set();
                        e.fn();
                    }
                }else{
                    e.set();
                    e.fn();
                }
        break;
    }
    
    if(typeof cn==='function'){console.log(cn);setTimeout(function(){cn()},1000);}
//    s.init('sync',e)
}

////socket controller
s.cn=function(cn){return{id:cn.id,ke:cn.ke,uid:cn.uid}}
io.on('connection', function (cn) {
var tx;
    cn.on('f',function(d){
        if(!cn.ke&&d.f==='init'){
            cn.ip=cn.request.connection.remoteAddress;
            tx=function(z){if(!z.ke){z.ke=cn.ke;};cn.emit('f',z);}
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
                            if(d.mid){d.sql+=' AND mid=?';d.ar.push(d.mid)}
                            d.sql+=' ORDER BY `end` DESC';
                            if(d.limit){d.sql+=' LIMIT '+d.limit;}
                            sql.query(d.sql,d.ar,function(err,r){
                                d.cx[d.ff]=r,tx(d.cx);
                            });
                        break;
                    }
                break;
                case'monitor':
                    switch(d.ff){
                        case'add':
            if(d.mon&&d.mon.mid&&d.mon.name){
                d.set=[],d.ar=[];
                if(!d.mon.ke){d.mon.ke=cn.ke}
                sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[d.mon.ke,d.mon.mid],function(er,r){
                    d.tx={f:'monitor_edit',mid:d.mon.mid,ke:d.mon.ke,mon:d.mon};
                    if(r&&r[0]){
                        d.tx.new=false;
                        Object.keys(d.mon).forEach(function(v){
                            if(d.mon[v]&&d.mon[v]!==''){
                                d.set.push(v+'=?'),d.ar.push(d.mon[v]);
                            }
                        })
                        d.set=d.set.join(',');
                        d.ar.push(d.mon.ke),d.ar.push(d.mon.mid);
                        sql.query('UPDATE Monitors SET '+d.set+' WHERE ke=? AND mid=?',d.ar)
                    }else{
                        d.tx.new=true;
                        d.st=[];
                        Object.keys(d.mon).forEach(function(v){
                            if(d.mon[v]&&d.mon[v]!==''){
                                d.set.push(v),d.st.push('?'),d.ar.push(d.mon[v]);
                            }
                        })
                        d.set.push('ke'),d.st.push('?'),d.ar.push(d.mon.ke);
                        d.set=d.set.join(','),d.st=d.st.join(',');
                        sql.query('INSERT INTO Monitors ('+d.set+') VALUES ('+d.st+')',d.ar)
                    }
                    d.mon.id=d.mon.mid;
                    s.camera('stop',d.mon);
                    console.log(d.mon.mode)
                    console.log(d.mon)
                    console.log(d.mon.ext)
                    setTimeout(function(){console.log(d.mon.mode);s.camera(d.mon.mode,d.mon);},5000)
                    s.tx(d.tx,'GRP_'+d.mon.ke);
                })
            }
                            break;
                        case'record_on':case'record_off':
                            if(!d.ke){d.ke=cn.ke;}
                    sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[cn.ke,d.id],function(err,r) {
                        if(r&&r[0]){r=r[0]
                            if(d.ff==='record_on'){d.mode='record'}else{d.mode='start'};d.type=r.type;
                            sql.query("UPDATE Monitors SET mode=? WHERE mid=? AND ke=?",[d.mode,d.id,d.ke],function(){
                                
                                d.callback=function(){delete(d.callback);s.camera(d.mode,d)};s.camera('stop',d);
                                tx({f:d.ff,id:d.id})
                            })
                        }
                    })
                        break;
                        case'watch_on':
                            if(!d.ke){d.ke=cn.ke}
                            if(!s.users[d.ke]||!s.users[d.ke].mon[d.id]){return false}
                            s.camera(d.ff,d,cn,tx)
                            cn.join('MON_'+d.id);
                            if(s.users[d.ke]&&s.users[d.ke].mon&&s.users[d.ke].mon[d.id]&&s.users[d.ke].mon[d.id].watch){
                                
s.tx({f:'monitor_watch_on',viewers:Object.keys(s.users[d.ke].mon[d.id].watch).length,id:d.id,ke:d.ke},'MON_'+d.id)
                           }
                        break;
                        case'watch_off':
                            if(!d.ke){d.ke=cn.ke;};cn.leave('MON_'+d.id);s.camera(d.ff,d,cn,tx);
                            tx({f:'monitor_watch_off',viewers:d.ob,id:d.id,cnid:cn.id});
                        break;
                        case'start':case'stop':
                    sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[cn.ke,d.id],function(err,r) {
                        if(r&&r[0]){r=r[0]
                            s.camera(d.ff,{type:r.type,url:s.init('url',r),id:d.id,mode:d.ff,ke:cn.ke});
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
    cn.on('c',function(d){//functions for dispersing work to child servers;
//        if(!cn.ke&&d.socket_key===s.child_key){
            if(!cn.shinobi_child&&d.f=='init'){
                cn.ip=cn.request.connection.remoteAddress;
                cn.shinobi_child=1;
                tx=function(z){cn.emit('c',z);}
                if(!s.child_nodes[cn.ip]){s.child_nodes[cn.ip]=d.u;};
                s.child_nodes[cn.ip].cnid=cn.id;
                s.child_nodes[cn.ip].cpu=0;
                tx({f:'init_success',child_nodes:s.child_nodes});
            }else{
                if(d.f!=='s.tx'){console.log(d)};
                switch(d.f){
                    case'sql':
                        sql.query(d.query,d.values);
                    break;
                    case'camera':
                        s.camera(d.mode,d.data)
                    break;
                    case's.tx':
                        s.tx(d.data,d.to)
                    break;
                    case'created_file':
                        d.dir=s.dir.events+d.d.ke+'/'+d.d.mid+'/';
                        console.log('created_file '+d.d.mid,d.dir+d.filename)
                        fs.writeFile(d.dir+d.filename,d.created_file,'binary',function (err,data) {
                            if (err) {
                                return console.error('created_file'+d.d.mid,err);
                            }
                           tx({f:'delete_file',file:d.filename,ke:d.d.ke,mid:d.d.mid}); s.tx({f:'event_build_success',filename:s.users[d.d.ke].mon[d.d.mid].open+'.'+e.ext,mid:d.d.mid,ke:d.d.ke,time:s.nameToTime(s.users[d.d.ke].mon[d.d.mid].open),end:moment().format('YYYY-MM-DD HH:mm:ss')},'GRP_'+d.d.ke);
                        });
                    break;
                }
            }
//        }
    })
    cn.on('disconnect', function () {
        if(cn.ke){
            if(cn.monitor_watching){
                cn.monitor_count=Object.keys(cn.monitor_watching)
                if(cn.monitor_count.length>0){
                    cn.monitor_count.forEach(function(v){
                        s.camera('watch_off',{id:v,ke:cn.monitor_watching[v].ke},s.cn(cn))
                    })
                }
            }
            delete(s.users[cn.ke].vid[cn.id]);
        }
        if(cn.shinobi_child){
            delete(s.child_nodes[cn.ip]);
        }
    })
});
////Pages
app.use(express.static(s.dir.events));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//readme
app.get('/info', function (req,res){
    res.sendFile(__dirname+'/index.html');
});
//main page
app.get('/', function (req,res){
    res.sendFile(__dirname+'/web/index.html');
});
//login function
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

//Control monitor mode via HTTP
app.get(['/monitor/:ke/:mid/:f','/monitor/:ke/:mid/:f/:ff','/monitor/:ke/:mid/:f/:ff/:fff'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.mid],function(err,r){
        if(r&&r[0]){
            r=r[0];
            if(r.mode!==req.params.f){
                s.camera(req.params.f,r);req.ret.cmd_at=moment();
                req.ret.msg='Monitor mode changed to : '+req.params.f,req.ret.ok=true;
                sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',[req.params.f,r.ke,r.mid]);
                if(req.params.ff&&req.params.f!=='stop'){
                    req.params.ff=parseInt(req.params.ff);
                    switch(req.params.fff){
                        case'day':case'days':
                            req.timeout=req.params.ff*1000*60*60*24
                        break;
                        case'hr':case'hour':case'hours':
                            req.timeout=req.params.ff*1000*60*60
                        break;
                        case'min':case'minute':case'minutes':
                            req.timeout=req.params.ff*1000*60
                        break;
                        default://seconds
                            req.timeout=req.params.ff*1000
                        break;
                    }
                    setTimeout(function(){sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',['stop',r.ke,r.mid]);s.camera('stop')},req.timeout);
                    req.ret.end_at=moment().add(req.timeout,'milliseconds');
                }
            }else{
                req.ret.msg='Monitor mode is already : '+req.params.f;
            }
        }else{
            req.ret.msg='Monitor or Key does not exist.';
        }
        res.send(JSON.stringify(req.ret, null, 3));
    })
})
//Get lib files
app.get('/libs/:f/:f2', function (req,res){
    req.dir=__dirname+'/web/libs/'+req.params.f+'/'+req.params.f2;
    if (fs.existsSync(req.dir)){
        fs.createReadStream(req.dir).pipe(res);
    }
});
//get video file
app.get('/:suf/:ke/:id/:file', function (req,res){
    req.dir=__dirname+'/'+req.params.suf+'/'+req.params.ke+'/'+req.params.id+'/'+req.params.file;
    if (fs.existsSync(req.dir)){
        res.setHeader('content-type','video/'+req.params.file.split('.')[1]);
        res.sendFile(req.dir);
    }else{
        res.send('File Not Found')
    }
});
//get events
app.get(['/events/:ke','/events/:ke/:id'], function (req,res){
    req.sql='SELECT * FROM Videos WHERE ke=?';req.ar=[req.params.ke];
    if(req.params.id){req.sql+='and mid=?';req.ar.push(req.params.id)}
    sql.query(req.sql,req.ar,function(err,r){
        
        r.forEach(function(v){
            v.href='/events/'+v.ke+'/'+v.mid+'/'+s.moment(v.time)+'.'+e.ext;
        })
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(r, null, 3));
        res.end();
    })
});

//preliminary monitor start
setTimeout(function(){
sql.query('SELECT * FROM Monitors WHERE mode != "stop"', function(err,r) {
    if(err){console.log(err)}
    if(r&&r[0]){
        r.forEach(function(v){
            r.ar={};
            r.ar.id=v.mid;
            Object.keys(v).forEach(function(b){
                r.ar[b]=v[b];
            })
            s.camera(v.mode,r.ar);
        });
    }
});
},1500)