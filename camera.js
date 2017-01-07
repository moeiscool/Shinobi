//
// Shinobi
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
// https://www.bountysource.com/teams/shinobi
//
var fs = require('fs');
var os = require('os-utils');
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
var df = require('node-df');
var config = require('./conf.json');

server.listen(config.port);
console.log('Shinobi is listening :',config.port);

s={child_help:false};
s.disc=function(){
    sql = mysql.createConnection(config.db);
    sql.connect(function(err){if(err){console.log('Error Connecting : DB',err);setTimeout(s.disc, 2000);}});
    sql.on('error',function(err) {console.log('DB Lost.. Retrying..');console.log(err);s.disc();return;});
}
s.disc();
exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9");//kill any ffmpeg running

process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
////close open videos
sql.query('SELECT * FROM Videos WHERE status=?',[0],function(err,r){
    if(r&&r[0]){
        r.forEach(function(v){
            s.init(0,v);
            v.filename=s.moment(v.time);
            s.video('close',v);
//            delete(s.group[v.ke].mon[v.mid]);
        })
    }
})

//key for child servers
s.child_nodes={};
s.child_key='3123asdasdf1dtj1hjk23sdfaasd12asdasddfdbtnkkfgvesra3asdsd3123afdsfqw345';
s.md5=function(x){return crypto.createHash('md5').update(x).digest("hex");}
s.tx=function(z,y,x){if(x){return x.broadcast.to(y).emit('f',z)};io.to(y).emit('f',z);}
s.cx=function(z,y,x){if(x){return x.broadcast.to(y).emit('c',z)};io.to(y).emit('c',z);}

//load camera controller vars
s.nameToTime=function(x){x=x.split('.')[0].split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
s.ratio=function(width,height,ratio){ratio = width / height;return ( Math.abs( ratio - 4 / 3 ) < Math.abs( ratio - 16 / 9 ) ) ? '4:3' : '16:9';}
s.gid=function(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
if(!config.utcOffset){config.utcOffset='-0800'}
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    e=moment(e);if(config.utcOffset){e=e.utcOffset(config.utcOffset)}
    return e.format(x);
}
s.kill=function(x,e,p){
    if(s.group[e.ke]&&s.group[e.ke].mon[e.id]){
        if(e&&s.group[e.ke].mon[e.id].record){
            clearTimeout(s.group[e.ke].mon[e.id].record.capturing);
//            if(s.group[e.ke].mon[e.id].record.request){s.group[e.ke].mon[e.id].record.request.abort();delete(s.group[e.ke].mon[e.id].record.request);}
        };
        if(s.group[e.ke].mon[e.id].child_node){
            s.cx({f:'kill',d:s.init('clean',e)},s.group[e.ke].mon[e.id].child_node_id)
        }else{
            if(!x||x===1){return};p=x.pid;x.stdin.pause();setTimeout(function(){x.kill('SIGTERM');delete(x);setTimeout(function(){exec('kill -9 '+p)},1000)},1000)
        }
    }
}
s.log=function(e,x){
    if(!x||!e.mid){return}
    ////commented out for now because need to iron out what it actually gets put in there.
//    sql.query('INSERT INTO Logs (ke,mid,info) VALUES (?,?,?)',[e.ke,e.mid,JSON.stringify(x)]);
    s.tx({f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke);
//    console.log('s.log : ',{f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke)
}
//directories
s.group={};
s.dir={videos:__dirname+'/videos/'};
if (!fs.existsSync(s.dir.videos)){
    fs.mkdirSync(s.dir.videos);
}
////Camera Controller
s.init=function(x,e){
    if(!e){e={}}
    switch(x){
        case 0://camera
            if(!s.group[e.ke]){s.group[e.ke]={}};
            if(!s.group[e.ke].mon){s.group[e.ke].mon={}}
            if(!s.group[e.ke].mon[e.mid]){s.group[e.ke].mon[e.mid]={}}
            if(!s.group[e.ke].mon[e.mid].watch){s.group[e.ke].mon[e.mid].watch={}};
            if(e.type==='record'){e.record=1}else{e.record=0}
            if(!s.group[e.ke].mon[e.mid].record){s.group[e.ke].mon[e.mid].record={yes:e.record}};
            if(!s.group[e.ke].mon[e.mid].started){s.group[e.ke].mon[e.mid].started=0};
            if(s.group[e.ke].mon[e.mid].delete){clearTimeout(s.group[e.ke].mon[e.mid].delete)}
        break;
        case'sync':
            e.cn=Object.keys(s.child_nodes);
            e.cn.forEach(function(v){
                if(s.group[e.ke]){
                   s.cx({f:'sync',sync:s.init('clean',s.group[e.ke].mon[e.mid]),ke:e.ke,mid:e.mid},s.child_nodes[v].cnid);
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
            auth_details='';
            if(e.details.muser&&e.details.muser!==''&&e.details.mpass&&e.details.mpass!=='') {
                auth_details=e.details.muser+':'+e.details.mpass+'@';
            }
            if(e.port==80){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+auth_details+e.host+e.porty+e.path;return e.url;
        break;
        case'url_no_path':
            auth_details='';
            if(e.details.muser&&e.details.muser!==''&&e.details.mpass&&e.details.mpass!=='') {
                auth_details=e.details.muser+':'+e.details.mpass+'@';
            }
            if(e.port==80){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+auth_details+e.host+e.porty;return e.url;
        break;
    }
    if(typeof e.callback==='function'){setTimeout(function(){e.callback()},500);}
}
s.video=function(x,e){
    if(!e){e={}};
    if(e.mid&&!e.id){e.id=e.mid};
    switch(x){
        case'delete':
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if(!e.status){e.status=0}
            e.save=[e.id,e.ke,s.nameToTime(e.filename),e.status];
            sql.query('DELETE FROM Videos WHERE `mid`=? AND `ke`=? AND `time`=? AND `status`=?',e.save,function(err,r){
                if(r&&r.affectedRows>0){
                    s.tx({f:'video_delete',filename:e.filename+'.'+e.ext,mid:e.mid,ke:e.ke,time:s.nameToTime(e.filename),end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
                    s.file('delete',e.dir+e.filename+'.'+e.ext)
                }
            })
        break;
        case'open':
            e.save=[e.id,e.ke,s.nameToTime(e.filename),e.ext];
            if(!e.status){e.save.push(0)}else{e.save.push(e.status)}
            sql.query('INSERT INTO Videos (mid,ke,time,ext,status) VALUES (?,?,?,?,?)',e.save)
            s.tx({f:'video_build_start',filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
        break;
        case'close':
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if(s.group[e.ke]&&s.group[e.ke].mon[e.id]){
                if(s.group[e.ke].mon[e.id].open&&!e.filename){e.filename=s.group[e.ke].mon[e.id].open;e.ext=s.group[e.ke].mon[e.id].open_ext}
                if(s.group[e.ke].mon[e.id].child_node){
                    s.cx({f:'close',d:s.init('clean',e)},s.group[e.ke].mon[e.id].child_node_id);
                }else{
                    if(fs.existsSync(e.dir+e.filename+'.'+e.ext)){
                        e.filesize=fs.statSync(e.dir+e.filename+'.'+e.ext)["size"];
                        if((e.filesize/100000).toFixed(2)>0.25){
                            e.save=[e.filesize,e.frames,1,e.id,e.ke,s.nameToTime(e.filename)];
                            if(!e.status){e.save.push(0)}else{e.save.push(e.status)}
                            sql.query('UPDATE Videos SET `size`=?,`frames`=?,`status`=? WHERE `mid`=? AND `ke`=? AND `time`=? AND `status`=?',e.save)
         s.tx({f:'video_build_success',filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),size:e.filesize,end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
                        }else{
                            s.video('delete',e);
                            s.log(e,{type:'File Corrupt',msg:{ffmpeg:s.group[e.ke].mon[e.mid].ffmpeg,filesize:(e.filesize/100000).toFixed(2)}})
                        }
                    }else{
                        s.video('delete',e);
                        s.log(e,{type:'File Not Exist',msg:'Cannot save non existant file. Something went wrong.',ffmpeg:s.group[e.ke].mon[e.mid].ffmpeg})
                    }
                }
            }
            delete(s.group[e.ke].mon[e.id].open);
//            s.init('sync',e)
        break;
    }
}
s.ffmpeg=function(e,x){
    if(!x){x={tmp:''}}
//            if(!e.details.cutoff||e.details.cutoff===''){x.cutoff=15}else{x.cutoff=parseFloat(e.details.cutoff)};if(isNaN(x.cutoff)===true){x.cutoff=15}
//            x.segment=' -f segment -strftime 1 -segment_time '+(60*x.cutoff)+' -segment_format '+e.ext
        if(!e.details.timestamp||e.details.timestamp==1){x.time=' -vf drawtext=fontfile=/usr/share/fonts/truetype/freefont/FreeSans.ttf:text=\'%{localtime}\':x=(w-tw)/2:y=0:fontcolor=white:box=1:boxcolor=0x00000000@1:fontsize=10';}else{x.time=''}
    switch(e.ext){
        case'mp4':
            x.vcodec='libx265';x.acodec='libfaac';
            if(e.details.vcodec&&e.details.vcodec!==''){x.vcodec=e.details.vcodec}
        break;
        case'webm':
            x.acodec='libvorbis',x.vcodec='libvpx';
        break;
    }
    if(e.details.acodec&&e.details.acodec!==''){x.acodec=e.details.acodec}
    if(x.acodec==='none'){x.acodec=''}else{x.acodec=' -acodec '+x.acodec}
    if(x.vcodec!=='none'){x.vcodec=' -vcodec '+x.vcodec}
    if(e.fps&&e.fps!==''){x.framerate=' -r '+e.fps}else{x.framerate=''}
    if(e.details.vf&&e.details.vf!==''){
        if(x.time===''){x.vf=' -vf '}else{x.vf=','}
        x.vf+=e.details.vf;
        x.time+=x.vf;
    }
    if(e.details.svf&&e.details.svf!==''){x.svf=' -vf '+e.details.svf;}else{x.svf='';}
//        if(e.details.svf){'-vf "rotate=45*(PI/180)'}
    switch(e.type){
        case'socket':case'jpeg':case'pipe':
            if(!x.vf||x.vf===','){x.vf=''}
            x.tmp='-loglevel warning -pattern_type glob -f image2pipe'+x.framerate+' -vcodec mjpeg -i -'+x.vcodec+x.time+x.framerate+' -use_wallclock_as_timestamps 1 -q:v 1'+x.vf+' '+e.dir+e.filename+'.'+e.ext;
        break;
        case'mjpeg':
            if(e.mode=='record'){
                x.watch=x.vcodec+x.time+' -r 10 -s '+e.width+'x'+e.height+' -use_wallclock_as_timestamps 1 -q:v 1 '+e.dir+e.filename+'.'+e.ext+''
            }else{
                x.watch='';
            };
            x.tmp='-loglevel warning -reconnect 1 -f mjpeg -i '+e.url+''+x.watch+' -f image2pipe'+x.svf+' -s '+e.ratio+' pipe:1';
        break;
        case'h264':
            if(!x.vf||x.vf===','){x.vf=''}
            if(e.mode=='record'){
                x.watch=x.vcodec+x.framerate+x.acodec+' -movflags frag_keyframe+empty_moov -s '+e.width+'x'+e.height+' -use_wallclock_as_timestamps 1 -q:v 1'+x.vf+' '+e.dir+e.filename+'.'+e.ext
            }else{
                x.watch='';
            };
            x.tmp='-loglevel warning -i '+e.url+' -stimeout 2000'+x.watch+' -f image2pipe'+x.svf+' -s '+e.ratio+' pipe:1';
        break;
        case'local':
            if(e.mode=='record'){
                x.watch=x.vcodec+x.time+x.framerate+x.acodec+' -movflags frag_keyframe+empty_moov -s '+e.width+'x'+e.height+' -use_wallclock_as_timestamps 1 '+e.dir+e.filename+'.'+e.ext
            }else{
                x.watch='';
            };
            x.tmp='-loglevel warning -i '+e.path+''+x.watch+' -f image2pipe'+x.svf+' -s '+e.ratio+' pipe:1';
        break;
    }
    s.group[e.ke].mon[e.mid].ffmpeg=x.tmp;
    return spawn('ffmpeg',x.tmp.split(' '));
}
s.file=function(x,e){
    if(!e){e={}};
    switch(x){
        case'size':
             return fs.statSync(e.filename)["size"];
        break;
        case'delete':
            if(!e){return false;}
            return exec('rm -rf '+e);
        break;
        case'delete_files':
            if(!e.age_type){e.age_type='min'};if(!e.age){e.age='1'};
            exec('find '+e.path+' -type f -c'+e.age_type+' +'+e.age+' -exec rm -rf {} +');
        break;
    }
}
s.camera=function(x,e,cn,tx){
    var ee=s.init('clean',e);
    if(!e){e={}};if(cn&&cn.ke&&!e.ke){e.ke=cn.ke};
    if(!e.mode){e.mode=x;}
    if(!e.id&&e.mid){e.id=e.mid}
    if(e.details&&(e.details instanceof Object)===false){
        try{e.details=JSON.parse(e.details)}catch(err){}
    }
    switch(x){
        case'snapshot'://get snapshot from monitor URL
            if(e.mon.mode!=='stop'){
                e.url=s.init('url',e.mon);
                switch(e.mon.type){
//                    case'mjpeg':case'h264':
//                       e.pic=s.dir.videos+e.ke+'/'+e.mid+'/snap.jpg';
//                        exec('ffmpeg -loglevel quiet -i "'+e.url+'" -f mjpeg -vframes 1 -updatefirst 1 -pix_fmt yuvj420p '+e.pic,function(err,data){
//                           if(err){console.log(err);return};
//                           fs.writeFileSync(e.pic,data); s.tx({f:'monitor_snapshot',snapshot:data.toString('base64'),snapshot_format:'b64',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
//                        });
//                    break;
                    case'jpeg':
                        request({url:e.url,method:'GET',encoding:null},function(err,data){
                            if(err){s.tx({f:'monitor_snapshot',snapshot:'No Image',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke);return};
                            s.tx({f:'monitor_snapshot',snapshot:data.body,snapshot_format:'ab',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                        })
                    break;
                    default:
                        s.tx({f:'monitor_snapshot',snapshot:'...',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                    break;
                }
            }else{
                s.tx({f:'monitor_snapshot',snapshot:'Disabled',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
            }
        break;
        case'record_off'://stop recording and start
            if(!s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record={}}
            s.group[e.ke].mon[e.id].record.yes=0;
            s.camera('start',e);
        break;
        case'watch_on'://live streamers - join
            s.init(0,{mid:e.id,ke:e.ke});
//            if(s.group[e.ke].mon[e.id].watch[cn.id]){s.camera('watch_off',e,cn,tx);return}
            if(!cn.monitor_watching){cn.monitor_watching={}}
            if(!cn.monitor_watching[e.id]){cn.monitor_watching[e.id]={ke:e.ke}}
            s.group[e.ke].mon[e.id].watch[cn.id]={};
//            if(Object.keys(s.group[e.ke].mon[e.id].watch).length>0){
//                sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[e.ke,e.id],function(err,r) {
//                    if(r&&r[0]){
//                        r=r[0];
//                        r.url=s.init('url',r);
//                        s.group[e.ke].mon.type=r.type;
//                    }
//                })
//            }
        break;
        case'watch_off'://live streamers - leave
           if(cn.monitor_watching){delete(cn.monitor_watching[e.id])}
            if(s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].watch){
                delete(s.group[e.ke].mon[e.id].watch[cn.id]),e.ob=Object.keys(s.group[e.ke].mon[e.id].watch).length
                if(e.ob===0){
                   if(s.group[e.ke].mon.type==='mjpeg'){
    //                   s.camera({mode:'frame_emitter',id:e.id,ke:e.ke})
                   }
                   delete(s.group[e.ke].mon[e.id].watch)
                }
            }else{
                e.ob=0;
            }
            s.tx({f:'monitor_watch_off',viewers:e.ob,ke:e.ke,id:e.id,cnid:cn.id},'MON_'+e.id);
        break;
        case'stop'://stop monitor
            if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){return}
            if(s.group[e.ke].mon[e.id].open){ee.filename=s.group[e.ke].mon[e.id].open,ee.ext=s.group[e.ke].mon[e.id].open_ext;s.video('close',ee)}
            if(s.group[e.ke].mon[e.id].started!==1){return}
            s.kill(s.group[e.ke].mon[e.id].spawn,e);
            clearInterval(s.group[e.ke].mon[e.id].running);
            s.group[e.ke].mon[e.id].started=0;
            if(s.group[e.ke].mon[e.mid].record){s.group[e.ke].mon[e.mid].record.yes=0}
            s.log(e,{type:'Monitor Stopping',msg:'Monitor session has been ordered to stop.'});
            s.tx({f:'monitor_stopping',mid:e.id,ke:e.ke,time:s.moment(),reason:e.reason},'GRP_'+e.ke);
            if(e.delete===1){
                s.group[e.ke].mon[e.id].delete=setTimeout(function(){delete(s.group[e.ke].mon[e.id]);},60000*60);
            }
        break;
        case'start':case'record'://watch or record monitor url
            s.init(0,{ke:e.ke,mid:e.id})
            if(!s.group[e.ke].mon_conf){s.group[e.ke].mon_conf={}}
            if(!s.group[e.ke].mon_conf[e.id]){s.group[e.ke].mon_conf[e.id]=s.init('clean',e);}
            e.url=s.init('url',e);
            if(s.group[e.ke].mon[e.id].started===1){return}
            if(!e.details.cutoff||e.details.cutoff===''){e.details.cutoff=60000*15;}else{e.details.cutoff=parseFloat(e.details.cutoff)*60000}//every 15 minutes start a new file.
            s.group[e.ke].mon[e.id].started=1;
            s.kill(s.group[e.ke].mon[e.id].spawn,e);
            if(x==='record'){
                s.group[e.ke].mon[e.id].record.yes=1;
                e.dir=s.dir.videos+e.ke+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
                e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
                if (!fs.existsSync(e.dir)){
                    fs.mkdirSync(e.dir);
                }
            }else{
                s.group[e.ke].mon[e.mid].record.yes=0;
            }
            s.log(e,{type:'Monitor Starting',msg:{mode:x}});
            s.tx({f:'monitor_starting',mode:x,mid:e.id,time:s.moment()},'GRP_'+e.ke);
            e.error_fatal_count=0;
            e.error_count=0;
                e.set=function(y){
                    clearInterval(s.group[e.ke].mon[e.id].running);
                    if(x==='record'){
                        s.group[e.ke].mon[e.id].running=setInterval(function(){//start loop
                            e.fn(y)
                        },e.details.cutoff);
                    }
                }
                e.init_video=function(k){
                    s.kill(s.group[e.ke].mon[e.id].spawn,e);

                    if(s.group[e.ke].mon[e.id].open&&s.group[e.ke].mon[e.id].record.yes===1){
                        s.video('close',e);
                    }
                    e.filename=s.moment();
                    s.group[e.ke].mon[e.id].open=e.filename;
                    s.group[e.ke].mon[e.id].open_ext=e.ext;
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
                e.error_fatal=function(x){
                    clearTimeout(e.err_fatal_timeout);
                    ++e.error_fatal_count;
                    e.err_fatal_timeout=setTimeout(function(){
                        if(e.error_fatal_count>10){
                            s.camera('stop',{id:e.id,ke:e.ke})
                        }else{
                            e.fn()
                        };
                    },5000);
                }
                e.error=function(x){
//                    clearTimeout(e.err_timeout);
//                    e.err_timeout=setTimeout(function(){
//                        ++e.error_count;
//                        if(e.error_count>10){if(x){x.stop=1;s.log(e,x)};s.camera('stop',{id:e.id,ke:e.ke})}else{e.fn()};//stop after 4 errors
//                    },5000);
                }
                e.fn=function(){//this function loops to create new files
                    try{
                        e.init_video();
                        e.draw=function(err,o){
                            if(o.success===true){
                                if(x==='record'){
                                    s.video('open',e);
                                }
                                e.frames=0;
                                if(!s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record={yes:1}};
                                if(x==='record'||e.type==='mjpeg'||e.type==='h264'||e.type==='local'){s.group[e.ke].mon[e.id].spawn = s.ffmpeg(e);}
                                switch(e.type){
                                    case'jpeg':
                                        e.captureOne=function(f){
                                            s.group[e.ke].mon[e.id].record.request=request({url:e.url,method:'GET',encoding: null,timeout:3000},function(er,data){
                                               ++e.frames; if(s.group[e.ke].mon[e.id].spawn&&s.group[e.ke].mon[e.id].spawn.stdin){
                                                if(er){++e.error_count;s.log(e,{type:'Snapshot Error',msg:er});
                                                          return;
                                                }
                                               if(x==='record'&&s.group[e.ke].mon[e.id].spawn&&s.group[e.ke].mon[e.id].spawn.stdin){
                                                   s.group[e.ke].mon[e.id].spawn.stdin.write(data.body);
                                               }
                                                if(s.group[e.ke].mon[e.id].watch&&Object.keys(s.group[e.ke].mon[e.id].watch).length>0){
                                                    s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:data.body.toString('base64'),frame_format:'b64'},'MON_'+e.id);
                                                }
                                                s.group[e.ke].mon[e.id].record.capturing=setTimeout(function(){e.captureOne()},800);
                                                clearTimeout(e.timeOut),e.timeOut=setTimeout(function(){e.error_count=0;},3000)
                                                }
                                            }).on('error', function(err){
//                                                if(s.group[e.ke]&&s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].record&&s.group[e.ke].mon[e.id].record.request){s.group[e.ke].mon[e.id].record.request.abort();}
                                                clearTimeout(s.group[e.ke].mon[e.id].record.capturing);
                                             if(e.error_count>4){e.fn();return}
                                                e.captureOne();
                                            });
                                      }
                                      e.captureOne()
                                    break;
                                    case'mjpeg':case'h264':case'socket':case'local':
                                        if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){s.init(0,e)}
                                        if(s.group[e.ke].mon[e.id].spawn){
                                            s.group[e.ke].mon[e.id].spawn.on('error',function(er){e.error({type:'Spawn Error',msg:er})})
                                            s.group[e.ke].mon[e.id].spawn.stdout.on('data',function(d){
                                               ++e.frames; if(s.group[e.ke]&&s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].watch&&Object.keys(s.group[e.ke].mon[e.id].watch).length>0){
                                                    s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:d.toString('base64'),frame_format:'b64'},'MON_'+e.id);

                                                }
                                            });
                                            s.group[e.ke].mon[e.id].spawn.stderr.on('data',function(d){
                                                d=d.toString();
                                                e.chk=function(x){return d.indexOf(x)>-1;}
                                                switch(true){
    //                                                case e.chk('av_interleaved_write_frame'):
                                                    case e.chk('Connection timed out'):
                                                        setTimeout(function(){s.log(e,{type:"Can't Connect",msg:'Retrying...'});e.error_fatal();},1000)//restart
                                                    break;
                                                    case e.chk('No pixel format specified'):
                                                        s.log(e,{type:"FFMPEG STDERR",msg:{ffmpeg:s.group[e.ke].mon[e.id].ffmpeg,msg:d}})
                                                    break;
                                                    case e.chk('RTP: missed'):
                                                    case e.chk('deprecated pixel format used, make sure you did set range correctly'):
                                                        return
                                                    break;
                                                    case e.chk('No such file or directory'):
                                                    case e.chk('Unable to open RTSP for listening'):
                                                    case e.chk('timed out'):
                                                    case e.chk('Invalid data found when processing input'):
                                                        if(e.frames===0&&x==='record'){s.video('delete',e)};
                                                    break;
                                                    case e.chk('Immediate exit requested'):
                                                    case e.chk('reset by peer'):
                                                       if(e.frames===0&&x==='record'){s.video('delete',e)};
                                                    break;
                                                }
                                                s.log(e,{type:"FFMPEG STDERR",msg:d})
                                            });
                                        }
                                    break;
                                }
                                }else{
                                    s.log(e,{type:"Can't Connect",msg:'Retrying...'});e.error_fatal();return;
                                }
                        }
                        if(e.type!=='socket'){
                            connectionTester.test(e.hosty,e.port,2000,e.draw);
                        }else{
                            e.draw(null,{success:true})
                        }
                    }catch(err){++e.error_count;console.error('Frame Capture Error '+e.id,err);s.tx({f:'error',data:err},'GRP_2Df5hBE');}
                }
                //start drawing files
                if(s.child_help===true){
                    e.ch=Object.keys(s.child_nodes);
                    if(e.ch.length>0){
                        e.ch_stop=0;
                        e.fn=function(n){
                            e.init_video();
                        connectionTester.test(e.hosty,e.port,2000,function(err,o){
                            if(o.success===true){
                                s.video('open',e);
                                e.frames=0;
                                s.group[e.ke].mon[e.id].spawn={};
                                s.group[e.ke].mon[e.id].child_node=n;
                                s.cx({f:'spawn',d:s.init('clean',e),mon:s.init('clean',s.group[e.ke].mon[e.mid])},s.group[e.ke].mon[e.mid].child_node_id)
                            }else{
                                console.log('Cannot Connect, Retrying...',e.id);e.error_fatal();return;
                            }
                        })
                        }
                        e.ch.forEach(function(n){
                            if(e.ch_stop===0&&s.child_nodes[n].cpu<80){
                                e.ch_stop=1;
                                e.set(n);s.group[e.ke].mon[e.mid].child_node=n;
                                e.set(n);s.group[e.ke].mon[e.mid].child_node_id=s.child_nodes[n].cnid;
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
            sql.query('SELECT ke,uid,auth,mail,details FROM Users WHERE ke=? AND auth=? AND uid=?',[d.ke,d.auth,d.uid],function(err,r) {
                if(r&&r[0]){
                    r=r[0];cn.join('GRP_'+d.ke);
                    cn.ke=d.ke,cn.uid=d.uid,cn.auth=d.auth;
                    if(!s.group[d.ke])s.group[d.ke]={};
//                    if(!s.group[d.ke].vid)s.group[d.ke].vid={};
                    if(!s.group[d.ke].users)s.group[d.ke].users={};
//                    s.group[d.ke].vid[cn.id]={uid:d.uid};
                    s.group[d.ke].users[d.auth]={cnid:cn.id}
                    if(!s.group[d.ke].mon){
                        s.group[d.ke].mon={}
                        if(!s.group[d.ke].mon){s.group[d.ke].mon={}}
                    }
                    sql.query('SELECT * FROM API WHERE ke=? && uid=?',[d.ke,d.uid],function(err,rrr) {
                    sql.query('SELECT * FROM Monitors WHERE ke=?',[d.ke],function(err,rr) {
                        tx({
                            f:'init_success',
                            monitors:rr,
                            users:s.group[d.ke].vid,
                            apis:rrr,
                            os:{
                                platform:os.platform(),
                                cpuCount:os.cpuCount(),
                                totalmem:os.totalmem()
                            }
                        })
                        s.disk(cn.id);
                        setTimeout(function(){
                            if(rr&&rr[0]){
                                rr.forEach(function(t){
                                    s.camera('snapshot',{mid:t.mid,ke:t.ke,mon:t})
                                })
                            }
                        },2000)
                    })
                    })
                }else{
                    tx({ok:false,msg:'Not Authorized',token_used:d.auth,ke:d.ke});cn.disconnect();
                }
            })
            return;
        }
        if((d.id||d.uid||d.mid)&&cn.ke){
            try{
            switch(d.f){
                case'get':
                    switch(d.ff){
                        case'videos':
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
                case'api':
                    switch(d.ff){
                        case'delete':
                            d.set=[],d.ar=[];
                            d.form.ke=cn.ke;d.form.uid=cn.uid;delete(d.form.ip);
                            if(!d.form.code){tx({f:'form_incomplete',form:'APIs'});return}
                            d.for=Object.keys(d.form);
                            d.for.forEach(function(v){
                                d.set.push(v+'=?'),d.ar.push(d.form[v]);
                            });
                            sql.query('DELETE FROM API WHERE '+d.set.join(' AND '),d.ar,function(err,r){
                                if(!err){tx({f:'api_key_deleted',form:d.form});}else{console.log(err)}
                            })
                        break;
                        case'add':
                            d.set=[],d.qu=[],d.ar=[];
                            d.form.ke=cn.ke,d.form.uid=cn.uid,d.form.code=s.gid(30),d.form.details='{}';
                            d.for=Object.keys(d.form);
                            d.for.forEach(function(v){
                                d.set.push(v),d.qu.push('?'),d.ar.push(d.form[v]);
                            });
                            d.ar.push(cn.ke);
                            sql.query('INSERT INTO API ('+d.set.join(',')+') VALUES ('+d.qu.join(',')+')',d.ar,function(err,r){
                                d.form.time=s.moment(new Date,'YYYY-DD-MM HH:mm:ss');
                                if(!err){tx({f:'api_key_added',form:d.form});}else{console.log(err)}
                            });
                        break;
                    }
                break;
                case'settings':
                    switch(d.ff){
                        case'edit':
                            d.set=[],d.ar=[];
                            if(d.form.pass&&d.form.pass!==''){d.form.pass=s.md5(d.form.pass);}else{delete(d.form.pass)};
                            delete(d.form.password_again);
                            d.for=Object.keys(d.form);
                            d.for.forEach(function(v){
                                d.set.push(v+'=?'),d.ar.push(d.form[v]);
                            });
                            d.ar.push(d.ke),d.ar.push(d.uid);
                            sql.query('UPDATE Users SET '+d.set.join(',')+' WHERE ke=? AND uid=?',d.ar,function(err,r){
                                tx({f:'user_settings_change',uid:d.uid,ke:d.ke,form:d.form});
                            });
                        break;
                    }
                break;
                case'monitor':
                    switch(d.ff){
                        case'control':
                            if(!s.group[d.ke]||!s.group[d.ke].mon[d.mid]){return}
                            d.m=s.group[d.ke].mon_conf[d.mid];
                            if(d.m.details.control!=="1"){s.log(d,{type:'Control Error',msg:'Control is not enabled'});return}
                            d.base=s.init('url_no_path',d.m);
                           if(!d.m.details.control_url_stop_timeout||d.m.details.control_url_stop_timeout===''){d.m.details.control_url_stop_timeout=1000} request({url:d.base+d.m.details['control_url_'+d.direction],method:'GET'},function(err,data){
                                if(err){s.log(d,{type:'Control Error',msg:err});return false}
                                if(d.m.details.control_stop=='1'&&d.direction!=='center'){
                                   setTimeout(function(){
                                       request({url:d.base+d.m.details['control_url_'+d.direction+'_stop'],method:'GET'},function(er,dat){
                                           if(err){s.log(d,{type:'Control Error',msg:err});return false}
                                           s.tx({f:'control',ok:data,mid:d.mid,ke:d.ke,direction:d.direction,url_stop:true});
                                    })
                                   },d.m.details.control_url_stop_timeout) 
                                }else{
                                    s.tx({f:'control',ok:data,mid:d.mid,ke:d.ke,direction:d.direction,url_stop:false});
                                }
                            });
                        break;
                        case'delete':
                            if(!d.ke){d.ke=cn.ke};
                            if(d.mid){
                                d.delete=1;s.camera('stop',d);
                                s.tx({f:'monitor_delete',uid:cn.uid,mid:d.mid,ke:cn.ke},'GRP_'+d.ke);
                                s.log(d,{type:'Monitor Deleted',msg:'by user : '+cn.uid});
                                sql.query('DELETE FROM Monitors WHERE ke=? AND mid=?',[d.ke,d.mid])
                            }
                        break;
                        case'add':
                            if(d.mon&&d.mon.mid&&d.mon.name){
                                d.set=[],d.ar=[];
                                d.mon.mid=d.mon.mid.replace(/[^\w\s]/gi,'').replace(/ /g,'');
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
                                        s.log(d,{type:'Monitor Updated',msg:'by user : '+cn.uid});
                                        sql.query('UPDATE Monitors SET '+d.set+' WHERE ke=? AND mid=?',d.ar)
                                    }else{
                                        d.tx.new=true;
                                        d.st=[];
                                        Object.keys(d.mon).forEach(function(v){
                                            if(d.mon[v]&&d.mon[v]!==''){
                                                d.set.push(v),d.st.push('?'),d.ar.push(d.mon[v]);
                                            }
                                        })
//                                        d.set.push('ke'),d.st.push('?'),d.ar.push(d.mon.ke);
                                        d.set=d.set.join(','),d.st=d.st.join(',');
                                        s.log(d,{type:'Monitor Added',msg:'by user : '+cn.uid});
                                        sql.query('INSERT INTO Monitors ('+d.set+') VALUES ('+d.st+')',d.ar)
                                    }
                                    s.group[d.mon.ke].mon_conf[d.mon.mid]=d.mon;
                                    if(d.mon.mode==='stop'){
                                        d.mon.delete=1;
                                        s.camera('stop',d.mon);
                                    }else{
                                        s.camera('stop',d.mon);setTimeout(function(){s.camera(d.mon.mode,d.mon);},5000)
                                    };
                                    s.camera('stop',d.mon);
                                    setTimeout(function(){s.camera(d.mon.mode,d.mon);},5000)
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
                            if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]||s.group[d.ke].mon[d.id].started===0){return false}
                            s.camera(d.ff,d,cn,tx)
                            cn.join('MON_'+d.id);
                            if(s.group[d.ke]&&s.group[d.ke].mon&&s.group[d.ke].mon[d.id]&&s.group[d.ke].mon[d.id].watch){

s.tx({f:'monitor_watch_on',viewers:Object.keys(s.group[d.ke].mon[d.id].watch).length,id:d.id,ke:d.ke},'MON_'+d.id)
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
                case'video':
                    switch(d.ff){
                        case'delete':
                            s.video('delete',d)
                        break;
                    }
                break;
            }
        }catch(er){console.log(er)}
        }else{
            tx({ok:false,msg:'Not Authorized, Submit init command with "auth","ke", and "uid"'});
        }
    });
    cn.on('cron',function(d){//functions for retrieving cron announcements
        switch(d.f){
            case'init':
                s.cron={started:moment(),last_run:moment()};
            break;
            case'msg':

            break;
            case'start':case'end':
                d.mid='_cron';s.log(d,{type:'cron',msg:d.msg})
            break;
        }
        console.log('CRON : ',d)
    })
    cn.on('r',function(d){//functions for webcam recorder
        if(!s.group[d.ke]||!s.group[d.ke].mon[d.mid]){return}
        switch(d.f){
            case'monitor_frame':
               if(s.group[d.ke].mon[d.mid].started!==1){s.tx({error:'Not Started'},cn.id);return false};if(s.group[d.ke]&&s.group[d.ke].mon[d.mid]&&s.group[d.ke].mon[d.mid].watch&&Object.keys(s.group[d.ke].mon[d.mid].watch).length>0){
                        s.tx({f:'monitor_frame',ke:d.ke,id:d.mid,time:s.moment(),frame:d.frame,frame_format:'ab'},'MON_'+d.mid);

                    }
                if(s.group[d.ke].mon[d.mid].record.yes===1){
                    s.group[d.ke].mon[d.mid].spawn.stdin.write(d.frame);
                }
            break;
        }
    })
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
                        d.dir=s.dir.videos+d.d.ke+'/'+d.d.mid+'/';
                        console.log('created_file '+d.d.mid,d.dir+d.filename)
                        fs.writeFile(d.dir+d.filename,d.created_file,'binary',function (err,data) {
                            if (err) {
                                return console.error('created_file'+d.d.mid,err);
                            }
                           tx({f:'delete_file',file:d.filename,ke:d.d.ke,mid:d.d.mid}); s.tx({f:'video_build_success',filename:s.group[d.d.ke].mon[d.d.mid].open+'.'+s.group[d.d.ke].mon[d.d.mid].open_ext,mid:d.d.mid,ke:d.d.ke,time:s.nameToTime(s.group[d.d.ke].mon[d.d.mid].open),end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+d.d.ke);
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
            delete(s.group[cn.ke].users[cn.auth]);
//            delete(s.group[cn.ke].vid[cn.id]);
        }
        if(cn.cron){
            delete(s.cron);
        }
        if(cn.shinobi_child){
            delete(s.child_nodes[cn.ip]);
        }
    })
});
////Pages
app.use(express.static(s.dir.videos));
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
//register function
app.post('/register',function (req,res){
    req.resp={ok:false};
    res.setHeader('Content-Type', 'application/json');
    if(req.body.mail!==''&&req.body.pass!==''){
        if(req.body.pass===req.body.pass2){
            sql.query('SELECT * FROM Users WHERE mail=?',[req.body.mail],function(err,r) {
                if(r&&r[0]){//found one exist
                    req.resp.msg='Account Already Exists';
                }else{//create new
                    req.resp.msg='New Account Created';req.resp.ok=true;
                    sql.query('INSERT INTO Users (ke,uid,mail,pass,details) VALUES (?,?,?,?,?)',[s.gid(),s.gid(),req.body.mail,s.md5(req.body.pass),'{"days":"0.5"}'])
                }
            })
        }else{
            req.resp.msg='Passwords Don\'t Match';req.resp.body=req.body;
        }
    }else{
        req.resp.msg='Fields cannot be empty';
    }
    res.send(JSON.stringify(req.resp,null,3));
})
//login function
app.post('/auth',function (req,res){
    if(req.body.mail&&req.body.pass){
    sql.query('SELECT * FROM Users WHERE mail=? AND pass=?',[req.body.mail,s.md5(req.body.pass)],function(err,r) {
        req.resp={ok:false};
        res.setHeader('Content-Type', 'application/json');
        if(r&&r[0]){
            r=r[0];r.auth=s.md5(s.gid());
            sql.query("UPDATE Users SET auth=? WHERE ke=? AND uid=?",[r.auth,r.ke,r.uid])
            req.resp={ok:true,auth_token:r.auth,ke:r.ke,uid:r.uid,mail:r.mail,details:r.details};
            
            if(!req.body.recorder){
                //regular home page
                req.resp.body=fs.readFileSync(__dirname+'/web/pages/home.html','utf8')
                res.send(JSON.stringify(req.resp))
                res.end();
            }else{
                sql.query('SELECT * FROM Monitors WHERE ke=? AND type=?',[r.ke,"socket"],function(err,rr){
                    req.resp.mons=rr;
                    req.resp.body=fs.readFileSync(__dirname+'/web/pages/streamer.html','utf8')
                    res.send(JSON.stringify(req.resp))
                    res.end();
                })
                //webcam recorder
            }
        }
    })
    }else{
        res.send(req.params)
        res.end();
    }
})
// Get monitors json
app.get(['/:auth/monitor/:ke','/:auth/monitor/:ke/:id'], function (req,res){
    req.fn=function(){
        req.sql='SELECT * FROM Monitors WHERE ke=?';req.ar=[req.params.ke];
        if(req.params.id){req.sql+='and mid=?';req.ar.push(req.params.id)}
        sql.query(req.sql,req.ar,function(err,r){
            if(r.length===1){r=r[0];}
            res.send(JSON.stringify(r, null, 3));
        })
    }
    if(s.group[req.params.ke]&&s.group[req.params.ke].users[req.params.auth]){
        req.fn();
    }else{
        sql.query('SELECT * FROM API WHERE code=?',[req.params.auth],function(err,r){
            if(r&&r[0]){
                req.fn();
            }else{
                req.ret.msg='Not Authorized';
                res.send(JSON.stringify(req.ret, null, 3));
            }
        })
    }
});
// Control monitor mode via HTTP
app.get(['/:auth/monitor/:ke/:mid/:f','/:auth/monitor/:ke/:mid/:f/:ff','/:auth/monitor/:ke/:mid/:f/:ff/:fff'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(){
        if(req.params.f===''){req.ret.msg='incomplete request, remove last slash in URL or put acceptable value.';res.send(JSON.stringify(req.ret, null, 3));return}
        if(req.params.f!=='stop'&&req.params.f!=='start'&&req.params.f!=='record'){
            req.ret.msg='Mode not recognized.';
            res.send(JSON.stringify(req.ret, null, 3));
            return;
        }
        sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.mid],function(err,r){
            if(r&&r[0]){
                r=r[0];
                if(r.mode!==req.params.f){
                    r.mode=req.params.f;
                    s.group[r.ke].mon_conf[r.mid]=r;
                    s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'GRP_'+r.ke);
                    s.camera('stop',r);
                    if(req.params.f!=='stop'){
                        s.camera(req.params.f,r);
                    }
                    req.ret.cmd_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss');
                    req.ret.msg='Monitor mode changed to : '+req.params.f,req.ret.ok=true;
                    sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',[req.params.f,r.ke,r.mid]);
                    if(req.params.ff&&req.params.f!=='stop'){
                        req.params.ff=parseFloat(req.params.ff);
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
                        setTimeout(function(){
                            sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',['stop',r.ke,r.mid]);
                            s.camera('stop',r);r.mode='stop';s.group[r.ke].mon_conf[r.mid]=r;
                            s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'GRP_'+r.ke);
                        },req.timeout);
                        req.ret.end_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss').add(req.timeout,'milliseconds');
                    }
                }else{
                    req.ret.msg='Monitor mode is already : '+req.params.f;
                }
            }else{
                req.ret.msg='Monitor or Key does not exist.';
            }
            res.send(JSON.stringify(req.ret, null, 3));
        })
    }
    if(s.group[req.params.ke]&&s.group[req.params.ke].users[req.params.auth]){
        req.fn();
    }else{
        sql.query('SELECT * FROM API WHERE code=? AND ke=?',[req.params.auth,req.params.ke],function(err,r){
            if(r&&r[0]){
                req.fn();
            }else{
                req.ret.msg='Not Authorized';
                res.send(JSON.stringify(req.ret, null, 3));
            }
        })
    }
})
// Get lib files
app.get(['/libs/:f/:f2','/libs/:f/:f2/:f3'], function (req,res){
    req.dir=__dirname+'/web/libs/'+req.params.f+'/'+req.params.f2;
    if(req.params.f3){req.dir=req.dir+'/'+req.params.f3}
    if (fs.existsSync(req.dir)){
        fs.createReadStream(req.dir).pipe(res);
    }
});
// Get video file
app.get('/:auth/videos/:ke/:id/:file', function (req,res){
    req.fn=function(){
        req.dir=s.dir.videos+req.params.ke+'/'+req.params.id+'/'+req.params.file;
        if (fs.existsSync(req.dir)){
            res.setHeader('content-type','video/'+req.params.file.split('.')[1]);
            res.sendFile(req.dir);
        }else{
            res.send('File Not Found')
        }
    }
    if(s.group[req.params.ke]&&s.group[req.params.ke].users[req.params.auth]){
        req.fn();
    }else{
        sql.query('SELECT * FROM API WHERE code=? AND ke=?',[req.params.auth,req.params.ke],function(err,r){
            if(r&&r[0]){
                req.fn();
            }else{
                res.send('Not Authorized')
            }
        })
    }
});
// Get videos json
app.get(['/:auth/videos/:ke','/:auth/videos/:ke/:id'], function (req,res){
    req.fn=function(){
    req.sql='SELECT * FROM Videos WHERE ke=?';req.ar=[req.params.ke];
    if(req.params.id){req.sql+='and mid=?';req.ar.push(req.params.id)}
    sql.query(req.sql,req.ar,function(err,r){
        r.forEach(function(v){
            v.href='/'+req.params.auth+'/videos/'+v.ke+'/'+v.mid+'/'+s.moment(v.time)+'.'+v.ext;
        })
        res.send(JSON.stringify(r, null, 3));
    })
    }
    if(s.group[req.params.ke]&&s.group[req.params.ke].users[req.params.auth]){
        req.fn();
    }else{
        sql.query('SELECT * FROM API WHERE code=? AND ke=?',[req.params.auth,req.params.ke],function(err,r){
            if(r&&r[0]){
                req.fn();
            }else{
                req.ret.msg='Not Authorized';
                res.send(JSON.stringify(req.ret, null, 3));
            }
        })
    }
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

try{
    
    setInterval(function(){
        os.cpuUsage(function(cpu){
            io.emit('f',{f:'os',cpu:cpu,ram:os.freememPercentage()});
        });
    },2000);
}catch(err){console.log('CPU indicator will not work. Continuing...')}
//check disk space every 20 minutes
s.disk=function(x){
    df(function (er,d) {
        if (er) { clearInterval(s.disk_check); }else{er={f:'disk',data:d}}
        if(x){s.tx(er,x)}else{io.emit('f',er);}
    });
}
s.disk_check=setInterval(function(){s.disk()},60000*20);