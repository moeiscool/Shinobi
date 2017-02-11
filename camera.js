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
// PayPal : paypal@m03.a
//
process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
var fs = require('fs');
var os = require('os');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var request = require("request");
var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var bodyParser = require('body-parser');
var ejs = require('ejs');
var io = require('socket.io')(server);
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var webdav = require("webdav");
var connectionTester = require('connection-tester');
var events = require('events');
var df = require('node-df');
var config = require('./conf.json');

server.listen(config.port);
try{
    console.log('Shinobi - PORT : '+config.port+', NODE.JS : '+execSync("node -v"));
}catch(err){
    console.log('Shinobi - PORT : '+config.port);
}

s={child_help:false,platform:os.platform(),s:JSON.stringify};
s.disc=function(){
    sql = mysql.createConnection(config.db);
    sql.connect(function(err){if(err){console.log('Error Connecting : DB',err);setTimeout(s.disc, 2000);}});
    sql.on('error',function(err) {console.log('DB Lost.. Retrying..');console.log(err);s.disc();return;});
}
s.disc();
//kill any ffmpeg running
exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9");
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
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    e=moment(e);if(config.utcOffset){e=e.utcOffset(config.utcOffset)}
    return e.format(x);
}
s.moment_noOffset=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    return moment(e).format(x);
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
    if(e.details&&e.details.sqllog==1){
        sql.query('INSERT INTO Logs (ke,mid,info) VALUES (?,?,?)',[e.ke,e.mid,s.s(x)]);
    }
    s.tx({f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke);
//    console.log('s.log : ',{f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke)
}
//directories
s.group={};
if(!config.defaultMjpeg){config.defaultMjpeg=__dirname+'/web/libs/img/bg.jpg'}
//default stream folder check
if(!config.streamDir){
    config.streamDir='/dev/shm'
    if(!fs.existsSync(config.streamDir)){
        config.streamDir=__dirname+'/streams/'
    }else{
        config.streamDir+='/streams/'
    }
}
if(!config.videosDir){config.videosDir=__dirname+'/videos/'}
s.dir={videos:config.videosDir,streams:config.streamDir};
//streams dir
if(!fs.existsSync(s.dir.streams)){
    fs.mkdirSync(s.dir.streams);
}
//videos dir
if(!fs.existsSync(s.dir.videos)){
    fs.mkdirSync(s.dir.videos);
}
////Camera Controller
s.init=function(x,e){
    if(!e){e={}}
    switch(x){
        case 0://camera
            if(!s.group[e.ke]){s.group[e.ke]={}};
            if(!s.group[e.ke].mon){s.group[e.ke].mon={}}
            if(!s.group[e.ke].users){s.group[e.ke].users={}}
            if(!s.group[e.ke].mon[e.mid]){s.group[e.ke].mon[e.mid]={}}
            if(!s.group[e.ke].mon[e.mid].watch){s.group[e.ke].mon[e.mid].watch={}};
            if(e.type==='record'){e.record=1}else{e.record=0}
            if(!s.group[e.ke].mon[e.mid].record){s.group[e.ke].mon[e.mid].record={yes:e.record}};
            if(!s.group[e.ke].mon[e.mid].started){s.group[e.ke].mon[e.mid].started=0};
            if(s.group[e.ke].mon[e.mid].delete){clearTimeout(s.group[e.ke].mon[e.mid].delete)}
            s.init('apps',e)
        break;
        case'apps':
            if(!s.group[e.ke].init){
                s.group[e.ke].init={};
                sql.query('SELECT * FROM Users WHERE ke=? AND details NOT LIKE ?',[e.ke,'%"sub"%'],function(ar,r){
                    if(r&&r[0]){
                        r=r[0];
                        ar=JSON.parse(r.details);
                        if(!ar.sub){
                            //owncloud/webdav
                            if(ar.webdav_user&&
                               ar.webdav_user!==''&&
                               ar.webdav_pass&&
                               ar.webdav_pass!==''&&
                               ar.webdav_url&&
                               ar.webdav_url!==''
                              ){
                                if(!ar.webdav_dir||ar.webdav_dir===''){
                                    ar.webdav_dir='/';
                                    if(ar.webdav_dir.slice(-1)!=='/'){ar.webdav_dir+='/';}
                                }
                                s.group[e.ke].webdav = webdav(
                                    ar.webdav_url,
                                    ar.webdav_user,
                                    ar.webdav_pass
                                );
                            }
                            s.group[e.ke].init=ar;
                        }
                    }
                });
            }
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
                if(v!=='last_frame'&&v!=='record'&&v!=='spawn'&&v!=='running'&&(v!=='time'&&typeof e[v]!=='function')){x.ar[v]=e[v];}
            });
            return x.ar;
        break;
        case'url':
            auth_details='';
            if(!e.details.muser){e.details.muser=''}
            if(!e.details.mpass){e.details.mpass=''}
            if(e.details.muser!==''&&e.details.mpass!=='') {                auth_details=e.details.muser+':'+e.details.mpass+'@';
            }
            if(e.port==80){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+auth_details+e.host+e.porty+e.path;return e.url;
        break;
        case'url_no_path':
            auth_details='';
            if(!e.details.muser){e.details.muser=''}
            if(!e.details.mpass){e.details.mpass=''}
            if(e.details.muser!=='') {
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
                s.tx({f:'video_delete',filename:e.filename+'.'+e.ext,mid:e.mid,ke:e.ke,time:s.nameToTime(e.filename),end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
                    s.file('delete',e.dir+e.filename+'.'+e.ext)
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
                            
                            //cloud auto savers
                            //webdav
                            if(s.group[e.ke].webdav&&s.group[e.ke].init.webdav_save=="1"){
                               fs.readFile(e.dir+e.filename+'.'+e.ext,function(err,data){
                                   s.group[e.ke].webdav.putFileContents(s.group[e.ke].init.webdav_dir+e.ke+'/'+e.mid+'/'+e.filename+'.'+e.ext,"binary",data)
                                .catch(function(err) {
                                       s.log(e,{type:'Webdav Error',msg:{msg:'Cannot save. Did you make the folders <b>/'+e.ke+'/'+e.id+'</b> inside your chosen save directory?',info:err},ffmpeg:s.group[e.ke].mon[e.id].ffmpeg})
                                    console.error(err);
                                   });
                                });
                            }
                        }else{
                            s.video('delete',e);
                            s.log(e,{type:'File Corrupt',msg:{ffmpeg:s.group[e.ke].mon[e.mid].ffmpeg,filesize:(e.filesize/100000).toFixed(2)}})
                        }
                    }else{
                        s.video('delete',e);
                        s.log(e,{type:'File Not Exist',msg:'Cannot save non existant file. Something went wrong.',ffmpeg:s.group[e.ke].mon[e.id].ffmpeg})
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
    x.watch='',x.cust_input='',x.cust_detect=' ';
    //analyze duration
    if(e.details.aduration&&e.details.aduration!==''){x.cust_input+=' -analyzeduration '+e.details.aduration};
    //segment cutoff
    if(!e.details.cutoff||e.details.cutoff===''){x.cutoff=15}else{x.cutoff=parseFloat(e.details.cutoff)};
    if(isNaN(x.cutoff)===true){x.cutoff=15}
    //segmenting
    x.segment=' -f segment -segment_atclocktime 1 -reset_timestamps 1 -strftime 1 -segment_list pipe:2 -segment_time '+(60*x.cutoff)+' ';
    if(e.details.dqf=='1'){
        x.segment+='"'+e.dir+'%Y-%m-%dT%H-%M-%S.'+e.ext+'"';
    }else{
        x.segment+=e.dir+'%Y-%m-%dT%H-%M-%S.'+e.ext;
    }
    //resolution
    switch(s.ratio(e.width,e.height)){
        case'16:9':
            x.ratio='640x360';
        break;
        default:
            x.ratio='640x480';
        break;
    }
    if(e.details.stream_scale_x&&e.details.stream_scale_x!==''&&e.details.stream_scale_y&&e.details.stream_scale_y!==''){
        x.ratio=e.details.stream_scale_x+'x'+e.details.stream_scale_y;
    }
    //timestamp
    if(!e.details.timestamp||e.details.timestamp==1){x.time=' -vf drawtext=fontfile=/usr/share/fonts/truetype/freefont/FreeSans.ttf:text=\'%{localtime}\':x=(w-tw)/2:y=0:fontcolor=white:box=1:boxcolor=0x00000000@1:fontsize=10';}else{x.time=''}
    //get video and audio codec defaults based on extension
    switch(e.ext){
        case'mp4':
            x.vcodec='libx264';x.acodec='aac';
            //video quality
            if(e.details.crf&&e.details.crf!==''){x.vcodec+=' -crf '+e.details.crf}
        break;
        case'webm':
            x.acodec='libvorbis',x.vcodec='libvpx';
            //video quality
            x.vcodec+=' -q:v 1';
        break;
    }
    //use custom video codec
    if(e.details.vcodec&&e.details.vcodec!==''&&e.details.vcodec!=='default'){x.vcodec=e.details.vcodec}
    //use custom audio codec
    if(e.details.acodec&&e.details.acodec!==''&&e.details.acodec!=='default'){x.acodec=e.details.acodec}
    if(x.acodec=='aac'&&e.details.cust_record&&(e.details.cust_record.indexOf('-strict -2')>-1)===false){e.details.cust_record+=' -strict -2';}
//    if(e.details.cust_input&&(e.details.cust_input.indexOf('-use_wallclock_as_timestamps 1')>-1)===false){e.details.cust_input+=' -use_wallclock_as_timestamps 1';}
    //ready or reset codecs
    if(x.acodec!=='no'){
        if(x.acodec.indexOf('none')>-1){x.acodec=''}else{x.acodec=' -acodec '+x.acodec}
    }else{
        x.acodec=' -an'
    }
    if(x.vcodec.indexOf('none')>-1){x.vcodec=''}else{x.vcodec=' -vcodec '+x.vcodec}
    //stream frames per second
    if(!e.details.sfps||e.details.sfps===''){
        e.details.sfps=parseFloat(e.details.sfps);
        if(isNaN(e.details.sfps)){e.details.sfps=1}
    }
    if(e.fps&&e.fps!==''){x.framerate=' -r '+e.fps}else{x.framerate=''}
    if(e.details.stream_fps&&e.details.stream_fps!==''){x.stream_fps=' -r '+e.details.stream_fps}else{x.stream_fps=''}
    //recording video filter
    if(e.details.vf&&e.details.vf!==''){
        if(x.time===''){x.vf=' -vf '}else{x.vf=','}
        x.vf+=e.details.vf;
        x.time+=x.vf;
    }
    //stream video filter
    if(e.details.svf&&e.details.svf!==''){x.svf=' -vf '+e.details.svf;}else{x.svf='';}
    //hls vcodec
    if(e.details.stream_vcodec&&e.details.stream_vcodec!=='no'){
        if(e.details.stream_vcodec!==''){x.stream_vcodec=' -c:v '+e.details.stream_vcodec}else{x.stream_vcodec='libx264'}
    }else{
        x.stream_vcodec='';
    }
    //hls acodec
    if(e.details.stream_acodec!=='no'){
    if(e.details.stream_acodec&&e.details.stream_acodec!==''){x.stream_acodec=' -c:a '+e.details.stream_acodec}else{x.stream_acodec=''}
    }else{
        x.stream_acodec=' -an';
    }
    //hls segment time
    if(e.details.hls_time&&e.details.hls_time!==''){x.hls_time=e.details.hls_time}else{x.hls_time=2}    //hls list size
    if(e.details.hls_list_size&&e.details.hls_list_size!==''){x.hls_list_size=e.details.hls_list_size}else{x.hls_list_size=2}
    //pipe to client streams, check for custom flags
    if(e.details.cust_stream&&e.details.cust_stream!==''){x.cust_stream=' '+e.details.cust_stream}else{x.cust_stream=''}
    //stream preset
    if(e.details.preset_stream&&e.details.preset_stream!==''){x.preset_stream=' -preset '+e.details.preset_stream;}else{x.preset_stream=''}
    //stream quality
    if(e.details.stream_quality&&e.details.stream_quality!==''){x.stream_quality=e.details.stream_quality}else{x.stream_quality=''}
    switch(e.details.stream_type){
        case'hls':
            if(x.cust_stream.indexOf('-tune')===-1){x.cust_stream+=' -tune zerolatency'}
            if(x.cust_stream.indexOf('-g ')===-1){x.cust_stream+=' -g 1'}
            if(x.stream_quality)x.stream_quality=' -crf '+x.stream_quality;
            x.pipe=x.preset_stream+x.stream_quality+x.stream_acodec+x.stream_vcodec+x.stream_fps+' -f hls -s '+x.ratio+x.cust_stream+' -hls_time '+x.hls_time+' -hls_list_size '+x.hls_list_size+' -start_number 0 -hls_allow_cache 0 -hls_flags +delete_segments+omit_endlist '+e.sdir+'s.m3u8';
        break;
        default://base64//mjpeg
            if(x.stream_quality)x.stream_quality=' -q:v '+x.stream_quality;
            x.pipe=' -c:v mjpeg -f mpjpeg -boundary_tag shinobi'+x.cust_stream+x.svf+x.stream_quality+x.stream_fps+' -s '+x.ratio+' pipe:1';
        break;
    }
    //motion detector
    if(e.details.detector==='1'){
        if(!e.details.detector_fps||e.details.detector_fps===''){e.details.detector_fps=0.5}
        if(e.details.detector_scale_x&&e.details.detector_scale_x!==''&&e.details.detector_scale_y&&e.details.detector_scale_y!==''){x.dratio=' -s '+e.details.detector_scale_x+'x'+e.details.detector_scale_y}else{x.dratio=''}
        if(e.details.cust_detect&&e.details.cust_detect!==''){x.cust_detect+=e.details.cust_detect;}
        x.pipe+=' -c:v mjpeg -f image2pipe -r '+e.details.detector_fps+x.cust_detect+x.dratio+' pipe:0';
    }
    //custom output
    if(e.details.custom_output&&e.details.custom_output!==''){x.pipe+=' '+e.details.custom_output;}
    //custom input flags
    if(e.details.cust_input&&e.details.cust_input!==''){x.cust_input+=' '+e.details.cust_input;}
    //loglevel
    if(e.details.loglevel&&e.details.loglevel!==''){x.loglevel='-loglevel '+e.details.loglevel;}else{x.loglevel='-loglevel error'}
    if(e.mode=='record'){
        //custom record flags
        if(e.details.cust_record&&e.details.cust_record!==''){x.watch+=' '+e.details.cust_record;}
        //record preset
        if(e.details.preset_record&&e.details.preset_record!==''){x.watch+=' -preset '+e.details.preset_record;}
    }
//        if(e.details.svf){'-vf "rotate=45*(PI/180)'}
    if(!x.vf||x.vf===','){x.vf=''}
    switch(e.type){
        case'socket':case'jpeg':case'pipe':
            if(e.mode==='record'){x.watch+=x.vcodec+x.time+x.framerate+x.vf+' -s '+e.width+'x'+e.height+x.segment;}
            x.tmp=x.loglevel+' -pattern_type glob -f image2pipe'+x.framerate+' -vcodec mjpeg'+x.cust_input+' -i -'+x.watch+x.pipe;
        break;
        case'mjpeg':
            if(e.mode=='record'){
                x.watch+=x.vcodec+x.vf+x.framerate+' -s '+e.width+'x'+e.height+x.segment;
            }
            x.tmp=x.loglevel+' -reconnect 1 -r '+e.details.sfps+' -f mjpeg'+x.cust_input+' -i '+e.url+''+x.watch+x.pipe;
        break;
        case'h264':
            if(e.mode=='record'){
                x.watch+=x.vcodec+x.framerate+x.acodec+' -s '+e.width+'x'+e.height+x.vf+' '+x.segment;
            }
            x.tmp=x.loglevel+x.cust_input+' -i '+e.url+x.watch+x.pipe;
        break;
        case'local':
            if(e.mode=='record'){
                x.watch+=x.vcodec+x.time+x.framerate+x.acodec+' -s '+e.width+'x'+e.height+x.vf+' '+x.segment;
            }
            x.tmp=x.loglevel+x.cust_input+' -i '+e.path+''+x.watch+x.pipe;
        break;
    }
    s.group[e.ke].mon[e.mid].ffmpeg=x.tmp;
    return spawn('ffmpeg',x.tmp.replace(/\s+/g,' ').trim().split(' '));
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
//                    case'mjpeg':case'h264':case'local':
//                        e.snap=spawn('ffmpeg',('-loglevel quiet -i "'+e.url+'" -vframes 1 -f singlejpeg pipe:1').split(' ')).on('data',function(err,data){
//                            e.snap.kill();
//                           if(err){
//                               s.tx({f:'monitor_snapshot',snapshot:'...',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
//                               return;
//                           };
//                            s.tx({f:'monitor_snapshot',snapshot:data.toString('base64'),snapshot_format:'b64',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
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
//            if(s.group[e.ke].mon[e.id].watch[cn.id]){s.camera('watch_off',e,cn,tx);return}
           s.init(0,{ke:e.ke,mid:e.id})
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
            if(tx){tx({f:'monitor_watch_off',ke:e.ke,id:e.id,cnid:cn.id})};
            s.tx({viewers:e.ob,ke:e.ke,id:e.id},'MON_'+e.id);
        break;
        case'stop'://stop monitor
            if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){return}
            if(s.group[e.ke].mon[e.id].fswatch){s.group[e.ke].mon[e.id].fswatch.close();delete(s.group[e.ke].mon[e.id].fswatch)}
            if(s.group[e.ke].mon[e.id].open){ee.filename=s.group[e.ke].mon[e.id].open,ee.ext=s.group[e.ke].mon[e.id].open_ext;s.video('close',ee)}
            if(s.group[e.ke].mon[e.id].last_frame){delete(s.group[e.ke].mon[e.id].last_frame)}
            if(s.group[e.ke].mon[e.id].started!==1){return}
            s.kill(s.group[e.ke].mon[e.id].spawn,e);
            clearInterval(s.group[e.ke].mon[e.id].running);
            s.group[e.ke].mon[e.id].started=0;
            if(s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record.yes=0}
            s.log(e,{type:'Monitor Stopped',msg:'Monitor session has been ordered to stop.'});
            s.tx({f:'monitor_stopping',mid:e.id,ke:e.ke,time:s.moment(),reason:e.reason},'GRP_'+e.ke);
            s.camera('snapshot',{mid:e.id,ke:e.ke,mon:e})
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
            //every 15 minutes start a new file.
            s.group[e.ke].mon[e.id].started=1;
            if(x==='record'){
                s.group[e.ke].mon[e.id].record.yes=1;
            }else{
                s.group[e.ke].mon[e.mid].record.yes=0;
            }
            e.dir=s.dir.videos+e.ke+'/';
            if (!fs.existsSync(e.dir)){
                fs.mkdirSync(e.dir);
            }
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if (!fs.existsSync(e.dir)){
                fs.mkdirSync(e.dir);
            }
            e.sdir=s.dir.streams+e.ke+'/';
            if (!fs.existsSync(e.sdir)){
                fs.mkdirSync(e.sdir);
            }
            e.sdir=s.dir.streams+e.ke+'/'+e.id+'/';
            if (!fs.existsSync(e.sdir)){
                fs.mkdirSync(e.sdir);
            }else{
                exec('rm -rf '+e.sdir+'*')
            }
            s.group[e.ke].mon[e.id].fswatch=fs.watch(e.dir,{encoding:'utf8'},function(eventType,filename){
                if(eventType==='rename'&&s.group[e.ke].mon[e.id].started===1){
                    if(s.group[e.ke].mon[e.id].open&&s.group[e.ke].mon[e.id].record.yes===1){
                        s.video('close',e);
                    }
                    e.filename=filename.split('.')[0];
                    s.video('open',e);
                    s.group[e.ke].mon[e.id].open=e.filename;
                    s.group[e.ke].mon[e.id].open_ext=e.ext;
                }
            })
            s.camera('snapshot',{mid:e.id,ke:e.ke,mon:e})
            e.error_fatal_count=0;
            e.error_count=0;
            //check host to see if has password and user in it
            e.hosty=e.host.split('@');if(e.hosty[1]){e.hosty=e.hosty[1];}else{e.hosty=e.hosty[0];};
            
                e.error_fatal=function(x){
                    clearTimeout(e.err_fatal_timeout);
                    ++e.error_fatal_count;
                    e.err_fatal_timeout=setTimeout(function(){
                        if(!e.details.fatal_max||e.details.fatal_max===''){e.details.fatal_max=10}else{e.details.fatal_max=parseFloat(e.details.fatal_max)}
                        if(e.error_fatal_count>e.details.fatal_max){
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
                        s.kill(s.group[e.ke].mon[e.id].spawn,e);
                        e.draw=function(err,o){
                            if(o.success===true){
                                e.frames=0;
                                if(!s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record={yes:1}};
                               //launch ffmpeg
                                s.group[e.ke].mon[e.id].spawn = s.ffmpeg(e); 
                                s.group[e.ke].mon[e.id].emitter = new events.EventEmitter().setMaxListeners(0);
                                s.log(e,{type:'FFMPEG Process Started',msg:{cmd:s.group[e.ke].mon[e.id].ffmpeg}});
                                s.tx({f:'monitor_starting',mode:x,mid:e.id,time:s.moment()},'GRP_'+e.ke);
                                //start workers
                                switch(e.type){
                                    case'jpeg':
                                        if(!e.details.sfps||e.details.sfps===''){
                                            e.details.sfps=parseFloat(e.details.sfps);
                                            if(isNaN(e.details.sfps)){e.details.sfps=1}
                                        }
                                        if(s.group[e.ke].mon[e.id].spawn){
                                            s.group[e.ke].mon[e.id].spawn.stdin.on('error',function(err){
                                                if(err&&e.details.loglevel!=='quiet'){
                                                    s.log(e,{type:'STDIN ERROR',msg:err});
                                                }
                                            })
                                        }else{
                                            if(x==='record'){
                                                s.log(e,{type:'FFMPEG START',msg:'The recording engine for this snapshot based camera could not start. There may be something wrong with your camera configuration. If there are any logs other than this one please post them in the <b>Issues</b> on Github.'});
                                                return
                                            }
                                        }
                                        e.captureOne=function(f){
                                            s.group[e.ke].mon[e.id].record.request=request({url:e.url,method:'GET',encoding: null,timeout:3000},function(er,data){
                                               ++e.frames; 
                                                if(er){++e.error_count;
                                                       if(e.details.loglevel!=='quiet'){
                                                       s.log(e,{type:'Snapshot Error',msg:{msg:'There was an issue getting data from your camera.',info:er}});
                                                       }
                                                          return;
                                                }
                                                if(s.group[e.ke].mon[e.id].spawn&&s.group[e.ke].mon[e.id].spawn.stdin){
                                                   s.group[e.ke].mon[e.id].spawn.stdin.write(data.body);
                                               }
                                               if(s.group[e.ke].mon[e.id].started===1){
                                                   s.group[e.ke].mon[e.id].record.capturing=setTimeout(function(){e.captureOne()},1000/e.details.sfps);
                                                   }
                                                clearTimeout(e.timeOut),e.timeOut=setTimeout(function(){e.error_count=0;},3000)
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

                                    break;
                                }
                                if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){s.init(0,e)}
                                s.group[e.ke].mon[e.id].spawn.on('error',function(er){e.error({type:'Spawn Error',msg:er})})
                                //frames from motion detect
                                s.group[e.ke].mon[e.id].spawn.stdin.on('data',function(d){
                                    if(s.ocv&&e.details.detector==='1'){
                                        s.tx({f:'frame',mon:s.group[e.ke].mon_conf[e.id].details,ke:e.ke,id:e.id,time:s.moment(),frame:d},s.ocv.id);
                                    };
                                })
                                //frames to stream
                                s.group[e.ke].mon[e.id].spawn.stdout.on('data',function(d){

                                   ++e.frames;
                                   switch(e.details.stream_type){
                                        case'mjpeg':
//                                           s.group[e.ke].mon[e.id].last_frame=d;
                                           s.group[e.ke].mon[e.id].emitter.emit('data',d);
                                        break;
                                       case'b64':case undefined:case null:
                                           if(s.group[e.ke]&&s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].watch&&Object.keys(s.group[e.ke].mon[e.id].watch).length>0){
                                               s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:d.toString('base64'),frame_format:'b64'},'MON_'+e.id);
                                            }
                                        break;
                                   }
                                });
                                if(x==='record'||e.type==='mjpeg'||e.type==='h264'||e.type==='local'){
                                    s.group[e.ke].mon[e.id].spawn.stderr.on('data',function(d){
                                        d=d.toString();
                                        e.chk=function(x){return d.indexOf(x)>-1;}
                                        switch(true){
                                            case e.chk('NULL @'):
                                            case e.chk('RTP: missed'):
                                            case e.chk('deprecated pixel format used, make sure you did set range correctly'):
                                                return
                                            break;
//                                                case e.chk('av_interleaved_write_frame'):
                                            case e.chk('Connection refused'):
                                            case e.chk('Connection timed out'):
                                                //restart
                                                setTimeout(function(){s.log(e,{type:"Can't Connect",msg:'Retrying...'});e.error_fatal();},1000)
                                            break;
                                            case e.chk('No pixel format specified'):
                                                s.log(e,{type:"FFMPEG STDERR",msg:{ffmpeg:s.group[e.ke].mon[e.id].ffmpeg,msg:d}})
                                            break;
                                            case e.chk('No such file or directory'):
                                            case e.chk('Unable to open RTSP for listening'):
                                            case e.chk('timed out'):
                                            case e.chk('Invalid data found when processing input'):
                                            case e.chk('Immediate exit requested'):
                                            case e.chk('reset by peer'):
                                               if(e.frames===0&&x==='record'){s.video('delete',e)};
                                            break;
                                            case /T[0-9][0-9]-[0-9][0-9]-[0-9][0-9]./.test(d):
                                                return s.log(e,{type:"Video Finished",msg:{filename:d}})
                                            break;
                                        }
                                        s.log(e,{type:"FFMPEG STDERR",msg:d})
                                    });
                                }
                                }else{
                                    s.log(e,{type:"Can't Connect",msg:'Retrying...'});e.error_fatal();return;
                                }
                        }
                        if(e.type!=='socket'&&e.protocol!=='udp'){
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
                                s.group[e.ke].mon[e.mid].child_node=n;
                                s.group[e.ke].mon[e.mid].child_node_id=s.child_nodes[n].cnid;
                                e.fn(n);
                            }
                        })
                    }else{
                        e.fn();
                    }
                }else{
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
                    r=r[0];cn.join('GRP_'+d.ke);cn.join('CPU');
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
                    if(s.ocv){
                        tx({f:'opencv_plugged'})
                    }
                    s.init('apps',d)
                    sql.query('SELECT * FROM API WHERE ke=? && uid=?',[d.ke,d.uid],function(err,rrr) {
                        sql.query('SELECT * FROM Monitors WHERE ke=?',[d.ke],function(err,rr) {
                            tx({
                                f:'init_success',
                                monitors:rr,
                                users:s.group[d.ke].vid,
                                apis:rrr,
                                os:{
                                    platform:s.platform,
                                    cpuCount:os.cpus().length,
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
                case'update':
                    if(!config.updateKey){
                        tx({error:'"updateKey" is missing from "conf.json", cannot do updates this way until you add it.'});
                        return;
                    }
                    if(d.key===config.updateKey){
                        exec('chmod +x '+__dirname+'/UPDATE.sh&&'+__dirname+'/./UPDATE.sh')
                    }else{
                        tx({error:'"updateKey" is incorrect.'});
                    }
                break;
                case'get':
                    switch(d.ff){
                        case'videos':
                            d.cx={f:'get_videos',mid:d.mid};
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
                                if(!err){
                                    tx({f:'api_key_deleted',form:d.form});
                                    s.api[xx.auth]=d.form.code;
                                }else{
                                    console.log(err)
                                }
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
                            sql.query('SELECT details FROM Users WHERE ke=? AND uid=?',[d.ke,d.uid],function(err,r){
                                if(r&&r[0]){
                                    r=r[0];
                                d.d=JSON.parse(r.details);
                                ///unchangeable from client side, so reset them incase they did.
                                if(d.d.sub){
                                    d.form.details=JSON.parse(d.form.details)
                                    if(d.d.sub){d.form.details.sub=d.d.sub;}
                                    if(d.d.size){d.form.details.size=d.d.size;}
                                    if(d.d.super){d.form.details.super=d.d.super;}
                                    d.form.details=JSON.stringify(d.form.details)
                                }
                                ///
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
                                d.form.details=JSON.parse(d.form.details);
                                if(!d.form.details.sub){
                                    if(d.form.details.webdav_user&&
                                       d.form.details.webdav_user!==''&&
                                       d.form.details.webdav_pass&&
                                       d.form.details.webdav_pass!==''&&
                                       d.form.details.webdav_url&&
                                       d.form.details.webdav_url!==''
                                      ){
                                        if(!d.form.details.webdav_dir||d.form.details.webdav_dir===''){
                                            d.form.details.webdav_dir='/';
                                            if(d.form.details.webdav_dir.slice(-1)!=='/'){d.form.details.webdav_dir+='/';}
                                        }
                                        s.group[d.ke].webdav = webdav(
                                            d.form.details.webdav_url,
                                            d.form.details.webdav_user,
                                            d.form.details.webdav_pass
                                        );
                                        s.group[d.ke].init=d.form.details;
                                    }else{
                                        delete(s.group[d.ke].webdav);
                                    }
                                }
                                }
                            })
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
                                    tx({f:'control',ok:data,mid:d.mid,ke:d.ke,direction:d.direction,url_stop:false});
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
                                    s.tx(d.tx,'STR_'+d.mon.ke);
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
                            s.init(0,{mid:d.id,ke:d.ke});
                            if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]||s.group[d.ke].mon[d.id].started===0){return false}
                            s.camera(d.ff,d,cn,tx)
                            cn.join('MON_'+d.id);
                            if(s.group[d.ke]&&s.group[d.ke].mon&&s.group[d.ke].mon[d.id]&&s.group[d.ke].mon[d.id].watch){

                                tx({f:'monitor_watch_on',id:d.id,ke:d.ke},'MON_'+d.id)
                                s.tx({viewers:Object.keys(s.group[d.ke].mon[d.id].watch).length,ke:d.ke,id:d.id},'MON_'+d.id)
                           }
                        break;
                        case'watch_off':
                            if(!d.ke){d.ke=cn.ke;};cn.leave('MON_'+d.id);s.camera(d.ff,d,cn,tx);
                            s.tx({viewers:d.ob,ke:d.ke,id:d.id},'MON_'+d.id)
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
    //functions for retrieving cron announcements
    cn.on('ocv',function(d){
        switch(d.f){
            case'init':
                s.ocv={started:moment(),id:cn.id};
                cn.ocv=1;
                s.tx({f:'opencv_plugged'},'CPU')
                console.log('connected to opencv')
            break;
            case'trigger':
                //got a frame rendered with a marker
                if(d.ke&&d.id&&s.group[d.ke]&&s.group[d.ke].mon_conf[d.id]&&s.group[d.ke].mon_conf[d.id].details.detector_trigger=='1'){
                    d.mon=s.group[d.ke].mon_conf[d.id];
                    if(!s.group[d.ke].mon[d.id].watchdog_stop){
                        d.mon.mode='stop';s.camera('stop',d.mon)
                        setTimeout(function(){d.mon.mode='record';s.camera('record',d.mon)},3000)
                    }
                        if(!d.mon.details.detector_timeout||d.mon.details.detector_timeout===''){d.mon.details.detector_timeout=10}
                        d.detector_timeout=parseFloat(d.mon.details.detector_timeout)*1000*60;
                    clearTimeout(s.group[d.ke].mon[d.id].watchdog_stop);
                    s.group[d.ke].mon[d.id].watchdog_stop=setTimeout(function(){
                        d.mon.mode='stop';s.camera('stop',d.mon)
                        setTimeout(function(){
                            d.mon.mode='start';s.camera('start',d.mon);
                            delete(s.group[d.ke].mon[d.id].watchdog_stop);
                        },3000)
                    },d.detector_timeout)
                }
            break;
            case'frame':
                //got a frame rendered with a marker
//                console.log('Look!',d.frame)
            break;
            case'sql':
                sql.query(d.query,d.values);
            break;
        }
    })
    //functions for retrieving cron announcements
    cn.on('cron',function(d){
        switch(d.f){
            case'init':
                s.cron={started:moment(),last_run:moment()};
            break;
            case'msg':

            break;
            case's.tx':
                s.tx(d.data,d.to)
            break;
            case'start':case'end':
                d.mid='_cron';s.log(d,{type:'cron',msg:d.msg})
            break;
            default:
                console.log('CRON : ',d)
            break;
        }
    })
    // admin page socket functions
    cn.on('a',function(d){
        if(!cn.shinobi_child&&d.f=='init'){
            sql.query('SELECT * FROM Users WHERE auth=? && uid=?',[d.auth,d.uid],function(err,r){
                if(r&&r[0]){
                    if(!s.group[d.ke]){s.group[d.ke]={users:{}}}
                    if(!s.group[d.ke].users[d.auth]){s.group[d.ke].users[d.auth]={cnid:cn.id}}
                    cn.join('ADM_'+d.ke);
                    cn.ke=d.ke;
                    cn.uid=d.uid;
                    cn.auth=d.auth;
                }else{
                    cn.disconnect();
                }
            })
        }else{
            s.auth({auth:d.auth,ke:d.ke,id:d.id},function(){
                switch(d.f){
                    case'accounts':
                        switch(d.ff){
                            case'delete':
                                sql.query('DELETE FROM Users WHERE uid=? AND ke=? AND mail=?',[d.$uid,cn.ke,d.mail])
                                s.tx({f:'delete_sub_account',ke:cn.ke,uid:d.$uid,mail:d.mail},'ADM_'+d.ke);
                            break;
                        }
                    break;
                }
            })
        }
    })
    //functions for webcam recorder
    cn.on('r',function(d){
        if(!s.group[d.ke]||!s.group[d.ke].mon[d.mid]){return}
        switch(d.f){
            case'monitor_frame':
               if(s.group[d.ke].mon[d.mid].started!==1){s.tx({error:'Not Started'},cn.id);return false};if(s.group[d.ke]&&s.group[d.ke].mon[d.mid]&&s.group[d.ke].mon[d.mid].watch&&Object.keys(s.group[d.ke].mon[d.mid].watch).length>0){
                        s.tx({f:'monitor_frame',ke:d.ke,id:d.mid,time:s.moment(),frame:d.frame.toString('base64')},'MON_'+d.mid);

                    }
                if(s.group[d.ke].mon[d.mid].record.yes===1){
                    s.group[d.ke].mon[d.mid].spawn.stdin.write(d.frame);
                }
            break;
        }
    })
    //functions for dispersing work to child servers;
    cn.on('c',function(d){
//        if(!cn.ke&&d.socket_key===s.child_key){
            if(!cn.shinobi_child&&d.f=='init'){
                cn.ip=cn.request.connection.remoteAddress;
                cn.name=d.u.name;
                cn.shinobi_child=1;
                tx=function(z){cn.emit('c',z);}
                if(!s.child_nodes[cn.ip]){s.child_nodes[cn.ip]=d.u;};
                s.child_nodes[cn.ip].cnid=cn.id;
                s.child_nodes[cn.ip].cpu=0;
                tx({f:'init_success',child_nodes:s.child_nodes});
            }else{
                if(d.f!=='s.tx'){console.log(d)};
                switch(d.f){
                    case'cpu':
                        s.child_nodes[cn.ip].cpu=d.cpu;
                    break;
                    case'sql':
                        sql.query(d.query,d.values);
                    break;
                    case'camera':
                        s.camera(d.mode,d.data)
                    break;
                    case's.tx':
                        s.tx(d.data,d.to)
                    break;
                    case's.log':
                        s.log(d.data,d.to)
                    break;
                    case'created_file':
                        d.dir=s.dir.videos+d.d.ke+'/'+d.d.mid+'/';
                        console.log('created_file '+d.d.mid,d.dir+d.filename)
                        fs.writeFile(d.dir+d.filename,d.created_file,'binary',function (err,data) {
                            if (err) {
                                return console.error('created_file'+d.d.mid,err);
                            }
                           tx({f:'delete_file',file:d.filename,ke:d.d.ke,mid:d.d.mid}); s.tx({f:'video_build_success',filename:s.group[d.d.ke].mon[d.d.mid].open+'.'+s.group[d.d.ke].mon[d.d.mid].open_ext,mid:d.d.mid,ke:d.d.ke,time:s.nameToTime(s.group[d.d.ke].mon[d.d.mid].open),end:s.moment_noOffset(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+d.d.ke);
                        });
                    break;
                }
            }
//        }
    })
    //embed functions
    cn.on('e', function (d) {
        tx=function(z){if(!z.ke){z.ke=cn.ke;};cn.emit('f',z);}
        switch(d.f){
            case'init':
                    if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]||s.group[d.ke].mon[d.id].started===0){return false}
                s.auth({auth:d.auth,ke:d.ke,id:d.id},function(){
                    cn.embedded=1;
                    cn.ke=d.ke;
                    if(!cn.mid){cn.mid={}}
                    cn.mid[d.id]={};
//                    if(!s.group[d.ke].embed){s.group[d.ke].embed={}}
//                    if(!s.group[d.ke].embed[d.mid]){s.group[d.ke].embed[d.mid]={}}
//                    s.group[d.ke].embed[d.mid][cn.id]={}
                    
                    s.camera('watch_on',d,cn,tx)
                    cn.join('MON_'+d.id);
                    cn.join('STR_'+d.ke);
                    if(s.group[d.ke]&&s.group[d.ke].mon&&s.group[d.ke].mon[d.id]&&s.group[d.ke].mon[d.id].watch){

                        tx({f:'monitor_watch_on',id:d.id,ke:d.ke},'MON_'+d.id)
                        s.tx({viewers:Object.keys(s.group[d.ke].mon[d.id].watch).length,ke:d.ke,id:d.id},'MON_'+d.id)
                   }
                });
            break;
        }
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
            if(!cn.embedded){
                delete(s.group[cn.ke].users[cn.auth]);
            }
//            delete(s.group[cn.ke].vid[cn.id]);
        }
        if(cn.ocv){
            delete(s.ocv);
            s.tx({f:'opencv_unplugged'},'CPU')
        }
        if(cn.cron){
            delete(s.cron);
        }
        if(cn.shinobi_child){
            delete(s.child_nodes[cn.ip]);
        }
    })
});
//Authenticator
s.api={};
s.auth=function(xx,x,res,req){
    if(s.group[xx.ke]&&s.group[xx.ke].users&&s.group[xx.ke].users[xx.auth]){
        x();
    }else{
        if(s.api[xx.auth]){
            x();
        }else{
            sql.query('SELECT * FROM API WHERE code=?',[xx.auth],function(err,r){
                if(r&&r[0]){
                    s.api[xx.auth]={};
                    x();
                }else{
                    if(req){
                        if(!req.ret){req.ret={ok:false}}
                        req.ret.msg='Not Authorized';
                        res.send(s.s(req.ret, null, 3));
                    }
                }
            })
        }
    }
}

////Pages
app.use(express.static(s.dir.videos));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/web/pages');
app.set('view engine','ejs');
//readme
app.get('/info', function (req,res){
    res.sendFile(__dirname+'/index.html');
});
//main page
app.get('/', function (req,res){
    res.render('index');
});
//update server
app.get('/:auth/update/:key', function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(){
        if(!config.updateKey){
            req.ret.msg='"updateKey" is missing from "conf.json", cannot do updates this way until you add it.';
            return;
        }
        if(req.params.key===config.updateKey){
            req.ret.ok=true;
            exec('chmod +x '+__dirname+'/UPDATE.sh&&'+__dirname+'/./UPDATE.sh')
        }else{
            req.ret.msg='"updateKey" is incorrect.';
        }
        res.send(s.s(req.ret, null, 3));
    }
    s.auth(req.params,req.fn,res,req);
});
//register function
app.post('/:auth/register/:ke/:uid',function (req,res){
    req.resp={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(){
        sql.query('SELECT * FROM Users WHERE uid=? AND ke=? AND details NOT LIKE ? LIMIT 1',[req.params.uid,req.params.ke,'%"sub"%'],function(err,u) {
            if(u&&u[0]){
                if(req.body.mail!==''&&req.body.pass!==''){
                    if(req.body.pass===req.body.password_again){
                        sql.query('SELECT * FROM Users WHERE mail=?',[req.body.mail],function(err,r) {
                            if(r&&r[0]){//found one exist
                                req.resp.msg='Email address is in use.';
                            }else{//create new
                                req.resp.msg='New Account Created';req.resp.ok=true;
                                req.gid=s.gid();
                                sql.query('INSERT INTO Users (ke,uid,mail,pass,details) VALUES (?,?,?,?,?)',[req.params.ke,req.gid,req.body.mail,s.md5(req.body.pass),'{"sub":"1"}'])
                                s.tx({f:'add_sub_account',ke:req.params.ke,uid:req.gid,mail:req.body.mail},'ADM_'+req.params.ke);
                            }
                            res.send(s.s(req.resp,null,3));
                        })
                    }else{
                        req.resp.msg='Passwords Don\'t Match';
                    }
                }else{
                    req.resp.msg='Fields cannot be empty';
                }
            }else{
                req.resp.msg='Not an Administrator Account';
            }
            if(req.resp.msg){
                res.send(s.s(req.resp,null,3));
            }
        })
    },res,req);
})
//login function
app.post('/',function (req,res){
    if(req.body.mail&&req.body.pass){
    sql.query('SELECT * FROM Users WHERE mail=? AND pass=?',[req.body.mail,s.md5(req.body.pass)],function(err,r) {
        req.resp={ok:false};
        if(!err&&r&&r[0]){
            r=r[0];r.auth=s.md5(s.gid());
            sql.query("UPDATE Users SET auth=? WHERE ke=? AND uid=?",[r.auth,r.ke,r.uid])
            req.resp={ok:true,auth_token:r.auth,ke:r.ke,uid:r.uid,mail:r.mail,details:r.details,dropbox:config.dropbox};
            r.details=JSON.parse(r.details);
            if(req.body.classic){
                res.render("classic",{$user:req.resp});
            }else{
                if(req.body.admin){
                    //admin checkbox selected
                    if(!r.details.sub){
                        sql.query('SELECT uid,mail,details FROM Users WHERE ke=? AND details LIKE \'%"sub"%\'',[r.ke],function(err,r) {
                            res.render("admin",{$user:req.resp,$subs:r});
                        })
                    }
                }else{
                    //no admin checkbox selected
                    if(!req.body.recorder){
                        //dashboard
                        res.render("home",{$user:req.resp});
                    }else{
                        //streamer
                        sql.query('SELECT * FROM Monitors WHERE ke=? AND type=?',[r.ke,"socket"],function(err,rr){
                            req.resp.mons=rr;
                            res.render("streamer",{$user:req.resp});
                        })
                    }
                }
            }
        }else{
            res.render("index");
            res.end();
        }
    })
    }
});
//ffprobe
//app.get('/:auth/probe/:ke', function (req,res){
//    s.auth(req.params,function(){
//        exec('ffprobe '+decodeURI(req.body.cmd),function(err,d,ster){
//            res.write(err)
//            res.write(d)
//            res.write(ster)
//        });
//    },res,req);
//});
// Get HLS stream (m3u8)
app.get('/:auth/hls/:ke/:id/:file', function (req,res){
    req.fn=function(){
        req.dir=s.dir.streams+req.params.ke+'/'+req.params.id+'/'+req.params.file;
        if (fs.existsSync(req.dir)){
            fs.createReadStream(req.dir).pipe(res);
        }else{
            res.send('File Not Found')
        }
    }
    s.auth(req.params,req.fn,res,req);
});
//Get MJPEG stream
app.get(['/:auth/mjpeg/:ke/:id','/:auth/mjpeg/:ke/:id/:addon'], function(req,res) {
    if(req.params.addon=='full'){
        res.render('mjpeg',{url:'/'+req.params.auth+'/mjpeg/'+req.params.ke+'/'+req.params.id})
    }else{
        s.auth(req.params,function(){
        sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.id],function(err,r){
            if(r&&r[0]){
                r=r[0],r.details=JSON.parse(r.details);
                if(!r.details.stream_fps||r.details.stream_fps===''){
                    r.details.stream_fps=2;
                }else{
                    r.details.stream_fps=r.details.stream_fps=parseFloat(r.details.stream_fps);
                }
                res.writeHead(200, {
                'Content-Type': 'multipart/x-mixed-replace; boundary=shinobi',
                'Cache-Control': 'no-cache',
                'Connection': 'close',
                'Pragma': 'no-cache'
                });

                var stop = false;
                var content,contentWriter;
                if(s.group[req.params.ke]&&s.group[req.params.ke].mon[req.params.id]){
                   if(contentWriter){ 
                       s.group[req.params.ke].mon[req.params.id].emitter.removeListener('data',contentWriter)
                   }
                    s.group[req.params.ke].mon[req.params.id].emitter.on('data',contentWriter=function(d){
                        if (stop)
                          return;
                        if(!d){
                            content = fs.readFileSync(config.defaultMjpeg,'binary');
                            res.write("--shinobi\r\n");
                            res.write("Content-Type: image/jpeg\r\n");
                            res.write("Content-Length: " + content.length + "\r\n");
                            res.write("\r\n");
                            res.write(content,'binary');
                            res.write("\r\n");
                        }else{
                            content = d;
                        }
                        res.write(content,'binary');
                    })
                    res.on('close', function () {
                       stop = true; s.group[req.params.ke].mon[req.params.id].emitter.removeListener('data',contentWriter)
                    });
                }else{
                    res.end();
                }
            }else{
                res.send('No Camera Found');
                res.end();
            }
        })
        },res,req);
    }
});
//embed monitor
app.get(['/:auth/embed/:ke/:id','/:auth/embed/:ke/:id/:addon'], function (req,res){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    s.auth(req.params,function(){
        req.sql='SELECT * FROM Monitors WHERE ke=? and mid=?';req.ar=[req.params.ke,req.params.id];
        sql.query(req.sql,req.ar,function(err,r){
            if(r&&r[0]){r=r[0];}
            res.render("embed",{data:req.params,baseUrl:req.protocol+'://'+req.hostname,port:config.port,mon:r});
        })
    },res,req);
});
// Get monitors json
app.get(['/:auth/monitor/:ke','/:auth/monitor/:ke/:id'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(){
        req.sql='SELECT * FROM Monitors WHERE ke=?';req.ar=[req.params.ke];
        if(req.params.id){req.sql+=' and mid=?';req.ar.push(req.params.id)}
        sql.query(req.sql,req.ar,function(err,r){
            if(r.length===1){r=r[0];}
            res.send(s.s(r, null, 3));
        })
    }
    s.auth(req.params,req.fn,res,req);
});
// Get videos json
app.get(['/:auth/videos/:ke','/:auth/videos/:ke/:id','/:auth/videos/:ke/:id'], function (req,res){
    s.auth(req.params,function(){
        req.sql='SELECT * FROM Videos WHERE ke=?';req.ar=[req.params.ke];
        if(req.params.id){req.sql+='and mid=?';req.ar.push(req.params.id)}
        if(!req.query.limit||req.query.limit==''){req.query.limit=100}
        req.sql+=' ORDER BY `time` DESC LIMIT '+req.query.limit+'';
        sql.query(req.sql,req.ar,function(err,r){
            r.forEach(function(v){
                v.href='/'+req.params.auth+'/videos/'+v.ke+'/'+v.mid+'/'+s.moment_noOffset(v.time)+'.'+v.ext;
            })
            res.send(s.s(r, null, 3));
        })
    },res,req);
});
// Get events json (motion logs)
app.get(['/:auth/events/:ke','/:auth/events/:ke/:id','/:auth/events/:ke/:id/:limit','/:auth/events/:ke/:id/:limit/:start','/:auth/events/:ke/:id/:limit/:start/:end'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(){
        req.sql='SELECT * FROM Events WHERE ke=?';req.ar=[req.params.ke];
        if(req.params.id){req.sql+=' and mid=?';req.ar.push(req.params.id)}
        if(req.params.start&&req.params.start!==''){
            req.params.start=req.params.start.replace('T',' ')
            if(req.params.end&&req.params.end!==''){
                req.params.end=req.params.end.replace('T',' ')
                req.sql+=' AND `time` >= ? AND `time` <= ?';
                req.ar.push(decodeURIComponent(req.params.start))
                req.ar.push(decodeURIComponent(req.params.end))
            }else{
                req.sql+=' AND `time` >= ?';
                req.ar.push(decodeURIComponent(req.params.start))
            }
        }
        if(!req.params.limit||req.params.limit==''){req.params.limit=100}
        req.sql+=' ORDER BY `time` DESC LIMIT '+req.params.limit+'';
        sql.query(req.sql,req.ar,function(err,r){
            if(err){err.sql=req.sql;return res.send(s.s(err, null, 3));}
            if(!r){r=[]}
            r.forEach(function(v,n){
                r[n].details=JSON.parse(v.details);
            })
            res.send(s.s(r, null, 3));
        })
    },res,req);
});
// Get logs json
app.get(['/:auth/logs/:ke','/:auth/logs/:ke/:id','/:auth/logs/:ke/:limit','/:auth/logs/:ke/:id/:limit'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(){
        req.sql='SELECT * FROM Logs WHERE ke=?';req.ar=[req.params.ke];
        if(req.params.id){req.sql+=' and mid=?';req.ar.push(req.params.id)}
        if(!req.params.limit||req.params.limit==''){req.params.limit=100}
        req.sql+=' ORDER BY `time` DESC LIMIT '+req.params.limit+'';
        sql.query(req.sql,req.ar,function(err,r){
            if(err){err.sql=req.sql;return res.send(s.s(err, null, 3));}
            if(!r){r=[]}
            r.forEach(function(v,n){
                r[n].info=JSON.parse(v.info)
            })
            res.send(s.s(r, null, 3));
        })
    },res,req);
});
// Get monitors online json
app.get('/:auth/smonitor/:ke', function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(){
        sql.query('SELECT * FROM Monitors WHERE ke=?',[req.params.ke],function(err,r){
            if(r&&r[0]){
                req.ar=[];
                r.forEach(function(v){
                    if(s.group[req.params.ke]&&s.group[req.params.ke].mon[v.mid]&&s.group[req.params.ke].mon[v.mid].started===1){
                        req.ar.push(v)
                    }
                })
            }else{
                req.ar=[];
            }
            res.send(s.s(req.ar, null, 3));
        })
    }
    s.auth(req.params,req.fn,res,req);
});
// Control monitor mode via HTTP
app.get(['/:auth/monitor/:ke/:mid/:f','/:auth/monitor/:ke/:mid/:f/:ff','/:auth/monitor/:ke/:mid/:f/:ff/:fff'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(){
        if(req.params.f===''){req.ret.msg='incomplete request, remove last slash in URL or put acceptable value.';res.send(s.s(req.ret, null, 3));return}
        if(req.params.f!=='stop'&&req.params.f!=='start'&&req.params.f!=='record'){
            req.ret.msg='Mode not recognized.';
            res.send(s.s(req.ret, null, 3));
            return;
        }
        sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.mid],function(err,r){
            if(r&&r[0]){
                r=r[0];
                if(r.mode!==req.params.f){
                    r.mode=req.params.f;
                    s.group[r.ke].mon_conf[r.mid]=r;
                    s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'GRP_'+r.ke);
                    s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'STR_'+r.ke);
                    s.camera('stop',r);
                    if(req.params.f!=='stop'){
                        s.camera(req.params.f,r);
                    }
                    req.ret.cmd_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss');
                    req.ret.msg='Monitor mode changed to : '+req.params.f,req.ret.ok=true;
                    sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',[req.params.f,r.ke,r.mid]);
                    if(req.params.ff&&req.params.f!=='stop'){
                        req.params.ff=parseFloat(req.params.ff);
                        clearTimeout(s.group[r.ke].mon[r.mid].trigger_timer)
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
                        s.group[r.ke].mon[r.mid].trigger_timer=setTimeout(function(){
                            sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',['stop',r.ke,r.mid]);
                            s.camera('stop',r);r.mode='stop';s.group[r.ke].mon_conf[r.mid]=r;
                            s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'GRP_'+r.ke);
                            s.tx({f:'monitor_edit',mid:r.id,ke:r.ke,mon:r},'STR_'+r.ke);
                        },req.timeout);
                        req.ret.end_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss').add(req.timeout,'milliseconds');
                    }
                }else{
                    req.ret.msg='Monitor mode is already : '+req.params.f;
                }
            }else{
                req.ret.msg='Monitor or Key does not exist.';
            }
            res.send(s.s(req.ret, null, 3));
        })
    }
    s.auth(req.params,req.fn,res,req);
})
// Get lib files
app.get(['/libs/:f/:f2','/libs/:f/:f2/:f3'], function (req,res){
    req.dir=__dirname+'/web/libs/'+req.params.f+'/'+req.params.f2;
    if(req.params.f3){req.dir=req.dir+'/'+req.params.f3}
    if (fs.existsSync(req.dir)){
        fs.createReadStream(req.dir).pipe(res);
    }else{
        res.send('File Not Found')
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
    s.auth(req.params,req.fn,res,req);
});
//modify video file
app.get(['/:auth/videos/:ke/:id/:file/:mode','/:auth/videos/:ke/:id/:file/:mode/:f'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(){
        req.sql='SELECT * FROM Videos WHERE ke=? AND mid=? AND time=?';
        req.ar=[req.params.ke,req.params.id,s.nameToTime(req.params.file)];
        sql.query(req.sql,req.ar,function(err,r){
            if(r&&r[0]){
                r=r[0];r.filename=s.moment(r.time)+'.'+r.ext;
                switch(req.params.mode){
                    case'status':
                        req.params.f=parseInt(req.params.f)
                        if(isNaN(req.params.f)||req.params.f===0){
                            req.ret.msg='Not a valid value.';
                        }else{
                            req.ret.ok=true;
                            sql.query('UPDATE Videos SET status=? WHERE ke=? AND mid=? AND time=?',[req.params.f,req.params.ke,req.params.id,s.nameToTime(req.params.file)])
                            s.tx({f:'video_edit',status:req.params.f,filename:r.filename,mid:r.mid,ke:r.ke,time:s.nameToTime(r.filename),end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+r.ke);
                        }
                    break;
                    case'delete':
                        req.ret.ok=true;
                        s.video('delete',r)
                    break;
                    default:
                        req.ret.msg='Method doesn\'t exist. Check to make sure that the last value of the URL is not blank.';
                    break;
                }
            }else{
                req.ret.msg='No such file';
            }
            res.send(s.s(req.ret, null, 3));
        })
    },res,req);
})
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
s.cpuUsage=function(e,f){
    switch(s.platform){
        case'darwin':
            f="ps -A -o %cpu | awk '{s+=$1} END {print s}'";
        break;
        case'linux':
            f='top -b -n 2 | grep "^%Cpu" | awk \'{print $2}\' | tail -n1';
        break;
    }
     exec(f,{encoding:'utf8'},function(err,d){
         e(d)
     });
}
s.ramUsage=function(){
    var cmd;
    if (os.platform()=='darwin')
            cmd = "vm_stat | awk '/^Pages free: /{f=substr($3,1,length($3)-1)} /^Pages active: /{a=substr($3,1,length($3-1))} /^Pages inactive: /{i=substr($3,1,length($3-1))} /^Pages speculative: /{s=substr($3,1,length($3-1))} /^Pages wired down: /{w=substr($4,1,length($4-1))} /^Pages occupied by compressor: /{c=substr($5,1,length($5-1)); print ((a+w)/(f+a+i+w+s+c))*100;}'"
    else
            cmd = "free | grep Mem | awk '{print $4/$2 * 100.0}'";

    return execSync(cmd,{encoding:'utf8'});
}
    setInterval(function(){
        s.cpuUsage(function(d){
            s.tx({f:'os',cpu:d,ram:s.ramUsage()},'CPU');
        })
    },5000);
}catch(err){console.log('CPU indicator will not work. Continuing...')}
//check disk space every 20 minutes
s.disk=function(x){
    exec('echo 3 > /proc/sys/vm/drop_caches')
    df(function (er,d) {
        if (er) { clearInterval(s.disk_check); }else{er={f:'disk',data:d}}
        s.tx(er,'CPU')
    });
};
s.disk_check=setInterval(function(){s.disk()},60000*20);
s.beat=function(){
    setTimeout(s.beat, 8000);
    io.sockets.emit('ping',{beat:1});
}
s.beat();