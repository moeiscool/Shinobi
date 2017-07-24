//
// Shinobi
// Copyright (C) 2016 Moe Alam, moeiscool
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
// PayPal : paypal@m03.ca
//
process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
var fs = require('fs');
var os = require('os');
var URL = require('url');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var request = require("request");
var express = require('express');
var app = express();
var appHTTPS = express();
var http = require('http');
var https = require('https');
var server = http.createServer(app);
var bodyParser = require('body-parser');
var CircularJSON = require('circular-json');
var ejs = require('ejs');
var io = new (require('socket.io'))();
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var webdav = require("webdav");
var connectionTester = require('connection-tester');
var events = require('events');
var df = require('node-df');
var Cam = require('onvif').Cam;
var config = require('./conf.json');
if(!config.language){
    config.language='en_CA'
}
if(config.language.split('_')[0]==='he'){config.language=='ar'}
try{
    var lang = require('./languages/'+config.language+'.json');
}catch(er){
    console.error(er)
    console.log('There was an error loading your language file.')
    var lang = require('./languages/en_CA.json');
}
process.send = process.send || function () {};
if(config.mail){
    var nodemailer = require('nodemailer').createTransport(config.mail);
}
//config defaults
if(config.cpuUsageMarker===undefined){config.cpuUsageMarker='%Cpu'}
if(config.autoDropCache===undefined){config.autoDropCache=true}
if(config.doSnapshot===undefined){config.doSnapshot=true}
if(config.restart===undefined){config.restart={}}
if(config.systemLog===undefined){config.systemLog=true}
if(config.deleteCorruptFiles===undefined){config.deleteCorruptFiles=true}
if(config.restart.onVideoNotExist===undefined){config.restart.onVideoNotExist=true}
if(config.ip===undefined||config.ip===''||config.ip.indexOf('0.0.0.0')>-1){config.ip='localhost'}else{config.bindip=config.ip};
if(config.cron===undefined)config.cron={};
if(config.cron.deleteOverMax===undefined)config.cron.deleteOverMax=true;
if(config.cron.deleteOverMaxOffset===undefined)config.cron.deleteOverMaxOffset=0.9;
if(config.pluginKeys===undefined)config.pluginKeys={};
s={factorAuth:{},child_help:false,totalmem:os.totalmem(),platform:os.platform(),s:JSON.stringify,isWin:(process.platform==='win32')};
s.loadedLanguages={}
s.loadedLanguages[config.language]=lang;
s.getLanguageFile=function(rule,file){
    if(rule&&rule!==''){
        file=s.loadedLanguages[file]
        if(!file){
            try{
                s.loadedLanguages[rule]=require('./languages/'+rule+'.json')
                file=s.loadedLanguages[rule]
            }catch(err){
                file=lang
            }
        }
    }else{
        file=lang
    }
    return file
}
s.systemLog=function(q,w,e){
    if(!w){w=''}
    if(!e){e=''}
    if(config.systemLog===true){
       return console.log(moment().format(),q,w,e)
    }
}
s.disc=function(){
    sql = mysql.createConnection(config.db);
    sql.connect(function(err){if(err){s.systemLog(lang['Error Connecting']+' : DB',err);setTimeout(s.disc, 2000);}});
    sql.on('error',function(err) {s.systemLog(lang['DB Lost.. Retrying..']);s.systemLog(err);s.disc();return;});
}
s.disc();
//kill any ffmpeg running
s.ffmpegKill=function(){exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9",{detached: true})};
process.on('exit',s.ffmpegKill.bind(null,{cleanup:true}));
process.on('SIGINT',s.ffmpegKill.bind(null, {exit:true}));
//key for child servers
s.child_nodes={};
s.child_key='3123asdasdf1dtj1hjk23sdfaasd12asdasddfdbtnkkfgvesra3asdsd3123afdsfqw345';
s.checkRelativePath=function(x){
    if(x.charAt(0)!=='/'){
        x=__dirname+'/'+x
    }
    return x
}
s.checkCorrectPathEnding=function(x){
    var length=x.length
    if(x.charAt(length-1)!=='/'){
        x=x+'/'
    }
    return x
}
s.md5=function(x){return crypto.createHash('md5').update(x).digest("hex");}
s.tx=function(z,y,x){if(x){return x.broadcast.to(y).emit('f',z)};io.to(y).emit('f',z);}
s.cx=function(z,y,x){if(x){return x.broadcast.to(y).emit('c',z)};io.to(y).emit('c',z);}
s.txWithSubPermissions=function(z,y,permissionChoices){
    if(typeof permissionChoices==='string'){
        permissionChoices=[permissionChoices]
    }
    if(s.group[z.ke]){
        Object.keys(s.group[z.ke].users).forEach(function(v){
            var user = s.group[z.ke].users[v]
            if(user.details.sub){
                if(user.details.allmonitors!=='1'){
                    var valid=0
                    var checked=permissionChoices.length
                    permissionChoices.forEach(function(b){
                        if(user.details[b].indexOf(z.mid)!==-1){
                            ++valid
                        }
                    })
                    if(valid===checked){
                       s.tx(z,user.cnid)
                    }
                }else{
                    s.tx(z,user.cnid)
                }
            }else{
                s.tx(z,user.cnid)
            }
        })
    }
}
//load camera controller vars
s.nameToTime=function(x){x=x.split('.')[0].split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
s.ratio=function(width,height,ratio){ratio = width / height;return ( Math.abs( ratio - 4 / 3 ) < Math.abs( ratio - 16 / 9 ) ) ? '4:3' : '16:9';}
s.gid=function(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
s.nid=function(x){
    if(!x){x=6};var t = "";var p = "0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
s.moment_withOffset=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    e=moment(e);if(config.utcOffset){e=e.utcOffset(config.utcOffset)}
    return e.format(x);
}
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    return moment(e).format(x);
}
s.ipRange=function(start_ip, end_ip) {
  var start_long = s.toLong(start_ip);
  var end_long = s.toLong(end_ip);
  if (start_long > end_long) {
    var tmp=start_long;
    start_long=end_long
    end_long=tmp;
  }
  var range_array = [];
  var i;
  for (i=start_long; i<=end_long;i++) {
    range_array.push(s.fromLong(i));
  }
  return range_array;
}
s.portRange=function(lowEnd,highEnd){
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        list.push(i);
    }
    return list;
}
//toLong taken from NPM package 'ip'
s.toLong=function(ip) {
  var ipl = 0;
  ip.split('.').forEach(function(octet) {
    ipl <<= 8;
    ipl += parseInt(octet);
  });
  return(ipl >>> 0);
};

//fromLong taken from NPM package 'ip'
s.fromLong=function(ipl) {
  return ((ipl >>> 24) + '.' +
      (ipl >> 16 & 255) + '.' +
      (ipl >> 8 & 255) + '.' +
      (ipl & 255) );
};
s.kill=function(x,e,p){
    if(s.group[e.ke]&&s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].spawn !== undefined){
        if(s.group[e.ke].mon[e.id].spawn){
            try{
            s.group[e.ke].mon[e.id].spawn.removeListener('end',s.group[e.ke].mon[e.id].spawn_exit);
            s.group[e.ke].mon[e.id].spawn.removeListener('exit',s.group[e.ke].mon[e.id].spawn_exit);
            delete(s.group[e.ke].mon[e.id].spawn_exit);
            }catch(er){}
        }
        clearTimeout(s.group[e.ke].mon[e.id].checker);
        delete(s.group[e.ke].mon[e.id].checker);
        clearTimeout(s.group[e.ke].mon[e.id].watchdog_stop);
        delete(s.group[e.ke].mon[e.id].watchdog_stop);
        if(e&&s.group[e.ke].mon[e.id].record){
            clearTimeout(s.group[e.ke].mon[e.id].record.capturing);
//            if(s.group[e.ke].mon[e.id].record.request){s.group[e.ke].mon[e.id].record.request.abort();delete(s.group[e.ke].mon[e.id].record.request);}
        };
        if(s.group[e.ke].mon[e.id].child_node){
            s.cx({f:'kill',d:s.init('noReference',e)},s.group[e.ke].mon[e.id].child_node_id)
        }else{
            if(!x||x===1){return};
            p=x.pid;
            if(s.group[e.ke].mon_conf[e.id].type===('dashcam'||'socket'||'jpeg'||'pipe')){
                x.stdin.pause();setTimeout(function(){x.kill('SIGTERM');delete(x);},500)
            }else{
                try{
                    x.stdin.setEncoding('utf8');x.stdin.write('q');
                }catch(er){}
            }
            setTimeout(function(){exec('kill -9 '+p,{detached: true})},1000)
        }
    }
}
s.log=function(e,x){
    if(!x||!e.mid){return}
    if(e.details&&e.details.sqllog==1){
        sql.query('INSERT INTO Logs (ke,mid,info) VALUES (?,?,?)',[e.ke,e.mid,s.s(x)]);
    }
    s.tx({f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke);
//    s.systemLog('s.log : ',{f:'log',ke:e.ke,mid:e.mid,log:x,time:moment()},'GRP_'+e.ke)
}
//SSL options
if(config.ssl&&config.ssl.key&&config.ssl.cert){
    config.ssl.key=fs.readFileSync(s.checkRelativePath(config.ssl.key),'utf8')
    config.ssl.cert=fs.readFileSync(s.checkRelativePath(config.ssl.cert),'utf8')
    if(config.ssl.port===undefined){
        config.ssl.port=443
    }
    if(config.ssl.bindip===undefined){
        config.ssl.bindip=config.bindip
    }
    if(config.ssl.ca&&config.ssl.ca instanceof Array){
        config.ssl.ca.forEach(function(v,n){
            config.ssl.ca[n]=fs.readFileSync(s.checkRelativePath(v),'utf8')
        })
    }
    var serverHTTPS = https.createServer(config.ssl,app);
    serverHTTPS.listen(config.ssl.port,config.bindip,function(){
        console.log('SSL '+lang.Shinobi+' - SSL PORT : '+config.ssl.port);
    });
    io.attach(serverHTTPS);
}
//start HTTP
server.listen(config.port,config.bindip,function(){
    console.log(lang.Shinobi+' - PORT : '+config.port);
});
io.attach(server);
console.log('NODE.JS : '+execSync("node -v"))
//ffmpeg location
if(!config.ffmpegDir){
    if(s.isWin===true){
        config.ffmpegDir=__dirname+'/ffmpeg/ffmpeg.exe'
    }else{
        config.ffmpegDir='ffmpeg'
    }
}
//directories
s.group={};
if(!config.windowsTempDir&&s.isWin===true){config.windowsTempDir='C:/Windows/Temp'}
if(!config.defaultMjpeg){config.defaultMjpeg=__dirname+'/web/libs/img/bg.jpg'}
//default stream folder check
if(!config.streamDir){
    if(s.isWin===false){
        config.streamDir='/dev/shm'
    }else{
        config.streamDir=config.windowsTempDir
    }
    if(!fs.existsSync(config.streamDir)){
        config.streamDir=__dirname+'/streams/'
    }else{
        config.streamDir+='/streams/'
    }
}
if(!config.videosDir){config.videosDir=__dirname+'/videos/'}
s.dir={videos:config.videosDir,streams:config.streamDir,languages:'./languages/'};
//streams dir
if(!fs.existsSync(s.dir.streams)){
    fs.mkdirSync(s.dir.streams);
}
//videos dir
if(!fs.existsSync(s.dir.videos)){
    fs.mkdirSync(s.dir.videos);
}
////Camera Controller
s.init=function(x,e,k,fn){
    if(!e){e={}}
    if(!k){k={}}
    switch(x){
        case 0://camera
            if(!s.group[e.ke]){s.group[e.ke]={}};
            if(!s.group[e.ke].mon){s.group[e.ke].mon={}}
            if(!s.group[e.ke].users){s.group[e.ke].users={}}
            if(!s.group[e.ke].mon[e.mid]){s.group[e.ke].mon[e.mid]={}}
            if(!s.group[e.ke].mon[e.mid].watch){s.group[e.ke].mon[e.mid].watch={}};
            if(!s.group[e.ke].mon[e.mid].fixingVideos){s.group[e.ke].mon[e.mid].fixingVideos={}};
            if(!s.group[e.ke].mon[e.mid].record){s.group[e.ke].mon[e.mid].record={yes:e.record}};
            if(!s.group[e.ke].mon[e.mid].started){s.group[e.ke].mon[e.mid].started=0};
            if(s.group[e.ke].mon[e.mid].delete){clearTimeout(s.group[e.ke].mon[e.mid].delete)}
            if(!s.group[e.ke].mon_conf){s.group[e.ke].mon_conf={}}
            s.init('apps',e)
        break;
        case'apps':
            if(!s.group[e.ke].init){
                s.group[e.ke].init={};
            }
            if(!s.group[e.ke].webdav||!s.group[e.ke].init.size){
                sql.query('SELECT * FROM Users WHERE ke=? AND details NOT LIKE ?',[e.ke,'%"sub"%'],function(ar,r){
                    if(r&&r[0]){
                        r=r[0];
                        ar=JSON.parse(r.details);
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
                        Object.keys(ar).forEach(function(v){
                            s.group[e.ke].init[v]=ar[v]
                        })
                    }
                });
            }
        break;
        case'sync':
            e.cn=Object.keys(s.child_nodes);
            e.cn.forEach(function(v){
                if(s.group[e.ke]){
                   s.cx({f:'sync',sync:s.init('noReference',s.group[e.ke].mon[e.mid]),ke:e.ke,mid:e.mid},s.child_nodes[v].cnid);
                }
            });
        break;
        case'noReference':
            x={keys:Object.keys(e),ar:{}};
            x.keys.forEach(function(v){
                if(v!=='last_frame'&&v!=='record'&&v!=='spawn'&&v!=='running'&&(v!=='time'&&typeof e[v]!=='function')){x.ar[v]=e[v];}
            });
            return x.ar;
        break;
        case'url':
            e.authd='';
            if(e.details.muser&&e.details.muser!==''&&e.host.indexOf('@')===-1) {
                e.authd=e.details.muser+':'+e.details.mpass+'@';
            }
            if(e.port==80&&e.details.port_force!=='1'){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+e.authd+e.host+e.porty+e.path;return e.url;
        break;
        case'url_no_path':
            e.authd='';
            if(!e.details.muser){e.details.muser=''}
            if(!e.details.mpass){e.details.mpass=''}
            if(e.details.muser!==''&&e.host.indexOf('@')===-1) {
                e.authd=e.details.muser+':'+e.details.mpass+'@';
            }
            if(e.port==80&&e.details.port_force!=='1'){e.porty=''}else{e.porty=':'+e.port}
            e.url=e.protocol+'://'+e.authd+e.host+e.porty;return e.url;
        break;
        case'diskUsed':
            if(s.group[e.ke]&&s.group[e.ke].init){
                s.tx({f:'diskUsed',size:s.group[e.ke].init.used_space,limit:s.group[e.ke].init.size},'GRP_'+e.ke);
            }
        break;
    }
    if(typeof e.callback==='function'){setTimeout(function(){e.callback()},500);}
}
s.filter=function(x,d){
    switch(x){
        case'archive':
            d.videos.forEach(function(v,n){
                s.video('archive',v)
            })
        break;
        case'email':
            if(d.videos&&d.videos.length>0){
                d.videos.forEach(function(v,n){

                })
                d.mailOptions = {
                    from: '"ShinobiCCTV" <no-reply@shinobi.video>', // sender address
                    to: d.mail, // list of receivers
                    subject: lang['Filter Matches']+' : '+d.name, // Subject line
                    html: lang.FilterMatchesText1+' '+d.videos.length+' '+lang.FilterMatchesText2,
                };
                if(d.execute&&d.execute!==''){
                    d.mailOptions.html+='<div><b>'+lang.Executed+' :</b> '+d.execute+'</div>'
                }
                if(d.delete==='1'){
                    d.mailOptions.html+='<div><b>'+lang.Deleted+' :</b> '+lang.Yes+'</div>'
                }
                d.mailOptions.html+='<div><b>'+lang.Query+' :</b> '+d.query+'</div>'
                d.mailOptions.html+='<div><b>'+lang['Filter ID']+' :</b> '+d.id+'</div>'
                nodemailer.sendMail(d.mailOptions, (error, info) => {
                    if (error) {
                        s.tx({f:'error',ff:'filter_mail',ke:d.ke,error:error},'GRP_'+d.ke);
                        return ;
                    }
                    s.tx({f:'filter_mail',ke:d.ke,info:info},'GRP_'+d.ke);
                });
            }
        break;
        case'delete':
            d.videos.forEach(function(v,n){
                s.video('delete',v)
            })
        break;
        case'execute':
            exec(d.execute,{detached: true})
        break;
    }
}
s.video=function(x,e){
    if(!e){e={}};
    k={}
    if(e.mid&&!e.id){e.id=e.mid};
    switch(x){
        case'fix':
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            e.sdir=s.dir.streams+e.ke+'/'+e.id+'/';
            if(!e.filename&&e.time){e.filename=s.moment(e.time)}
            if(e.filename.indexOf('.')===-1){
                e.filename=e.filename+'.'+e.ext
            }
            s.tx({f:'video_fix_start',mid:e.mid,ke:e.ke,filename:e.filename},'GRP_'+e.ke)
            s.group[e.ke].mon[e.id].fixingVideos[e.filename]={}
            switch(e.ext){
                case'mp4':
                    e.fixFlags='-vcodec libx264 -acodec aac -strict -2';
                break;
                case'webm':
                    e.fixFlags='-vcodec libvpx -acodec libvorbis';
                break;
            }
            e.spawn=spawn(config.ffmpegDir,('-i '+e.dir+e.filename+' '+e.fixFlags+' '+e.sdir+e.filename).split(' '),{detached: true})
            e.spawn.stdout.on('data',function(data){
                s.tx({f:'video_fix_data',mid:e.mid,ke:e.ke,filename:e.filename},'GRP_'+e.ke)
            });
            e.spawn.on('close',function(data){
                exec('mv '+e.dir+e.filename+' '+e.sdir+e.filename,{detached: true}).on('exit',function(){
                    s.tx({f:'video_fix_success',mid:e.mid,ke:e.ke,filename:e.filename},'GRP_'+e.ke)
                    delete(s.group[e.ke].mon[e.id].fixingVideos[e.filename]);
                })
            });
        break;
        case'archive':
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if(!e.filename&&e.time){e.filename=s.moment(e.time)}
            if(!e.status){e.status=0}
            e.save=[e.id,e.ke,s.nameToTime(e.filename)];
            sql.query('UPDATE Videos SET status=3 WHERE `mid`=? AND `ke`=? AND `time`=?',e.save,function(err,r){
                s.tx({f:'video_edit',status:3,filename:e.filename+'.'+e.ext,mid:e.mid,ke:e.ke,time:s.nameToTime(e.filename)},'GRP_'+e.ke);
            });
        break;
        case'delete':
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if(!e.filename&&e.time){e.filename=s.moment(e.time)}
            if(!e.status){e.status=0}
            e.save=[e.id,e.ke,s.nameToTime(e.filename)];
            sql.query('DELETE FROM Videos WHERE `mid`=? AND `ke`=? AND `time`=?',e.save,function(err,r){
                fs.stat(e.dir+e.filename+'.'+e.ext,function(err,file){
                    if(err){
                        return s.systemLog(err)
                    }
                    s.group[e.ke].init.used_space=s.group[e.ke].init.used_space-(file.size/1000000)
                    s.init('diskUsed',e)
                })
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
                    s.cx({f:'close',d:s.init('noReference',e)},s.group[e.ke].mon[e.id].child_node_id);
                }else{
                    if(fs.existsSync(e.dir+e.filename+'.'+e.ext)===true){
                        k.stat=fs.statSync(e.dir+e.filename+'.'+e.ext);
                        e.filesize=k.stat.size;
                        e.filesizeMB=parseFloat((e.filesize/1000000).toFixed(2));
                        e.end_time=s.moment(k.stat.mtime,'YYYY-MM-DD HH:mm:ss');
                        if(config.deleteCorruptFiles===true&&e.filesizeMB<0.05){
                            s.video('delete',e);
                            s.log(e,{type:'File Corrupt',msg:{ffmpeg:s.group[e.ke].mon[e.mid].ffmpeg,filesize:e.filesizeMB}})
                        }else{
                            e.save=[e.filesize,1,e.end_time,e.id,e.ke,s.nameToTime(e.filename)];
                            if(!e.status){e.save.push(0)}else{e.save.push(e.status)}
                            sql.query('UPDATE Videos SET `size`=?,`status`=?,`end`=? WHERE `mid`=? AND `ke`=? AND `time`=? AND `status`=?',e.save)
                            s.txWithSubPermissions({f:'video_build_success',hrefNoAuth:'/videos/'+e.ke+'/'+e.mid+'/'+e.filename+'.'+e.ext,filename:e.filename+'.'+e.ext,mid:e.id,ke:e.ke,time:moment(s.nameToTime(e.filename)).format(),size:e.filesize,end:moment(e.end_time).format()},'GRP_'+e.ke,'video_view');

                            //cloud auto savers
                            //webdav
                            if(s.group[e.ke].webdav&&s.group[e.ke].init.use_webdav!=='0'&&s.group[e.ke].init.webdav_save=="1"){
                               fs.readFile(e.dir+e.filename+'.'+e.ext,function(err,data){
                                   s.group[e.ke].webdav.putFileContents(s.group[e.ke].init.webdav_dir+e.ke+'/'+e.mid+'/'+e.filename+'.'+e.ext,"binary",data)
                                .catch(function(err) {
                                       s.log(e,{type:lang['Webdav Error'],msg:{msg:lang.WebdavErrorText+' <b>/'+e.ke+'/'+e.id+'</b>',info:err},ffmpeg:s.group[e.ke].mon[e.id].ffmpeg})
                                    console.error(err);
                                   });
                                });
                            }
                            if(s.group[e.ke].init){
                                if(!s.group[e.ke].init.used_space){s.group[e.ke].init.used_space=0}else{s.group[e.ke].init.used_space=parseFloat(s.group[e.ke].init.used_space)}
                                s.group[e.ke].init.used_space=s.group[e.ke].init.used_space+e.filesizeMB;
                                if(config.cron.deleteOverMax===true&&s.group[e.ke].checkSpaceLock!==1){
                                    //check space
                                    var check=function(){
                                        if(s.group[e.ke].init.used_space>(s.group[e.ke].init.size*config.cron.deleteOverMaxOffset)){
                                            s.group[e.ke].checkSpaceLock=1;
                                            sql.query('SELECT * FROM Videos WHERE status != 0 AND ke=? ORDER BY `time` ASC LIMIT 2',[e.ke],function(err,evs){
                                                k.del=[];k.ar=[e.ke];
                                                evs.forEach(function(ev){
                                                    ev.dir=s.dir.videos+e.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.'+ev.ext;
                                                    k.del.push('(mid=? AND time=?)');
                                                    k.ar.push(ev.mid),k.ar.push(ev.time);
                                                    s.file('delete',ev.dir);
                                                   s.group[e.ke].init.used_space=s.group[e.ke].init.used_space-ev.size/1000000;
                                                    s.tx({f:'video_delete',ff:'over_max',size:s.group[e.ke].init.used_space,limit:s.group[e.ke].init.size,filename:s.moment(ev.time)+'.'+ev.ext,mid:ev.mid,ke:ev.ke,time:ev.time,end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
                                                });
                                                if(k.del.length>0){
                                                    k.qu=k.del.join(' OR ');
                                                    sql.query('DELETE FROM Videos WHERE ke =? AND ('+k.qu+')',k.ar,function(){
                                                        check()
                                                    })
                                                }
                                            })
                                        }else{
                                            s.group[e.ke].checkSpaceLock=0
                                            s.init('diskUsed',e)
                                        }
                                    }
                                    check()
                                }else{
                                    s.init('diskUsed',e)
                                }
                            }
                        }
                    }else{
                        s.video('delete',e);
                        s.log(e,{type:lang['File Not Exist'],msg:lang.FileNotExistText,ffmpeg:s.group[e.ke].mon[e.id].ffmpeg})
                        if(e.mode&&config.restart.onVideoNotExist===true&&e.fn){
                            delete(s.group[e.ke].mon[e.id].open);
                            s.log(e,{type:lang['Camera is not recording'],msg:{msg:lang.CameraNotRecordingText}});
                            if(s.group[e.ke].mon[e.id].started===1){
                                s.camera('restart',e)
                            }
                        }
                    }
                }
            }
            delete(s.group[e.ke].mon[e.id].open);
        break;
    }
}
s.ffmpeg=function(e,x){
    //set X for temporary values so we don't break our main monitor object.
    if(!x){x={tmp:''}}
    //set some placeholding values to avoid "undefined" in ffmpeg string.
    x.record_string=''
    x.cust_input=''
    x.cust_detect=' '
    x.record_video_filters=[]
    x.stream_video_filters=[]
    //input - analyze duration
    if(e.details.aduration&&e.details.aduration!==''){x.cust_input+=' -analyzeduration '+e.details.aduration};
    //input - probe size
    if(e.details.probesize&&e.details.probesize!==''){x.cust_input+=' -probesize '+e.details.probesize};
    //input - check protocol
    //input
    switch(e.type){
        case'h264':
            switch(e.protocol){
                case'rtsp':
                    if(e.details.rtsp_transport&&e.details.rtsp_transport!==''&&e.details.rtsp_transport!=='no'){x.cust_input+=' -rtsp_transport '+e.details.rtsp_transport;}
                break;
            }
        break;
    }
    //record - resolution
    switch(s.ratio(e.width,e.height)){
        case'16:9':
            x.ratio='640x360';
        break;
        default:
            x.ratio='640x480';
        break;
    }
    if(e.width!==''&&e.height!==''&&!isNaN(e.width)&&!isNaN(e.height)){
        x.record_dimensions=' -s '+e.width+'x'+e.height
    }else{
        x.record_dimensions=''
    }
    if(e.details.stream_scale_x&&e.details.stream_scale_x!==''&&e.details.stream_scale_y&&e.details.stream_scale_y!==''){
        x.ratio=e.details.stream_scale_x+'x'+e.details.stream_scale_y;
    }
    //record - segmenting
    x.segment=' -f segment -segment_atclocktime 1 -reset_timestamps 1 -strftime 1 -segment_list pipe:2 -segment_time '+(60*e.cutoff)+' ';
    //record - check for double quotes
    if(e.details.dqf=='1'){
        x.segment+='"'+e.dir+'%Y-%m-%dT%H-%M-%S.'+e.ext+'"';
    }else{
        x.segment+=e.dir+'%Y-%m-%dT%H-%M-%S.'+e.ext;
    }
    //record - set defaults for extension, video quality
    switch(e.ext){
        case'mp4':
            x.vcodec='libx264';x.acodec='aac';
            if(e.details.crf&&e.details.crf!==''){x.vcodec+=' -crf '+e.details.crf}
        break;
        case'webm':
            x.acodec='libvorbis',x.vcodec='libvpx';
            if(e.details.crf&&e.details.crf!==''){x.vcodec+=' -q:v '+e.details.crf}else{x.vcodec+=' -q:v 1';}
        break;
    }
    //record - use custom video codec
    if(e.details.vcodec&&e.details.vcodec!==''&&e.details.vcodec!=='default'){x.vcodec=e.details.vcodec}
    //record - use custom audio codec
    if(e.details.acodec&&e.details.acodec!==''&&e.details.acodec!=='default'){x.acodec=e.details.acodec}
    if(e.details.cust_record){
        if(x.acodec=='aac'&&e.details.cust_record.indexOf('-strict -2')===-1){e.details.cust_record+=' -strict -2';}
        if(e.details.cust_record.indexOf('-threads')===-1){e.details.cust_record+=' -threads 1';}
    }
//    if(e.details.cust_input&&(e.details.cust_input.indexOf('-use_wallclock_as_timestamps 1')>-1)===false){e.details.cust_input+=' -use_wallclock_as_timestamps 1';}
    //record - ready or reset codecs
    if(x.acodec!=='no'){
        if(x.acodec.indexOf('none')>-1){x.acodec=''}else{x.acodec=' -acodec '+x.acodec}
    }else{
        x.acodec=' -an'
    }
    if(x.vcodec.indexOf('none')>-1){x.vcodec=''}else{x.vcodec=' -vcodec '+x.vcodec}
    //stream - frames per second
    if(!e.details.sfps||e.details.sfps===''){
        e.details.sfps=parseFloat(e.details.sfps);
        if(isNaN(e.details.sfps)){e.details.sfps=1}
    }
    if(e.fps&&e.fps!==''){x.framerate=' -r '+e.fps}else{x.framerate=''}
    if(e.details.stream_fps&&e.details.stream_fps!==''){x.stream_fps=' -r '+e.details.stream_fps}else{x.stream_fps=''}
    //record - timestamp options for -vf
    if(e.details.timestamp&&e.details.timestamp=="1"&&e.details.vcodec!=='copy'){
        //font
        if(e.details.timestamp_font&&e.details.timestamp_font!==''){x.time_font=e.details.timestamp_font}else{x.time_font='/usr/share/fonts/truetype/freefont/FreeSans.ttf'}
        //position x
        if(e.details.timestamp_x&&e.details.timestamp_x!==''){x.timex=e.details.timestamp_x}else{x.timex='(w-tw)/2'}
        //position y
        if(e.details.timestamp_y&&e.details.timestamp_y!==''){x.timey=e.details.timestamp_y}else{x.timey='0'}
        //text color
        if(e.details.timestamp_color&&e.details.timestamp_color!==''){x.time_color=e.details.timestamp_color}else{x.time_color='white'}
        //box color
        if(e.details.timestamp_box_color&&e.details.timestamp_box_color!==''){x.time_box_color=e.details.timestamp_box_color}else{x.time_box_color='0x00000000@1'}
        //text size
        if(e.details.timestamp_font_size&&e.details.timestamp_font_size!==''){x.time_font_size=e.details.timestamp_font_size}else{x.time_font_size='10'}

        x.record_video_filters.push('drawtext=fontfile='+x.time_font+':text=\'%{localtime}\':x='+x.timex+':y='+x.timey+':fontcolor='+x.time_color+':box=1:boxcolor='+x.time_box_color+':fontsize='+x.time_font_size);
    }
    //record - watermark for -vf
    if(e.details.watermark&&e.details.watermark=="1"&&e.details.watermark_location&&e.details.watermark_location!==''){
        switch(e.details.watermark_position){
            case'tl'://top left
                x.watermark_position='10:10'
            break;
            case'tr'://top right
                x.watermark_position='main_w-overlay_w-10:10'
            break;
            case'bl'://bottom left
                x.watermark_position='10:main_h-overlay_h-10'
            break;
            default://bottom right
                x.watermark_position='(main_w-overlay_w-10)/2:(main_h-overlay_h-10)/2'
            break;
        }
        x.record_video_filters.push('movie='+e.details.watermark_location+'[watermark],[in][watermark]overlay='+x.watermark_position+'[out]');
    }
    //record - rotation
    if(e.details.rotate_record&&e.details.rotate_record!==""&&e.details.rotate_record!=="no"){
        x.record_video_filters.push('transpose='+e.details.rotate_record);
    }
    //check custom record filters for -vf
    if(e.details.vf&&e.details.vf!==''){
        x.record_video_filters.push(e.details.vf)
    }
    //compile filter string for -vf
    if(x.record_video_filters.length>0){
       x.record_video_filters=' -vf '+x.record_video_filters.join(',')
    }else{
        x.record_video_filters=''
    }
    //stream - timestamp
    if(e.details.stream_timestamp&&e.details.stream_timestamp=="1"&&e.details.vcodec!=='copy'){
        //font
        if(e.details.stream_timestamp_font&&e.details.stream_timestamp_font!==''){x.stream_timestamp_font=e.details.stream_timestamp_font}else{x.stream_timestamp_font='/usr/share/fonts/truetype/freefont/FreeSans.ttf'}
        //position x
        if(e.details.stream_timestamp_x&&e.details.stream_timestamp_x!==''){x.stream_timestamp_x=e.details.stream_timestamp_x}else{x.stream_timestamp_x='(w-tw)/2'}
        //position y
        if(e.details.stream_timestamp_y&&e.details.stream_timestamp_y!==''){x.stream_timestamp_y=e.details.stream_timestamp_y}else{x.stream_timestamp_y='0'}
        //text color
        if(e.details.stream_timestamp_color&&e.details.stream_timestamp_color!==''){x.stream_timestamp_color=e.details.stream_timestamp_color}else{x.stream_timestamp_color='white'}
        //box color
        if(e.details.stream_timestamp_box_color&&e.details.stream_timestamp_box_color!==''){x.stream_timestamp_box_color=e.details.stream_timestamp_box_color}else{x.stream_timestamp_box_color='0x00000000@1'}
        //text size
        if(e.details.stream_timestamp_font_size&&e.details.stream_timestamp_font_size!==''){x.stream_timestamp_font_size=e.details.stream_timestamp_font_size}else{x.stream_timestamp_font_size='10'}

        x.stream_video_filters.push('drawtext=fontfile='+x.stream_timestamp_font+':text=\'%{localtime}\':x='+x.stream_timestamp_x+':y='+x.stream_timestamp_y+':fontcolor='+x.stream_timestamp_color+':box=1:boxcolor='+x.stream_timestamp_box_color+':fontsize='+x.stream_timestamp_font_size);
    }
    //stream - watermark for -vf
    if(e.details.stream_watermark&&e.details.stream_watermark=="1"&&e.details.stream_watermark_location&&e.details.stream_watermark_location!==''){
        switch(e.details.stream_watermark_position){
            case'tl'://top left
                x.stream_watermark_position='10:10'
            break;
            case'tr'://top right
                x.stream_watermark_position='main_w-overlay_w-10:10'
            break;
            case'bl'://bottom left
                x.stream_watermark_position='10:main_h-overlay_h-10'
            break;
            default://bottom right
                x.stream_watermark_position='(main_w-overlay_w-10)/2:(main_h-overlay_h-10)/2'
            break;
        }
        x.stream_video_filters.push('movie='+e.details.stream_watermark_location+'[watermark],[in][watermark]overlay='+x.stream_watermark_position+'[out]');
    }
    //stream - rotation
    if(e.details.rotate_stream&&e.details.rotate_stream!==""&&e.details.rotate_stream!=="no"){
        x.stream_video_filters.push('transpose='+e.details.rotate_stream);
    }
    //stream - video filter
    if(e.details.svf&&e.details.svf!==''){
        x.stream_video_filters.push(e.details.svf)
    }
    if(x.stream_video_filters.length>0){
       x.stream_video_filters=' -vf '+x.stream_video_filters.join(',')
    }else{
        x.stream_video_filters=''
    }
    //stream - hls vcodec
    if(e.details.stream_vcodec&&e.details.stream_vcodec!=='no'){
        if(e.details.stream_vcodec!==''){x.stream_vcodec=' -c:v '+e.details.stream_vcodec}else{x.stream_vcodec='libx264'}
    }else{
        x.stream_vcodec='';
    }
    //stream - hls acodec
    if(e.details.stream_acodec!=='no'){
    if(e.details.stream_acodec&&e.details.stream_acodec!==''){x.stream_acodec=' -c:a '+e.details.stream_acodec}else{x.stream_acodec=''}
    }else{
        x.stream_acodec=' -an';
    }
    //stream - hls segment time
    if(e.details.hls_time&&e.details.hls_time!==''){x.hls_time=e.details.hls_time}else{x.hls_time=2}    //hls list size
    if(e.details.hls_list_size&&e.details.hls_list_size!==''){x.hls_list_size=e.details.hls_list_size}else{x.hls_list_size=2}
    //stream - custom flags
    if(e.details.cust_stream&&e.details.cust_stream!==''){x.cust_stream=' '+e.details.cust_stream}else{x.cust_stream=''}
    //stream - preset
    if(e.details.preset_stream&&e.details.preset_stream!==''){x.preset_stream=' -preset '+e.details.preset_stream;}else{x.preset_stream=''}
    //stream - quality
    if(e.details.stream_quality&&e.details.stream_quality!==''){x.stream_quality=e.details.stream_quality}else{x.stream_quality=''}
    //stream - pipe build
    switch(e.details.stream_type){
        case'hls':
            if(x.cust_stream.indexOf('-tune')===-1){x.cust_stream+=' -tune zerolatency'}
            if(x.cust_stream.indexOf('-g ')===-1){x.cust_stream+=' -g 1'}
            if(x.stream_quality)x.stream_quality=' -crf '+x.stream_quality;
            x.pipe=x.preset_stream+x.stream_quality+x.stream_acodec+x.stream_vcodec+x.stream_fps+' -f hls -s '+x.ratio+x.stream_video_filters+x.cust_stream+' -hls_time '+x.hls_time+' -hls_list_size '+x.hls_list_size+' -start_number 0 -hls_allow_cache 0 -hls_flags +delete_segments+omit_endlist '+e.sdir+'s.m3u8';
        break;
        case'mjpeg':
            if(x.stream_quality)x.stream_quality=' -q:v '+x.stream_quality;
            x.pipe=' -c:v mjpeg -f mpjpeg -boundary_tag shinobi'+x.cust_stream+x.stream_video_filters+x.stream_quality+x.stream_fps+' -s '+x.ratio+' pipe:1';
        break;
        case'b64':case'':case undefined:case null://base64
            if(x.stream_quality)x.stream_quality=' -q:v '+x.stream_quality;
            x.pipe=' -c:v mjpeg -f image2pipe'+x.cust_stream+x.stream_video_filters+x.stream_quality+x.stream_fps+' -s '+x.ratio+' pipe:1';
        break;
        default:
            x.pipe=''
        break;
    }
    //detector - plugins, motion
    if(e.details.detector==='1'&&e.details.detector_send_frames==='1'){
        if(!e.details.detector_fps||e.details.detector_fps===''){e.details.detector_fps=2}
        if(e.details.detector_scale_x&&e.details.detector_scale_x!==''&&e.details.detector_scale_y&&e.details.detector_scale_y!==''){x.dratio=' -s '+e.details.detector_scale_x+'x'+e.details.detector_scale_y}else{x.dratio=' -s 320x240'}
        if(e.details.cust_detect&&e.details.cust_detect!==''){x.cust_detect+=e.details.cust_detect;}
        x.pipe+=' -f singlejpeg -vf fps='+e.details.detector_fps+x.cust_detect+x.dratio+' pipe:0';
    }
    //api - snapshot bin/ cgi.bin (JPEG Mode)
    if(e.details.snap==='1'||e.details.stream_type==='jpeg'){
        if(!e.details.snap_fps||e.details.snap_fps===''){e.details.snap_fps=1}
        if(e.details.snap_vf&&e.details.snap_vf!==''){x.snap_vf=' -vf '+e.details.snap_vf}else{x.snap_vf=''}
        if(e.details.snap_scale_x&&e.details.snap_scale_x!==''&&e.details.snap_scale_y&&e.details.snap_scale_y!==''){x.sratio=' -s '+e.details.snap_scale_x+'x'+e.details.snap_scale_y}else{x.sratio=''}
        if(e.details.cust_snap&&e.details.cust_snap!==''){x.cust_snap=' '+e.details.cust_snap;}else{x.cust_snap=''}
        x.pipe+=' -update 1 -r '+e.details.snap_fps+x.cust_snap+x.sratio+x.snap_vf+' '+e.sdir+'s.jpg -y';
    }
//    //Stream to YouTube (Stream out to server)
//    if(e.details.stream_server==='1'){
//        if(!e.details.stream_server_vbr||e.details.stream_server_vbr===''){e.details.stream_server_vbr='256k'}
//        x.stream_server_vbr=' -b:v '+e.details.stream_server_vbr;
//        if(e.details.stream_server_fps&&e.details.stream_server_fps!==''){
//            x.stream_server_fps=' -r '+e.details.stream_server_fps
//            e.details.stream_server_fps=parseFloat(e.details.stream_server_fps)
//            x.stream_server_fps+=' -g '+e.details.stream_server_fps
//        }else{x.stream_server_fps=''}
//        if(e.details.stream_server_crf&&e.details.stream_server_crf!==''){x.stream_server_crf=' -crf '+e.details.stream_server_crf}else{x.stream_server_crf=''}
//        if(e.details.stream_server_vf&&e.details.stream_server_vf!==''){x.stream_server_vf=' -vf '+e.details.stream_server_vf}else{x.stream_server_vf=''}
//        if(e.details.stream_server_preset&&e.details.stream_server_preset!==''){x.stream_server_preset=' -preset '+e.details.stream_server_preset}else{x.stream_server_preset=''}
//        if(e.details.stream_server_scale_x&&e.details.stream_server_scale_x!==''&&e.details.stream_server_scale_y&&e.details.stream_server_scale_y!==''){x.stream_server_ratio=' -s '+e.details.stream_server_scale_x+'x'+e.details.stream_server_scale_y}else{x.stream_server_ratio=''}
//        if(e.details.cust_stream_server&&e.details.cust_stream_server!==''){x.cust_stream_server=' '+e.details.cust_stream_server;}else{x.cust_stream_server=''}
//        x.pipe+=' -vcodec libx264 -pix_fmt yuv420p'+x.stream_server_preset+x.stream_server_crf+x.stream_server_fps+x.stream_server_vbr+x.stream_server_ratio+x.stream_server_vf+' -acodec aac -strict 2 -ar 44100 -q:a 3 -b:a 712000'+x.cust_stream_server+' -f flv '+e.details.stream_server_url;
//    }
    //custom - output
    if(e.details.custom_output&&e.details.custom_output!==''){x.pipe+=' '+e.details.custom_output;}
    //custom - input flags
    if(e.details.cust_input&&e.details.cust_input!==''){x.cust_input+=' '+e.details.cust_input;}
    //logging - level
    if(e.details.loglevel&&e.details.loglevel!==''){x.loglevel='-loglevel '+e.details.loglevel;}else{x.loglevel='-loglevel error'}
    if(e.mode=='record'){
        //custom - record flags
        if(e.details.cust_record&&e.details.cust_record!==''){x.record_string+=' '+e.details.cust_record;}
        //record - preset
        if(e.details.preset_record&&e.details.preset_record!==''){x.record_string+=' -preset '+e.details.preset_record;}
    }
    //build final string based on the input type.
    switch(e.type){
        case'dashcam':
            if(e.mode==='record'){x.record_string+=x.vcodec+x.framerate+x.record_video_filters+x.record_dimensions+x.segment;}
            x.tmp=x.loglevel+' -i -'+x.record_string+x.pipe;
        break;
        case'socket':case'jpeg':case'pipe':
            if(e.mode==='record'){x.record_string+=x.vcodec+x.framerate+x.record_video_filters+x.record_dimensions+x.segment;}
            x.tmp=x.loglevel+' -pattern_type glob -f image2pipe'+x.framerate+' -vcodec mjpeg'+x.cust_input+' -i -'+x.record_string+x.pipe;
        break;
        case'mjpeg':
            if(e.mode=='record'){
                x.record_string+=x.vcodec+x.record_video_filters+x.framerate+x.record_dimensions+x.segment;
            }
            x.tmp=x.loglevel+' -reconnect 1 -r '+e.details.sfps+' -f mjpeg'+x.cust_input+' -i '+e.url+''+x.record_string+x.pipe;
        break;
        case'h264':case'hls':case'mp4':
            if(e.mode=='record'){
                x.record_string+=x.vcodec+x.framerate+x.acodec+x.record_dimensions+x.record_video_filters+' '+x.segment;
            }
            x.tmp=x.loglevel+x.cust_input+' -i '+e.url+x.record_string+x.pipe;
        break;
        case'local':
            if(e.mode=='record'){
                x.record_string+=x.vcodec+x.framerate+x.acodec+x.record_dimensions+x.record_video_filters+' '+x.segment;
            }
            x.tmp=x.loglevel+x.cust_input+' -i '+e.path+''+x.record_string+x.pipe;
        break;
    }
    s.group[e.ke].mon[e.mid].ffmpeg=x.tmp;
    return spawn(config.ffmpegDir,x.tmp.replace(/\s+/g,' ').trim().split(' '),{detached: true});
}
s.file=function(x,e){
    if(!e){e={}};
    switch(x){
        case'size':
             return fs.statSync(e.filename)["size"];
        break;
        case'delete':
            if(!e){return false;}
            return exec('rm -rf '+e,{detached: true});
        break;
        case'delete_files':
            if(!e.age_type){e.age_type='min'};if(!e.age){e.age='1'};
            exec('find '+e.path+' -type f -c'+e.age_type+' +'+e.age+' -exec rm -rf {} +',{detached: true});
        break;
    }
}
s.camera=function(x,e,cn,tx){
    if(x!=='motion'){
        var ee=s.init('noReference',e);
        if(!e){e={}};if(cn&&cn.ke&&!e.ke){e.ke=cn.ke};
        if(!e.mode){e.mode=x;}
        if(!e.id&&e.mid){e.id=e.mid}
    }
    if(e.details&&(e.details instanceof Object)===false){
        try{e.details=JSON.parse(e.details)}catch(err){}
    }
    ['detector_cascades','cords'].forEach(function(v){
        if(e.details&&e.details[v]&&(e.details[v] instanceof Object)===false){
            try{
                e.details[v]=JSON.parse(e.details[v]);
                if(!e.details[v])e.details[v]={};
            }catch(err){
                e.details[v]={};
            }
        }
    })
    switch(x){
        case'snapshot'://get snapshot from monitor URL
            if(config.doSnapshot===true){
                if(e.mon.mode!=='stop'){
                    try{e.mon.details=JSON.parse(e.mon.details)}catch(er){}
                    if(e.mon.details.snap==='1'){
                        fs.readFile(s.dir.streams+e.ke+'/'+e.mid+'/s.jpg',function(err,data){
                            if(err){s.tx({f:'monitor_snapshot',snapshot:e.mon.name,snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke);return};
                            s.tx({f:'monitor_snapshot',snapshot:data,snapshot_format:'ab',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                        })
                    }else{
                        e.url=s.init('url',e.mon);
                        switch(e.mon.type){
                            case'mjpeg':case'h264':case'local':
                                if(e.mon.type==='local'){e.url=e.mon.path;}
                                e.spawn=spawn(config.ffmpegDir,('-loglevel quiet -i '+e.url+' -s 400x400 -r 25 -ss 1.8 -frames:v 1 -f singlejpeg pipe:1').split(' '),{detached: true})
                                e.spawn.stdout.on('data',function(data){
                                   e.snapshot_sent=true; s.tx({f:'monitor_snapshot',snapshot:data.toString('base64'),snapshot_format:'b64',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                                    e.spawn.kill();
                                });
                                e.spawn.on('close',function(data){
                                    if(!e.snapshot_sent){
                                        s.tx({f:'monitor_snapshot',snapshot:e.mon.name,snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                                    }
                                    delete(e.snapshot_sent);
                                });
                            break;
                            case'jpeg':
                                request({url:e.url,method:'GET',encoding:null},function(err,data){
                                    if(err){s.tx({f:'monitor_snapshot',snapshot:e.mon.name,snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke);return};
                                    s.tx({f:'monitor_snapshot',snapshot:data.body,snapshot_format:'ab',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                                })
                            break;
                            default:
                                s.tx({f:'monitor_snapshot',snapshot:'...',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                            break;
                        }
                    }
                }else{
                    s.tx({f:'monitor_snapshot',snapshot:'Disabled',snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
                }
            }else{
                s.tx({f:'monitor_snapshot',snapshot:e.mon.name,snapshot_format:'plc',mid:e.mid,ke:e.ke},'GRP_'+e.ke)
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
                   delete(s.group[e.ke].mon[e.id].watch)
                }
            }else{
                e.ob=0;
            }
            if(tx){tx({f:'monitor_watch_off',ke:e.ke,id:e.id,cnid:cn.id})};
            s.tx({viewers:e.ob,ke:e.ke,id:e.id},'MON_'+e.id);
        break;
        case'restart'://restart monitor
            s.camera('stop',e)
            setTimeout(function(){
                s.camera(e.mode,e)
            },1300)
        break;
        case'idle':case'stop'://stop monitor
            if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){return}
            if(s.group[e.ke].mon[e.id].fswatch){s.group[e.ke].mon[e.id].fswatch.close();delete(s.group[e.ke].mon[e.id].fswatch)}
            if(s.group[e.ke].mon[e.id].open){ee.filename=s.group[e.ke].mon[e.id].open,ee.ext=s.group[e.ke].mon[e.id].open_ext;s.video('close',ee)}
            if(s.group[e.ke].mon[e.id].last_frame){delete(s.group[e.ke].mon[e.id].last_frame)}
            if(s.group[e.ke].mon[e.id].started!==1){return}
            s.kill(s.group[e.ke].mon[e.id].spawn,e);
            if(e.neglectTriggerTimer===1){
                delete(e.neglectTriggerTimer);
            }else{
                clearTimeout(s.group[e.ke].mon[e.id].trigger_timer)
                delete(s.group[e.ke].mon[e.id].trigger_timer)
            }
            clearInterval(s.group[e.ke].mon[e.id].running);
            clearInterval(s.group[e.ke].mon[e.id].detector_notrigger_timeout)
            clearTimeout(s.group[e.ke].mon[e.id].err_fatal_timeout);
            s.group[e.ke].mon[e.id].started=0;
            if(s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record.yes=0}
            s.tx({f:'monitor_stopping',mid:e.id,ke:e.ke,time:s.moment()},'GRP_'+e.ke);
            s.camera('snapshot',{mid:e.id,ke:e.ke,mon:e})
            if(x==='stop'){
                    s.log(e,{type:lang['Monitor Stopped'],msg:lang.MonitorStoppedText});
                    clearTimeout(s.group[e.ke].mon[e.id].delete)
                if(e.delete===1){
                    s.group[e.ke].mon[e.id].delete=setTimeout(function(){
                        delete(s.group[e.ke].mon[e.id]);
                        delete(s.group[e.ke].mon_conf[e.id]);
                    },1000*60);
                }
            }else{
                s.tx({f:'monitor_idle',mid:e.id,ke:e.ke,time:s.moment()},'GRP_'+e.ke);
                s.log(e,{type:lang['Monitor Idling'],msg:lang.MonitorIdlingText});
            }
        break;
        case'start':case'record'://watch or record monitor url
            s.init(0,{ke:e.ke,mid:e.id})
            if(!s.group[e.ke].mon_conf[e.id]){s.group[e.ke].mon_conf[e.id]=s.init('noReference',e);}
            e.url=s.init('url',e);
            if(s.group[e.ke].mon[e.id].started===1){return}
            if(x==='start'&&e.details.detector_trigger=='1'){
                s.group[e.ke].mon[e.id].motion_lock=setTimeout(function(){
                    clearTimeout(s.group[e.ke].mon[e.id].motion_lock);
                    delete(s.group[e.ke].mon[e.id].motion_lock);
                },30000)
            }
            s.group[e.ke].mon[e.id].started=1;
            if(x==='record'){
                s.group[e.ke].mon[e.id].record.yes=1;
            }else{
                s.group[e.ke].mon[e.mid].record.yes=0;
            }
            //videos dir
            e.dir=s.dir.videos+e.ke+'/';
            if (!fs.existsSync(e.dir)){
                fs.mkdirSync(e.dir);
            }
            e.dir=s.dir.videos+e.ke+'/'+e.id+'/';
            if (!fs.existsSync(e.dir)){
                fs.mkdirSync(e.dir);
            }
            //stream dir
            e.sdir=s.dir.streams+e.ke+'/';
            if (!fs.existsSync(e.sdir)){
                fs.mkdirSync(e.sdir);
            }
            e.sdir=s.dir.streams+e.ke+'/'+e.id+'/';
            if (!fs.existsSync(e.sdir)){
                fs.mkdirSync(e.sdir);
            }else{
                s.file('delete',e.sdir+'*')
            }
            //start "no motion" checker
            if(e.details.detector=='1'&&e.details.detector_notrigger=='1'){
                if(!e.details.detector_notrigger_timeout||e.details.detector_notrigger_timeout===''){
                    e.details.detector_notrigger_timeout=10
                }
                e.detector_notrigger_timeout=parseFloat(e.details.detector_notrigger_timeout)*1000*60;
                sql.query('SELECT mail FROM Users WHERE ke=? AND details NOT LIKE ?',[e.ke,'%"sub"%'],function(err,r){
                    r=r[0];
                    s.group[e.ke].mon[e.id].detector_notrigger_timeout_function=function(){
                        if(config.mail&&e.details.detector_notrigger_mail=='1'){
                            e.mailOptions = {
                                from: '"ShinobiCCTV" <no-reply@shinobi.video>', // sender address
                                to: r.mail, // list of receivers
                                subject: lang.NoMotionEmailText1+' '+e.name+' ('+e.id+')', // Subject line
                                html: '<i>'+lang.NoMotionEmailText2+' '+e.details.detector_notrigger_timeout+' '+lang.minutes+'.</i>',
                            };
                            e.mailOptions.html+='<div><b>'+lang['Monitor Name']+' </b> : '+e.name+'</div>'
                            e.mailOptions.html+='<div><b>'+lang['Monitor ID']+' </b> : '+e.id+'</div>'
                            nodemailer.sendMail(e.mailOptions, (error, info) => {
                                if (error) {
                                   s.systemLog('detector:notrigger:sendMail',s.moment(),error)
                                    s.tx({f:'error',ff:'detector_notrigger_mail',id:e.id,ke:e.ke,error:error},'GRP_'+e.ke);
                                    return ;
                                }
                                s.tx({f:'detector_notrigger_mail',id:e.id,ke:e.ke,info:info},'GRP_'+e.ke);
                            });
                        }
                    }
                    clearInterval(s.group[e.ke].mon[e.id].detector_notrigger_timeout)
                    s.group[e.ke].mon[e.id].detector_notrigger_timeout=setInterval(s.group[e.ke].mon[e.id].detector_notrigger_timeout_function,e.detector_notrigger_timeout)
                })
            }
            //cutoff time and recording check interval
            if(!e.details.cutoff||e.details.cutoff===''){e.cutoff=15}else{e.cutoff=parseFloat(e.details.cutoff)};
            if(isNaN(e.cutoff)===true){e.cutoff=15}
            if(x==='record'){
                s.group[e.ke].mon[e.id].fswatch=fs.watch(e.dir,{encoding:'utf8'},function(eventType,filename){
                    if(s.group[e.ke].mon[e.id].fixingVideos[filename]){return}
                    switch(eventType){
                        case'change':
                            clearTimeout(s.group[e.ke].mon[e.id].checker)
                            s.group[e.ke].mon[e.id].checker=setTimeout(function(){
                                if(s.group[e.ke].mon[e.id].started===1){
                                    e.fn();
                                    s.log(e,{type:lang['Camera is not recording'],msg:{msg:lang['Restarting Process']}});
                                }
                            },60000*2);
                        break;
                        case'rename':
                            fs.exists(e.dir+filename,function(exists){
                                if(exists){
                                    if(s.group[e.ke].mon[e.id].open){
                                        s.video('close',e);
                                        if(e.details.detector==='1'&&s.ocv&&s.group[e.ke].mon[e.id].started===1&&e.details&&e.details.detector_record_method==='del'&&e.details.detector_delete_motionless_videos==='1'&&s.group[e.ke].mon[e.id].detector_motion_count===0){
                                            s.video('delete',s.init('noReference',e))
                                        }
                                    }
                                    setTimeout(function(){
                                        e.filename=filename.split('.')[0];
                                        s.video('open',e);
                                        s.group[e.ke].mon[e.id].open=e.filename;
                                        s.group[e.ke].mon[e.id].open_ext=e.ext;
                                        s.group[e.ke].mon[e.id].detector_motion_count=0;
                                    },2000)
                                }
                            });
                        break;
                    }
                })
            }
            s.camera('snapshot',{mid:e.id,ke:e.ke,mon:e})
            //check host to see if has password and user in it
            e.hosty=e.host.split('@');if(e.hosty[1]){e.hosty=e.hosty[1];}else{e.hosty=e.hosty[0];};

                e.error_fatal=function(x){
                    clearTimeout(s.group[e.ke].mon[e.id].err_fatal_timeout);
                    ++e.error_fatal_count;
                    if(s.group[e.ke].mon[e.id].started===1){
                        s.group[e.ke].mon[e.id].err_fatal_timeout=setTimeout(function(){
                            if(e.details.fatal_max!==0&&e.error_fatal_count>e.details.fatal_max){
                                s.camera('stop',{id:e.id,ke:e.ke})
                            }else{
                                e.fn()
                            };
                        },5000);
                    }else{
                        s.kill(s.group[e.ke].mon[e.id].spawn,e);
                    }
                }
                e.error_fatal_count=0;
                e.fn=function(){//this function loops to create new files
                    clearTimeout(s.group[e.ke].mon[e.id].checker)
                    if(s.group[e.ke].mon[e.id].started===1){
                    e.error_count=0;
                    s.group[e.ke].mon[e.id].error_socket_timeout_count=0;
                    if(!e.details.fatal_max||e.details.fatal_max===''){e.details.fatal_max=10}else{e.details.fatal_max=parseFloat(e.details.fatal_max)}
                    s.kill(s.group[e.ke].mon[e.id].spawn,e);
                    e.draw=function(err,o){
                        if(o.success===true){
                            e.frames=0;
                            if(!s.group[e.ke].mon[e.id].record){s.group[e.ke].mon[e.id].record={yes:1}};
                           //launch ffmpeg
                            s.group[e.ke].mon[e.id].spawn = s.ffmpeg(e);
                            //on unexpected exit restart
                            s.group[e.ke].mon[e.id].spawn_exit=function(){
                                if(s.group[e.ke].mon[e.id].started===1){
                                    if(e.details.loglevel!=='quiet'){
                                        s.log(e,{type:lang['Process Unexpected Exit'],msg:{msg:lang['Process Crashed for Monitor']+' : '+e.id,cmd:s.group[e.ke].mon[e.id].ffmpeg}});
                                    }
                                    e.error_fatal();
                                }
                            }
                            s.group[e.ke].mon[e.id].spawn.on('end',s.group[e.ke].mon[e.id].spawn_exit)
                            s.group[e.ke].mon[e.id].spawn.on('exit',s.group[e.ke].mon[e.id].spawn_exit)
                            //emitter for mjpeg
                            if(!e.details.stream_mjpeg_clients||e.details.stream_mjpeg_clients===''||isNaN(e.details.stream_mjpeg_clients)===false){e.details.stream_mjpeg_clients=20;}else{e.details.stream_mjpeg_clients=parseInt(e.details.stream_mjpeg_clients)}
                            s.group[e.ke].mon[e.id].emitter = new events.EventEmitter().setMaxListeners(e.details.stream_mjpeg_clients);
                            s.log(e,{type:'FFMPEG Process Started',msg:{cmd:s.group[e.ke].mon[e.id].ffmpeg}});
                            s.tx({f:'monitor_starting',mode:x,mid:e.id,time:s.moment()},'GRP_'+e.ke);
                            //start workers
                            if(e.type==='jpeg'){
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
                                        s.log(e,{type:lang.FFmpegCantStart,msg:lang.FFmpegCantStartText});
                                        return
                                    }
                                }
                                e.captureOne=function(f){
                                    s.group[e.ke].mon[e.id].record.request=request({url:e.url,method:'GET',encoding: null,timeout:15000},function(err,data){
                                        if(err){
                                            return;
                                        }
                                    }).on('data',function(d){
                                          if(!e.buffer0){
                                              e.buffer0=[d]
                                          }else{
                                              e.buffer0.push(d);
                                          }
                                          if((d[d.length-2] === 0xFF && d[d.length-1] === 0xD9)){
                                              e.buffer0=Buffer.concat(e.buffer0);
                                              ++e.frames;
                                              if(s.group[e.ke].mon[e.id].spawn&&s.group[e.ke].mon[e.id].spawn.stdin){
                                                s.group[e.ke].mon[e.id].spawn.stdin.write(e.buffer0);
                                            }
                                            if(s.group[e.ke].mon[e.id].started===1){
                                                s.group[e.ke].mon[e.id].record.capturing=setTimeout(function(){
                                                   e.captureOne()
                                                },1000/e.details.sfps);
                                            }
                                              e.buffer0=null;
                                        }
                                        if(!e.timeOut){
                                            e.timeOut=setTimeout(function(){e.error_count=0;delete(e.timeOut);},3000);
                                        }

                                    }).on('error', function(err){
                                        ++e.error_count;
                                        clearTimeout(e.timeOut);delete(e.timeOut);
                                        if(e.details.loglevel!=='quiet'){
                                            s.log(e,{type:lang['JPEG Error'],msg:{msg:lang.JPEGErrorText,info:err}});
                                            switch(err.code){
                                                case'ESOCKETTIMEDOUT':
                                                case'ETIMEDOUT':
                                                    ++s.group[e.ke].mon[e.id].error_socket_timeout_count
                                                    if(e.details.fatal_max!==0&&s.group[e.ke].mon[e.id].error_socket_timeout_count>e.details.fatal_max){
                                                        s.log(e,{type:lang['Fatal Maximum Reached'],msg:{code:'ESOCKETTIMEDOUT',msg:lang.FatalMaximumReachedText}});
                                                        s.camera('stop',e)
                                                    }else{
                                                        s.log(e,{type:lang['Restarting Process'],msg:{code:'ESOCKETTIMEDOUT',msg:lang.FatalMaximumReachedText}});
                                                        s.camera('restart',e)
                                                    }
                                                    return;
                                                break;
                                            }
                                        }
                                        if(e.details.fatal_max!==0&&e.error_count>e.details.fatal_max){
                                            clearTimeout(s.group[e.ke].mon[e.id].record.capturing);
                                            e.fn();
                                        }
                                    });
                              }
                              e.captureOne()
                            }
                            if(!s.group[e.ke]||!s.group[e.ke].mon[e.id]){s.init(0,e)}
                            s.group[e.ke].mon[e.id].spawn.on('error',function(er){
                                s.log(e,{type:'Spawn Error',msg:er});e.error_fatal()
                            });
                            if(s.ocv&&e.details.detector==='1'){
                                s.tx({f:'init_monitor',id:e.id,ke:e.ke},s.ocv.id)
                            }
                            //frames from motion detect
                            s.group[e.ke].mon[e.id].spawn.stdin.on('data',function(d){
                                if(s.ocv&&e.details.detector==='1'&&e.details.detector_send_frames==='1'){
                                    s.tx({f:'frame',mon:s.group[e.ke].mon_conf[e.id].details,ke:e.ke,id:e.id,time:s.moment(),frame:d},s.ocv.id);
                                };
                            })
                            //frames to stream
                               ++e.frames;
                           switch(e.details.stream_type){
                               case'mjpeg':
                                   e.frame_to_stream=function(d){
//                                           s.group[e.ke].mon[e.id].last_frame=d;
                                       s.group[e.ke].mon[e.id].emitter.emit('data',d);
                                   }
                               break;
                               case'b64':case undefined:case null:
                                   e.frame_to_stream=function(d){
                                       if(s.group[e.ke]&&s.group[e.ke].mon[e.id]&&s.group[e.ke].mon[e.id].watch&&Object.keys(s.group[e.ke].mon[e.id].watch).length>0){
                                          if(!e.buffer){
                                              e.buffer=[d]
                                          }else{
                                              e.buffer.push(d);
                                          }
                                          if((d[d.length-2] === 0xFF && d[d.length-1] === 0xD9)){
                                              e.buffer=Buffer.concat(e.buffer);
                                              s.tx({f:'monitor_frame',ke:e.ke,id:e.id,time:s.moment(),frame:e.buffer.toString('base64'),frame_format:'b64'},'MON_STREAM_'+e.id);
                                              e.buffer=null;
                                          }
                                        }
                                    }
                               break;
                           }
                            if(e.frame_to_stream){
                                s.group[e.ke].mon[e.id].spawn.stdout.on('data',e.frame_to_stream);
                            }
                            if(x==='record'||e.type==='mjpeg'||e.type==='h264'||e.type==='local'){
                                s.group[e.ke].mon[e.id].spawn.stderr.on('data',function(d){
                                    d=d.toString();
                                    e.chk=function(x){return d.indexOf(x)>-1;}
                                    switch(true){
                                            //mp4 output with webm encoder chosen
                                        case e.chk('Could not find tag for vp8'):
                                        case e.chk('Only VP8 or VP9 Video'):
                                        case e.chk('Could not write header'):
//                                            switch(e.ext){
//                                                case'mp4':
//                                                    e.details.vcodec='libx264'
//                                                    e.details.acodec='none'
//                                                break;
//                                                case'webm':
//                                                    e.details.vcodec='libvpx'
//                                                    e.details.acodec='none'
//                                                break;
//                                            }
//                                            if(e.details.stream_type==='hls'){
//                                                e.details.stream_vcodec='libx264'
//                                                e.details.stream_acodec='no'
//                                            }
//                                            s.camera('restart',e)
                                            return s.log(e,{type:lang['Incorrect Settings Chosen'],msg:{msg:d}})
                                        break;
                                        case e.chk('NULL @'):
                                        case e.chk('RTP: missed'):
                                        case e.chk('deprecated pixel format used, make sure you did set range correctly'):
                                            return
                                        break;
//                                                case e.chk('av_interleaved_write_frame'):
                                        case e.chk('Connection refused'):
                                        case e.chk('Connection timed out'):
                                            //restart
                                            setTimeout(function(){s.log(e,{type:lang["Can't Connect"],msg:lang['Retrying...']});e.error_fatal();},1000)
                                        break;
//                                        case e.chk('No such file or directory'):
//                                        case e.chk('Unable to open RTSP for listening'):
//                                        case e.chk('timed out'):
//                                        case e.chk('Invalid data found when processing input'):
//                                        case e.chk('Immediate exit requested'):
//                                        case e.chk('reset by peer'):
//                                           if(e.frames===0&&x==='record'){s.video('delete',e)};
//                                            setTimeout(function(){
//                                                if(!s.group[e.ke].mon[e.id].spawn){e.fn()}
//                                            },2000)
//                                        break;
                                        case e.chk('mjpeg_decode_dc'):
                                        case e.chk('bad vlc'):
                                        case e.chk('error dc'):
                                            e.fn()
                                        break;
                                        case /T[0-9][0-9]-[0-9][0-9]-[0-9][0-9]./.test(d):
                                            return s.log(e,{type:lang['Video Finished'],msg:{filename:d}})
                                        break;
                                    }
                                    s.log(e,{type:"FFMPEG STDERR",msg:d})
                                });
                            }
                          }else{
                            s.log(e,{type:lang["Can't Connect"],msg:lang['Retrying...']});e.error_fatal();return;
                        }
                    }
                    if(e.type!=='socket'&&e.type!=='dashcam'&&e.protocol!=='udp'&&e.type!=='local'){
                        connectionTester.test(e.hosty,e.port,2000,e.draw);
                    }else{
                        e.draw(null,{success:true})
                    }
                }else{
                    s.kill(s.group[e.ke].mon[e.id].spawn,e);
                }
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
                                s.cx({f:'spawn',d:s.init('noReference',e),mon:s.init('noReference',s.group[e.ke].mon[e.mid])},s.group[e.ke].mon[e.mid].child_node_id)
                            }else{
                                s.systemLog('Cannot Connect, Retrying...',e.id);e.error_fatal();return;
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
        case'motion':
            var d=e;
            if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]){
                return s.systemLog(lang['No Monitor Found, Ignoring Request'])
            }
            d.mon=s.group[d.ke].mon_conf[d.id];
            if(!s.group[d.ke].mon[d.id].detector_motion_count){
                s.group[d.ke].mon[d.id].detector_motion_count=0
            }
            s.group[d.ke].mon[d.id].detector_motion_count+=1
            if(s.group[d.ke].mon[d.id].motion_lock){
                return
            }
            d.cx={f:'detector_trigger',id:d.id,ke:d.ke,details:d.details};
            s.tx(d.cx,'GRP_'+d.ke);
            if(d.mon.details.detector_notrigger=='1'){
                if(!d.mon.details.detector_notrigger_timeout||d.mon.details.detector_notrigger_timeout===''){
                    d.mon.details.detector_notrigger_timeout=10
                }
                d.mon.detector_notrigger_timeout=parseFloat(d.mon.details.detector_notrigger_timeout)*1000*60;
                clearInterval(s.group[d.ke].mon[d.id].detector_notrigger_timeout)
                s.group[d.ke].mon[d.id].detector_notrigger_timeout=setInterval(s.group[d.ke].mon[d.id].detector_notrigger_timeout_function,d.mon.detector_notrigger_timeout)
            }
            if(d.mon.details.detector_webhook=='1'){
                d.mon.details.detector_webhook_url=d.mon.details.detector_webhook_url
                    .replace(/{{TIME}}/g,moment(new Date).format())
                    .replace(/{{MONITOR_ID}}/g,d.id)
                    .replace(/{{GROUP_KEY}}/g,d.ke);
                http.get(d.mon.details.detector_webhook_url, function(data) {
                      data.setEncoding('utf8');
                      var chunks='';
                      data.on('data', (chunk) => {
                          chunks+=chunk;
                      });
                      data.on('end', () => {
                          
                      });

                }).on('error', function(e) {

                }).end();
            }
            if(d.mon.mode!=='stop'&&d.mon.details.detector_trigger=='1'&&d.mon.details.detector_record_method==='hot'){
                if(!d.mon.details.detector_timeout||d.mon.details.detector_timeout===''){
                    d.mon.details.detector_timeout=10
                }else{
                    d.mon.details.detector_timeout=parseFloat(d.mon.details.detector_timeout)
                }
                d.auth=s.gid();
                s.group[d.ke].users[d.auth]={system:1,details:{}}
                d.url='http://'+config.ip+':'+config.port+'/'+d.auth+'/monitor/'+d.ke+'/'+d.id+'/record/'+d.mon.details.detector_timeout+'/min';
                if(d.mon.details.watchdog_reset!=='0'){
                    d.url+='?reset=1'
                }
                http.get(d.url, function(data) {
                      data.setEncoding('utf8');
                      var chunks='';
                      data.on('data', (chunk) => {
                          chunks+=chunk;
                      });
                      data.on('end', () => {
                          delete(s.group[d.ke].users[d.auth])
                          d.cx.f='detector_record_engaged';
                          d.cx.msg=JSON.parse(chunks);
                          s.tx(d.cx,'GRP_'+d.ke);
                      });

                }).on('error', function(e) {

                }).end();
            }
            //mailer
            if(config.mail&&!s.group[d.ke].mon[d.id].detector_mail&&d.mon.details.detector_mail==='1'){
                sql.query('SELECT mail FROM Users WHERE ke=? AND details NOT LIKE ?',[d.ke,'%"sub"%'],function(err,r){
                    r=r[0];
                    if(!d.mon.details.detector_mail_timeout||d.mon.details.detector_mail_timeout===''){
                        d.mon.details.detector_mail_timeout=1000*60*10;
                    }else{
                        d.mon.details.detector_mail_timeout=parseFloat(d.mon.details.detector_mail_timeout)*1000*60;
                    }
                    //lock mailer so you don't get emailed on EVERY trigger event.
                    s.group[d.ke].mon[d.id].detector_mail=setTimeout(function(){
                        //unlock so you can mail again.
                        clearTimeout(s.group[d.ke].mon[d.id].detector_mail);
                        delete(s.group[d.ke].mon[d.id].detector_mail);
                    },d.mon.details.detector_mail_timeout);
                    d.frame_filename='Motion_'+d.id+'_'+d.ke+'_'+s.moment()+'.jpg';
                    fs.readFile(s.dir.streams+'/'+d.ke+'/'+d.id+'/s.jpg',function(err, frame){
                        d.mailOptions = {
                            from: '"ShinobiCCTV" <no-reply@shinobi.video>', // sender address
                            to: r.mail, // list of receivers
                            subject: lang.Event+' - '+d.frame_filename, // Subject line
                            html: '<i>'+lang.EventText1+' '+moment(new Date).format()+'.</i>',
                        };
                        if(err){
                            s.systemLog(lang.EventText2+' '+d.ke+' '+d.id,err)
                        }else{
                            d.mailOptions.attachments=[
                                {
                                    filename: d.frame_filename,
                                    content: frame
                                }
                            ]
                            d.mailOptions.html='<i>'+lang.EventText3+'</i>'
                        }
                            Object.keys(d.details).forEach(function(v,n){
                            d.mailOptions.html+='<div><b>'+v+'</b> : '+d.details[v]+'</div>'
                        })
                        nodemailer.sendMail(d.mailOptions, (error, info) => {
                            if (error) {
                                s.systemLog(lang.MailError,error)
                                return ;
                            }
                        });
                    })
                });
            }
            //save this detection result in SQL, only coords. not image.
            if(d.mon.details.detector_save==='1'){
                sql.query('INSERT INTO Events (ke,mid,details) VALUES (?,?,?)',[d.ke,d.id,JSON.stringify(d.details)])
            }
            if(d.mon.details.detector_command_enable==='1'){
                if(!d.mon.details.detector_command_timeout||d.mon.details.detector_command_timeout===''){
                    d.mon.details.detector_command_timeout=1000*60*10;
                }else{
                    d.mon.details.detector_command_timeout=parseFloat(d.mon.details.detector_command_timeout)*1000*60;
                }
                s.group[d.ke].mon[d.id].detector_command=setTimeout(function(){
                    clearTimeout(s.group[d.ke].mon[d.id].detector_command);
                    delete(s.group[d.ke].mon[d.id].detector_command);

                },d.mon.details.detector_command_timeout);
                d.mon.details.detector_command=d.mon.details.detector_command
                    .replace(/{{TIME}}/g,moment(new Date).format())
                    .replace(/{{MONITOR_ID}}/g,d.id)
                    .replace(/{{GROUP_KEY}}/g,d.ke)
                if(d.details.confidence){
                    d.mon.details.detector_command=d.mon.details.detector_command
                    .replace(/{{CONFIDENCE}}/g,d.details.confidence)
                }
                exec(d.mon.details.detector_command,{detached: true})
            }
        break;
    }
    if(typeof cn==='function'){setTimeout(function(){cn()},1000);}
}

////socket controller
s.cn=function(cn){return{id:cn.id,ke:cn.ke,uid:cn.uid}}
io.on('connection', function (cn) {
var tx;
    cn.on('f',function(d){
        if(!cn.ke&&d.f==='init'){//socket login
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
                    s.group[d.ke].users[d.auth]={cnid:cn.id,uid:r.uid,mail:r.mail,details:JSON.parse(r.details),logged_in_at:moment(new Date).format(),login_type:'Dashboard'}
                    try{s.group[d.ke].users[d.auth].details=JSON.parse(r.details)}catch(er){}
                    s.group[d.ke].users[d.auth].lang=s.getLanguageFile(s.group[d.ke].users[d.auth].details.lang)
                    if(!s.group[d.ke].mon){
                        s.group[d.ke].mon={}
                        if(!s.group[d.ke].mon){s.group[d.ke].mon={}}
                    }
                    if(s.ocv){
                        tx({f:'detector_plugged',plug:s.ocv.plug,notice:s.ocv.notice})
                        s.tx({f:'readPlugins',ke:d.ke},s.ocv.id)
                    }
                    tx({f:'users_online',users:s.group[d.ke].users})
                    s.tx({f:'user_status_change',ke:d.ke,uid:cn.uid,status:1,user:s.group[d.ke].users[d.auth]},'GRP_'+d.ke)
                    s.init('diskUsed',d)
                    s.init('apps',d)
                    sql.query('SELECT * FROM API WHERE ke=? && uid=?',[d.ke,d.uid],function(err,rrr) {
                        tx({
                            f:'init_success',
                            users:s.group[d.ke].vid,
                            apis:rrr,
                            os:{
                                platform:s.platform,
                                cpuCount:os.cpus().length,
                                totalmem:s.totalmem
                            }
                        })
                        http.get('http://'+config.ip+':'+config.port+'/'+cn.auth+'/monitor/'+cn.ke, function(res){
                            var body = '';
                            res.on('data', function(chunk){
                                body += chunk;
                            });
                            res.on('end', function(){
                                var rr = JSON.parse(body);
                                setTimeout(function(g){
                                    g=function(t){
                                        s.camera('snapshot',{mid:t.mid,ke:t.ke,mon:t})
                                    }
                                    if(rr.mid){
                                        g(rr)
                                    }else{
                                        rr.forEach(g)
                                    }
                                },2000)
                            });
                        }).on('error', function(e){
                              s.systemLog("Get Snapshot Error", e);
                        });
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
                case'ocv_in':
                    if(s.ocv){
                       s.tx(d.data,s.ocv.id)
                    }
                break;
                case'monitorOrder':
                    if(d.monitorOrder&&d.monitorOrder instanceof Array){
                        sql.query('SELECT details FROM Users WHERE uid=? AND ke=?',[cn.uid,cn.ke],function(err,r){
                            if(r&&r[0]){
                                r=JSON.parse(r[0].details);
                                r.monitorOrder=d.monitorOrder;
                                sql.query('UPDATE Users SET details=? WHERE uid=? AND ke=?',[JSON.stringify(r),cn.uid,cn.ke])
                            }
                        })
                    }
                break;
                case'update':
                    if(!config.updateKey){
                        tx({error:lang.updateKeyText1});
                        return;
                    }
                    if(d.key===config.updateKey){
                        exec('chmod +x '+__dirname+'/UPDATE.sh&&'+__dirname+'/./UPDATE.sh',{detached: true})
                    }else{
                        tx({error:lang.updateKeyText2});
                    }
                break;
                case'cron':
                    if(s.group[cn.ke]&&s.group[cn.ke].users[cn.auth].details&&!s.group[cn.ke].users[cn.auth].details.sub){
                        s.tx({f:d.ff},s.cron.id)
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
                                    delete(s.api[d.form.code]);
                                }else{
                                    s.systemLog(err)
                                }
                            })
                        break;
                        case'add':
                            d.set=[],d.qu=[],d.ar=[];
                            d.form.ke=cn.ke,d.form.uid=cn.uid,d.form.code=s.gid(30);
                            d.for=Object.keys(d.form);
                            d.for.forEach(function(v){
                                d.set.push(v),d.qu.push('?'),d.ar.push(d.form[v]);
                            });
                            d.ar.push(cn.ke);
                            sql.query('INSERT INTO API ('+d.set.join(',')+') VALUES ('+d.qu.join(',')+')',d.ar,function(err,r){
                                d.form.time=s.moment(new Date,'YYYY-DD-MM HH:mm:ss');
                                if(!err){tx({f:'api_key_added',form:d.form});}else{s.systemLog(err)}
                            });
                        break;
                    }
                break;
                case'settings':
                    switch(d.ff){
                        case'filters':
                            switch(d.fff){
                                case'save':case'delete':
                                    sql.query('SELECT details FROM Users WHERE ke=? AND uid=?',[d.ke,d.uid],function(err,r){
                                        if(r&&r[0]){
                                            r=r[0];
                                            d.d=JSON.parse(r.details);
                                            s.systemLog(d)
                                            if(d.form.id===''){d.form.id=s.gid(5)}
                                            if(!d.d.filters)d.d.filters={};
                                            //save/modify or delete
                                            if(d.fff==='save'){
                                                d.d.filters[d.form.id]=d.form;
                                            }else{
                                                delete(d.d.filters[d.form.id]);
                                            }
                                            sql.query('UPDATE Users SET details=? WHERE ke=? AND uid=?',[JSON.stringify(d.d),d.ke,d.uid],function(err,r){
                                                tx({f:'filters_change',uid:d.uid,ke:d.ke,filters:d.d.filters});
                                            });
                                        }
                                    })
                                break;
                            }
                        break;
                        case'edit':
                            sql.query('SELECT details FROM Users WHERE ke=? AND uid=?',[d.ke,d.uid],function(err,r){
                                if(r&&r[0]){
                                    r=r[0];
                                    d.d=JSON.parse(r.details);
                                    ///unchangeable from client side, so reset them in case they did.
                                    d.form.details=JSON.parse(d.form.details)
                                    //admin permissions
                                    d.form.details.permissions=d.d.permissions
                                    d.form.details.edit_size=d.d.edit_size
                                    d.form.details.edit_days=d.d.edit_days
                                    d.form.details.use_admin=d.d.use_admin
                                    d.form.details.use_webdav=d.d.use_webdav
                                    //check
                                    if(d.d.edit_days=="0"){
                                        d.form.details.days=d.d.days;
                                    }
                                    if(d.d.edit_size=="0"){
                                        d.form.details.size=d.d.size;
                                    }
                                    if(d.d.sub){
                                        d.form.details.sub=d.d.sub;
                                        if(d.d.monitors){d.form.details.monitors=d.d.monitors;}
                                        if(d.d.allmonitors){d.form.details.allmonitors=d.d.allmonitors;}
                                        if(d.d.video_delete){d.form.details.video_delete=d.d.video_delete;}
                                        if(d.d.video_view){d.form.details.video_view=d.d.video_view;}
                                        if(d.d.monitor_edit){d.form.details.monitor_edit=d.d.monitor_edit;}
                                        if(d.d.size){d.form.details.size=d.d.size;}
                                        if(d.d.days){d.form.details.days=d.d.days;}
                                        delete(d.form.details.mon_groups)
                                    }
                                    d.form.details=JSON.stringify(d.form.details)
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
                                        if(!d.d.sub){
                                            delete(s.group[d.ke].webdav)
                                            s.init('apps',d)
                                        }
                                        tx({f:'user_settings_change',uid:d.uid,ke:d.ke,form:d.form});
                                    });
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
                            if(d.m.details.control!=="1"){s.log(d,{type:lang['Control Error'],msg:lang.ControlErrorText1});return}
                            if(!d.m.details.control_base_url||d.m.details.control_base_url===''){
                                d.base=s.init('url_no_path',d.m);
                            }else{
                                d.base=d.m.details.control_base_url;
                            }
                            if(!d.m.details.control_url_stop_timeout||d.m.details.control_url_stop_timeout===''){d.m.details.control_url_stop_timeout=1000}
                            d.setURL=function(url){
                                d.URLobject=URL.parse(url)
                                if(!d.URLobject.port){d.URLobject.port=80}
                                d.options = {
                                    host: d.URLobject.host,
                                    port: d.URLobject.port,
                                    method: "GET",
                                    path: d.URLobject.pathname,
                                };
                                if(d.URLobject.query){
                                    d.options.path=d.options.path+'?'+d.URLobject.query
                                }
                                if(d.URLobject.username&&d.URLobject.password){
                                    d.options.auth=d.URLobject.username+':'+d.URLobject.password
                                }
                                if(d.URLobject.auth){
                                    d.options.auth=d.URLobject.auth
                                }
                            }
                            d.setURL(d.base+d.m.details['control_url_'+d.direction])
                            http.get(d.options, function(first) {
                                  first.on('end', function(){
                                    if(d.m.details.control_stop=='1'&&d.direction!=='center'){
                                        d.setURL(d.base+d.m.details['control_url_'+d.direction+'_stop'])
                                        setTimeout(function(){
                                            http.get(d.options, function(data) {
                                                  data.on('end', function(){
                                                      if(err){s.log(d,{type:'Control Error',msg:err});return false}
                                                      s.tx({f:'control',mid:d.mid,ke:d.ke,direction:d.direction,url_stop:true});
                                                  });
                                            }).on('error', function(err) {
                                               s.log(d,{type:'Control Error',msg:err});
                                            }).end();
                                        },d.m.details.control_url_stop_timeout)
                                    }else{
                                        tx({f:'control',mid:d.mid,ke:d.ke,direction:d.direction,url_stop:false});
                                    }
                                  });
                            }).on('error', function(err) {
                                s.log(d,{type:'Control Error',msg:err});
                            }).end();
                        break;
                        case'jpeg_off':
                          delete(cn.jpeg_on);
                            if(cn.monitor_watching){
                          Object.keys(cn.monitor_watching).forEach(function(n,v){
                              v=cn.monitor_watching[n];
                              cn.join('MON_STREAM_'+n);
                          });
                            }
                            tx({f:'mode_jpeg_off'})
                        break;
                        case'jpeg_on':
                          cn.jpeg_on=true;
                            if(cn.monitor_watching){
                          Object.keys(cn.monitor_watching).forEach(function(n,v){
                              v=cn.monitor_watching[n];
                              cn.leave('MON_STREAM_'+n);
                          });
                            }
                          tx({f:'mode_jpeg_on'})
                        break;
                        case'watch_on':
                            if(!d.ke){d.ke=cn.ke}
                            s.init(0,{mid:d.id,ke:d.ke});
                            if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]||s.group[d.ke].mon[d.id].started===0){return false}
                            s.camera(d.ff,d,cn,tx)
                            cn.join('MON_'+d.id);
                            if(cn.jpeg_on!==true){
                                cn.join('MON_STREAM_'+d.id);
                            } if(s.group[d.ke]&&s.group[d.ke].mon&&s.group[d.ke].mon[d.id]&&s.group[d.ke].mon[d.id].watch){

                                tx({f:'monitor_watch_on',id:d.id,ke:d.ke})
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
                        case'fix':
                            s.video('fix',d)
                        break;
                        case'delete':
                            s.video('delete',d)
                        break;
                    }
                break;
                case'ffprobe':
                    if(s.group[cn.ke].users[cn.auth]){
                        switch(d.ff){
                            case'stop':
                                exec('kill -9 '+s.group[cn.ke].users[cn.auth].ffprobe.pid,{detatched: true})
                            break;
                            default:
                                if(s.group[cn.ke].users[cn.auth].ffprobe){
                                    return
                                }
                                s.group[cn.ke].users[cn.auth].ffprobe=1;
                                tx({f:'ffprobe_start'})
                                exec('ffprobe '+('-v quiet -print_format json -show_format -show_streams '+d.query),function(err,data){
                                    tx({f:'ffprobe_data',data:data.toString('utf8')})
                                    delete(s.group[cn.ke].users[cn.auth].ffprobe)
                                    tx({f:'ffprobe_stop'})
                                })
                                //auto kill in 30 seconds
                                setTimeout(function(){
                                    exec('kill -9 '+d.pid,{detached: true})
                                },30000)
                            break;
                        }
                    }
                break;
                case'onvif':
                    d.ip=d.ip.replace(/ /g,'');
                    d.port=d.port.replace(/ /g,'');
                    if(d.ip===''){
                        var interfaces = os.networkInterfaces();
                        var addresses = [];
                        for (var k in interfaces) {
                            for (var k2 in interfaces[k]) {
                                var address = interfaces[k][k2];
                                if (address.family === 'IPv4' && !address.internal) {
                                    addresses.push(address.address);
                                }
                            }
                        }
                        d.arr=[]
                        addresses.forEach(function(v){
                            if(v.indexOf('0.0.0')>-1){return false}
                            v=v.split('.');
                            delete(v[3]);
                            v=v.join('.');
                            d.arr.push(v+'1-'+v+'254')
                        })
                        d.ip=d.arr.join(',')
                    }
                    if(d.port===''){
                        d.port='80,8080,554'
                    }
                    d.ip.split(',').forEach(function(v){
                        if(v.indexOf('-')>-1){
                            v=v.split('-');
                            d.IP_RANGE_START = v[0],
                            d.IP_RANGE_END = v[1];
                        }else{
                            d.IP_RANGE_START = v;
                            d.IP_RANGE_END = v;
                        }
                        if(!d.IP_LIST){
                            d.IP_LIST = s.ipRange(d.IP_RANGE_START,d.IP_RANGE_END);
                        }else{
                            d.IP_LIST=d.IP_LIST.concat(s.ipRange(d.IP_RANGE_START,d.IP_RANGE_END))
                        }
                        //check port
                        if(d.port.indexOf('-')>-1){
                            d.port=d.port.split('-');
                            d.PORT_RANGE_START = d.port[0];
                            d.PORT_RANGE_END = d.port[1];
                            d.PORT_LIST = s.portRange(d.PORT_RANGE_START,d.PORT_RANGE_END);
                        }else{
                            d.PORT_LIST=d.port.split(',')
                        }
                        //check user name and pass
                        d.USERNAME='';
                        if(d.user){
                            d.USERNAME = d.user
                        }
                        d.PASSWORD='';
                        if(d.pass){
                            d.PASSWORD = d.pass
                        }
                    })
                    d.cams=[]
                    d.IP_LIST.forEach(function(ip_entry,n) {
                        d.PORT_LIST.forEach(function(port_entry,nn) {
                           return new Cam({
                                hostname: ip_entry,
                                username: d.USERNAME,
                                password: d.PASSWORD,
                                port: port_entry,
                                timeout : 5000
                            }, function CamFunc(err,data) {
                                if (err) return;
                                data={f:'onvif',ip:ip_entry,port:port_entry}
                                var cam_obj = this;
                                cam_obj.getSystemDateAndTime(function(er, date, xml) {
                                    if (!er) data.date = date;
                                   cam_obj.getDeviceInformation(function(er, info, xml) {
                                        if (!er) data.info = info;
                                        try {
                                            cam_obj.getStreamUri({
                                                protocol: 'RTSP'
                                            },function(er, stream, xml) {
                                                if (!er) data.url = stream;
                                                tx(data)
                                            });
                                        }catch(err){
                                            tx(data);
                                        }
                                   });
                                });
                            });
                        }); // foreach
                    }); // foreach
                break;
            }
        }catch(er){s.systemLog(er)}
        }else{
            tx({ok:false,msg:lang.NotAuthorizedText1});
        }
    });
    //functions for receiving detector data
    cn.on('ocv',function(d){
        if(!cn.ocv&&d.f==='init'){
            if(config.pluginKeys[d.plug]===d.pluginKey){
                s.ocv={started:moment(),id:cn.id,plug:d.plug,notice:d.notice};
                cn.ocv=1;
                s.tx({f:'detector_plugged',plug:d.plug,notice:d.notice},'CPU')
                s.tx({f:'readPlugins',ke:d.ke},'CPU')
                s.systemLog('Connected to plugin : Detector - '+d.plug)
            }else{
                cn.disconnect()
            }
        }else{
            if(config.pluginKeys[d.plug]===d.pluginKey){
                switch(d.f){
                    case'trigger':
                        s.camera('motion',d)
                    break;
                    case's.tx':
                        s.tx(d.data,d.to)
                    break;
                    case'sql':
                        sql.query(d.query,d.values);
                    break;
                    case'log':
                        s.systemLog('PLUGIN : '+d.plug+' : ',d)
                    break;
                }
            }else{
                cn.disconnect()
            }
        }
    })
    //functions for retrieving cron announcements
    cn.on('cron',function(d){
        if(d.f==='init'){
            if(config.cron.key){
                if(config.cron.key===d.cronKey){
                   s.cron={started:moment(),last_run:moment(),id:cn.id};
                }else{
                    cn.disconnect()
                }
            }else{
                s.cron={started:moment(),last_run:moment(),id:cn.id};
            }
        }else{
            if(s.cron&&cn.id===s.cron.id){
                delete(d.cronKey)
                switch(d.f){
                    case'filters':
                        s.filter(d.ff,d);
                    break;
                    case's.tx':
                        s.tx(d.data,d.to)
                    break;
                    case's.video':
                        s.video(d.data,d.file)
                    break;
                    case'start':case'end':
                        d.mid='_cron';s.log(d,{type:'cron',msg:d.msg})
                    break;
                    default:
                        s.systemLog('CRON : ',d)
                    break;
                }
            }else{
                cn.disconnect()
            }
        }
    })
    // admin page socket functions
    cn.on('super',function(d){
        if(!cn.init&&d.f=='init'){
            d.ok=s.superAuth({mail:d.mail,pass:d.pass},function(data){
                cn.join('SUPER');
                cn.init='super';
                cn.mail=d.mail;
                s.tx({f:'init_success',mail:d.mail},cn.id);
            })
            if(d.ok===false){
                cn.disconnect();
            }
        }else{
            if(cn.mail&&cn.init=='super'){
                switch(d.f){
                    case'accounts':
                        switch(d.ff){
                            case'register':
                                if(d.form.mail!==''&&d.form.pass!==''){
                                    if(d.form.pass===d.form.password_again){
                                        sql.query('SELECT * FROM Users WHERE mail=?',[d.form.mail],function(err,r) {
                                            if(r&&r[0]){//found one exist
                                                d.msg='Email address is in use.';
                                                s.tx({f:'error',ff:'account_register',msg:d.msg},cn.id)
                                            }else{//create new
                                                //user id
                                                d.form.uid=s.gid();
                                                //check to see if custom key set
                                                if(!d.form.ke||d.form.ke===''){
                                                    d.form.ke=s.gid()
                                                }
                                                sql.query('INSERT INTO Users (ke,uid,mail,pass,details) VALUES (?,?,?,?,?)',[d.form.ke,d.form.uid,d.form.mail,s.md5(d.form.pass),d.form.details])
                                                s.tx({f:'add_account',details:d.form.details,ke:d.form.ke,uid:d.form.uid,mail:d.form.mail},'SUPER');
                                            }
                                        })
                                    }else{
                                        d.msg=lang["Passwords Don't Match"];
                                    }
                                }else{
                                    d.msg=lang['Fields cannot be empty'];
                                }
                                if(d.msg){
                                    s.tx({f:'error',ff:'account_register',msg:d.msg},cn.id)
                                }
                            break;
                            case'edit':
                                if(d.form.pass&&d.form.pass!==''){
                                   if(d.form.pass===d.form.password_again){
                                       d.form.pass=s.md5(d.form.pass);
                                   }else{
                                       s.tx({f:'error',ff:'account_edit',msg:lang["Passwords Don't Match"]},cn.id)
                                       return
                                   }
                                }else{
                                    delete(d.form.pass);
                                }
                                delete(d.form.password_again);
                                d.keys=Object.keys(d.form);
                                d.set=[];
                                d.values=[];
                                d.keys.forEach(function(v,n){
                                    if(d.set==='ke'||d.set==='password_again'||!d.form[v]){return}
                                    d.set.push(v+'=?')
                                    d.values.push(d.form[v])
                                })
                                d.values.push(d.account.mail)
                                sql.query('UPDATE Users SET '+d.set.join(',')+' WHERE mail=?',d.values,function(err,r) {
                                    if(err){
                                        s.systemLog('UPDATE Users SET '+d.set.join(',')+' WHERE mail=?',d.values,err)
                                        s.tx({f:'error',ff:'account_edit',msg:lang.AccountEditText1},cn.id)
                                        return
                                    }
                                    s.tx({f:'edit_account',form:d.form,ke:d.account.ke,uid:d.account.uid},'SUPER');
                                    delete(s.group[d.account.ke].init);
                                    s.init('apps',d.account)
                                })
                            break;
                            case'delete':
                                sql.query('DELETE FROM Users WHERE uid=? AND ke=? AND mail=?',[d.account.uid,d.account.ke,d.account.mail])
                                sql.query('DELETE FROM API WHERE uid=? AND ke=?',[d.account.uid,d.account.ke])
                                s.tx({f:'delete_account',ke:d.account.ke,uid:d.account.uid,mail:d.account.mail},'SUPER');
                            break;
                        }
                    break;
                }
            }
        }
    })
    // admin page socket functions
    cn.on('a',function(d){
        if(!cn.init&&d.f=='init'){
            sql.query('SELECT * FROM Users WHERE auth=? && uid=?',[d.auth,d.uid],function(err,r){
                if(r&&r[0]){
                    r=r[0];
                    if(!s.group[d.ke]){s.group[d.ke]={users:{}}}
                    if(!s.group[d.ke].users[d.auth]){s.group[d.ke].users[d.auth]={cnid:cn.id}}
                    try{s.group[d.ke].users[d.auth].details=JSON.parse(r.details)}catch(er){}
                    cn.join('ADM_'+d.ke);
                    cn.ke=d.ke;
                    cn.uid=d.uid;
                    cn.auth=d.auth;
                    cn.init='admin';
                }else{
                    cn.disconnect();
                }
            })
        }else{
            s.auth({auth:d.auth,ke:d.ke,id:d.id,ip:cn.request.connection.remoteAddress},function(user){
                if(!user.details.sub){
                    switch(d.f){
                        case'accounts':
                            switch(d.ff){
                                case'edit':
                                    d.keys=Object.keys(d.form);
                                    d.condition=[];
                                    d.value=[];
                                    d.keys.forEach(function(v){
                                        d.condition.push(v+'=?')
                                        d.value.push(d.form[v])
                                    })
                                    d.value=d.value.concat([cn.ke,d.$uid])
                                    sql.query("UPDATE Users SET "+d.condition.join(',')+" WHERE ke=? AND uid=?",d.value)
                                    s.tx({f:'edit_sub_account',ke:cn.ke,uid:d.$uid,mail:d.mail,form:d.form},'ADM_'+d.ke);
                                break;
                                case'delete':
                                    sql.query('DELETE FROM Users WHERE uid=? AND ke=? AND mail=?',[d.$uid,cn.ke,d.mail])
                                    sql.query('DELETE FROM API WHERE uid=? AND ke=?',[d.$uid,cn.ke])
                                    s.tx({f:'delete_sub_account',ke:cn.ke,uid:d.$uid,mail:d.mail},'ADM_'+d.ke);
                                break;
                            }
                        break;
                    }
                }
            })
        }
    })
    //functions for webcam recorder
    cn.on('r',function(d){
        if(!cn.ke&&d.f==='init'){
            sql.query('SELECT ke,uid,auth,mail,details FROM Users WHERE ke=? AND auth=? AND uid=?',[d.ke,d.auth,d.uid],function(err,r) {
                if(r&&r[0]){
                    r=r[0]
                    cn.ke=d.ke,cn.uid=d.uid,cn.auth=d.auth;
                    if(!s.group[d.ke])s.group[d.ke]={};
                    if(!s.group[d.ke].users)s.group[d.ke].users={};
                    s.group[d.ke].users[d.auth]={cnid:cn.id,uid:r.uid,mail:r.mail,details:JSON.parse(r.details),logged_in_at:moment(new Date).format(),login_type:'Streamer'}
                }
            })
        }else{
            switch(d.f){
                case'monitor_chunk':
                    if(!s.group[d.ke]||!s.group[d.ke].mon[d.mid]){return}
                    if(s.group[d.ke].mon[d.mid].started!==1){s.tx({error:'Not Started'},cn.id);return false};
                    if(s.group[d.ke].mon[d.mid].record.yes===1){
                        s.group[d.ke].mon[d.mid].spawn.stdin.write(new Buffer(d.chunk, "binary"));
                    }
                break;
                case'monitor_frame':
                    if(!s.group[d.ke]||!s.group[d.ke].mon[d.mid]){return}
                    if(s.group[d.ke].mon[d.mid].started!==1){s.tx({error:'Not Started'},cn.id);return false};
                    if(s.group[d.ke].mon[d.mid].record.yes===1){
                        s.group[d.ke].mon[d.mid].spawn.stdin.write(d.frame);
                    }
                break;
            }
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
                if(d.f!=='s.tx'){s.systemLog(d)};
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
    //embed functions
    cn.on('e', function (d) {
        tx=function(z){if(!z.ke){z.ke=cn.ke;};cn.emit('f',z);}
        switch(d.f){
            case'init':
                    if(!s.group[d.ke]||!s.group[d.ke].mon[d.id]||s.group[d.ke].mon[d.id].started===0){return false}
                s.auth({auth:d.auth,ke:d.ke,id:d.id,ip:cn.request.connection.remoteAddress},function(user){
                    cn.embedded=1;
                    cn.ke=d.ke;
                    if(!cn.mid){cn.mid={}}
                    cn.mid[d.id]={};
//                    if(!s.group[d.ke].embed){s.group[d.ke].embed={}}
//                    if(!s.group[d.ke].embed[d.mid]){s.group[d.ke].embed[d.mid]={}}
//                    s.group[d.ke].embed[d.mid][cn.id]={}

                    s.camera('watch_on',d,cn,tx)
                    cn.join('MON_'+d.id);
                    cn.join('MON_STREAM_'+d.id);
                    cn.join('STR_'+d.ke);
                    if(s.group[d.ke]&&s.group[d.ke].mon[d.id]&&s.group[d.ke].mon[d.id].watch){

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
                if(s.group[cn.ke].users[cn.auth].login_type==='Dashboard'){
                   s.tx({f:'user_status_change',ke:cn.ke,uid:cn.uid,status:0})
                }
                delete(s.group[cn.ke].users[cn.auth]);
            }
        }
        if(cn.ocv){
            s.tx({f:'detector_unplugged',plug:s.ocv.plug},'CPU')
            delete(s.ocv);
        }
        if(cn.cron){
            delete(s.cron);
        }
        if(cn.shinobi_child){
            delete(s.child_nodes[cn.ip]);
        }
    })
});
//Authenticator functions
s.api={};
//auth handler
s.auth=function(xx,x,res,req){
    if(req){
        xx.ip=req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        xx.failed=function(){
            if(!req.ret){req.ret={ok:false}}
            req.ret.msg=lang['Not Authorized'];
            res.send(s.s(req.ret, null, 3));
        }
    }else{
        xx.failed=function(){
            //maybe log
        }
    }
    xx.checkIP=function(ee){
        if(s.api[xx.auth].ip.indexOf('0.0.0.0')>-1||s.api[xx.auth].ip.indexOf(xx.ip)>-1){
            x(s.api[xx.auth]);
        }else{
            xx.failed();
        }
    }
    if(s.group[xx.ke]&&s.group[xx.ke].users&&s.group[xx.ke].users[xx.auth]){
        s.group[xx.ke].users[xx.auth].permissions={};
        x(s.group[xx.ke].users[xx.auth]);
    }else{
        if(s.api[xx.auth]&&s.api[xx.auth].details){
            xx.checkIP();
        }else{
            sql.query('SELECT * FROM API WHERE code=? AND ke=?',[xx.auth,xx.ke],function(err,r){
                if(r&&r[0]){
                    r=r[0];
                    s.api[xx.auth]={ip:r.ip,permissions:JSON.parse(r.details)};
                    sql.query('SELECT details FROM Users WHERE uid=? AND ke=?',[r.uid,r.ke],function(err,rr){
                        if(rr&&rr[0]){
                            rr=rr[0];
                            try{
                                s.api[xx.auth].details=JSON.parse(rr.details)
                                s.api[xx.auth].lang=s.getLanguageFile(s.api[xx.auth].details.lang)
                            }catch(er){}
                        }
                        xx.checkIP();
                    })
                }else{
                    xx.failed();
                }
            })
        }
    }
}
s.superAuth=function(x,callback){
    req={};
    req.super=require('./super.json');
    req.super.forEach(function(v,n){
        if(x.md5===true){
            x.pass=s.md5(x.pass);
        }
        if(x.mail.toLowerCase()===v.mail.toLowerCase()&&x.pass===v.pass){
            req.found=1;
            if(x.users===true){
                sql.query('SELECT * FROM Users WHERE details NOT LIKE ?',['%"sub"%'],function(err,r) {
                    callback({$user:v,users:r,config:config,lang:lang})
                })
            }else{
                callback({$user:v,config:config,lang:lang})
            }
        }
    })
    if(req.found!==1){
        return false;
    }else{
        return true;
    }
}
////Pages
app.enable('trust proxy');
app.use(express.static(s.dir.videos));
app.use('/libs',express.static(__dirname + '/web/libs'));
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
    res.render('index',{lang:lang});
});
//update server
app.get('/:auth/update/:key', function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(user){
        if(!config.updateKey){
            req.ret.msg=user.lang.updateKeyText1;
            return;
        }
        if(req.params.key===config.updateKey){
            req.ret.ok=true;
            exec('chmod +x '+__dirname+'/UPDATE.sh&&'+__dirname+'/./UPDATE.sh',{detached: true})
        }else{
            req.ret.msg=user.lang.updateKeyText2;
        }
        res.send(s.s(req.ret, null, 3));
    }
    s.auth(req.params,req.fn,res,req);
});
//register function
app.post('/:auth/register/:ke/:uid',function (req,res){
    req.resp={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(user){
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
                                req.body.details='{"sub":"1","allmonitors":"1"}';
                                sql.query('INSERT INTO Users (ke,uid,mail,pass,details) VALUES (?,?,?,?,?)',[req.params.ke,req.gid,req.body.mail,s.md5(req.body.pass),req.body.details])
                                s.tx({f:'add_sub_account',details:req.body.details,ke:req.params.ke,uid:req.gid,mail:req.body.mail},'ADM_'+req.params.ke);
                            }
                            res.send(s.s(req.resp,null,3));
                        })
                    }else{
                        req.resp.msg=user.lang['Passwords Don\'t Match'];
                    }
                }else{
                    req.resp.msg=user.lang['Fields cannot be empty'];
                }
            }else{
                req.resp.msg=user.lang['Not an Administrator Account'];
            }
            if(req.resp.msg){
                res.send(s.s(req.resp,null,3));
            }
        })
    },res,req);
})
//login function
s.deleteFactorAuth=function(r){
    delete(s.factorAuth[r.ke][r.uid])
    if(Object.keys(s.factorAuth[r.ke]).length===0){
        delete(s.factorAuth[r.ke])
    }
}
app.post('/',function (req,res){
    if(req.query.json=='true'){
        res.header("Access-Control-Allow-Origin",req.headers.origin);
    }
    req.renderFunction=function(focus,data){
        if(req.query.json=='true'){
            delete(data.config)
            data.ok=true;
            res.setHeader('Content-Type', 'application/json');
            res.send(s.s(data, null, 3))
        }else{
            res.render(focus,data);
        }
    }
    req.failed=function(){
        if(req.query.json=='true'){
            res.setHeader('Content-Type', 'application/json');
            res.send(s.s({ok:false}, null, 3))
        }else{
            res.render("index",{failedLogin:true,lang:lang});
            res.end();
        }
    }
    req.fn=function(r){
        switch(req.body.function){
            case'cam':
                sql.query('SELECT * FROM Monitors WHERE ke=? AND type=?',[r.ke,"dashcam"],function(err,rr){
                    req.resp.mons=rr;
                    req.renderFunction("dashcam",{$user:req.resp,lang:r.lang});
                })
            break;
            case'streamer':
                sql.query('SELECT * FROM Monitors WHERE ke=? AND type=?',[r.ke,"socket"],function(err,rr){
                    req.resp.mons=rr;
                    req.renderFunction("streamer",{$user:req.resp,lang:r.lang});
                })
            break;
            case'admin':
                if(!r.details.sub){
                    sql.query('SELECT uid,mail,details FROM Users WHERE ke=? AND details LIKE \'%"sub"%\'',[r.ke],function(err,rr) {
                        sql.query('SELECT * FROM Monitors WHERE ke=?',[r.ke],function(err,rrr) {
                            req.renderFunction("admin",{$user:req.resp,$subs:rr,$mons:rrr,lang:r.lang});
                        })
                    })
                }else{
                    //not admin user
                    req.renderFunction("home",{$user:req.resp,config:config,lang:r.lang,fs:fs});
                }
            break;
            default:
                req.renderFunction("home",{$user:req.resp,config:config,lang:r.lang,fs:fs});
            break;
        }
    //    res.end();
    }
    if(req.body.mail&&req.body.pass){
        if(req.body.function==='super'){
            if(!fs.existsSync('./super.json')){
                res.end(lang.superAdminText)
                return
            }
            req.ok=s.superAuth({mail:req.body.mail,pass:req.body.pass,users:true,md5:true},function(data){
                req.renderFunction("super",data);
            })
            if(req.ok===false){
                req.failed()
            }
        }else{
            sql.query('SELECT * FROM Users WHERE mail=? AND pass=?',[req.body.mail,s.md5(req.body.pass)],function(err,r) {
                req.resp={ok:false};
                if(!err&&r&&r[0]){
                    r=r[0];r.auth=s.md5(s.gid());
                    sql.query("UPDATE Users SET auth=? WHERE ke=? AND uid=?",[r.auth,r.ke,r.uid])
                    req.resp={ok:true,auth_token:r.auth,ke:r.ke,uid:r.uid,mail:r.mail,details:r.details};
                    r.details=JSON.parse(r.details);
                    r.lang=s.getLanguageFile(r.details.lang)
                    req.factorAuth=function(cb){
                        if(r.details.factorAuth==="1"){
                            if(!r.details.acceptedMachines||!(r.details.acceptedMachines instanceof Object)){
                                r.details.acceptedMachines={}
                            }
                            if(!r.details.acceptedMachines[req.body.machineID]){
                                req.complete=function(){
                                    s.factorAuth[r.ke][r.uid].info=req.resp;
                                    clearTimeout(s.factorAuth[r.ke][r.uid].expireAuth)
                                    s.factorAuth[r.ke][r.uid].expireAuth=setTimeout(function(){
                                        s.deleteFactorAuth(r)
                                    },1000*60*15)
                                    req.renderFunction("factor",{$user:req.resp,lang:r.lang})
                                }
                                if(!s.factorAuth[r.ke]){s.factorAuth[r.ke]={}}
                                if(!s.factorAuth[r.ke][r.uid]){
                                    s.factorAuth[r.ke][r.uid]={key:s.nid(),user:r}
                                    r.mailOptions = {
                                        from: '"ShinobiCCTV" <no-reply@shinobi.video>',
                                        to: r.mail,
                                        subject: r.lang['2-Factor Authentication'],
                                        html: r.lang['Enter this code to proceed']+' <b>'+s.factorAuth[r.ke][r.uid].key+'</b>. '+r.lang.FactorAuthText1,
                                    };
                                    nodemailer.sendMail(r.mailOptions, (error, info) => {
                                        if (error) {
                                            s.systemLog(r.lang.MailError,error)
                                            req.fn(r)
                                            return
                                        }
                                        req.complete()
                                    });
                                }else{
                                    req.complete()
                                }
                            }else{
                               req.fn(r)
                            }
                        }else{
                           req.fn(r)
                        }
                    }
                    if(r.details.sub){
                        sql.query('SELECT details FROM Users WHERE ke=? AND details NOT LIKE ?',[r.ke,'%"sub"%'],function(err,rr) {
                            rr=rr[0];
                            rr.details=JSON.parse(rr.details);
                            r.details.mon_groups=rr.details.mon_groups;
                            req.resp.details=JSON.stringify(r.details);
                            req.factorAuth()
                        })
                    }else{
                        req.factorAuth()
                    }
                }else{
                    req.failed()
                }
            })
        }
    }else{
        if(req.body.machineID&&req.body.factorAuthKey){
            if(s.factorAuth[req.body.ke]&&s.factorAuth[req.body.ke][req.body.id]&&s.factorAuth[req.body.ke][req.body.id].key===req.body.factorAuthKey){
                if(s.factorAuth[req.body.ke][req.body.id].key===req.body.factorAuthKey){
                    if(req.body.remember==="1"){
                        req.details=JSON.parse(s.factorAuth[req.body.ke][req.body.id].info.details)
                        req.lang=s.loadedLanguages[req.details.lang]
                        if(!req.details.acceptedMachines||!(req.details.acceptedMachines instanceof Object)){
                            req.details.acceptedMachines={}
                        }
                        if(!req.details.acceptedMachines[req.body.machineID]){
                            req.details.acceptedMachines[req.body.machineID]={}
                            sql.query("UPDATE Users SET details=? WHERE ke=? AND uid=?",[s.s(req.details),req.body.ke,req.body.id])
                        }
                    }
                    req.resp=s.factorAuth[req.body.ke][req.body.id].info
                    req.fn(s.factorAuth[req.body.ke][req.body.id].user)
                }else{
                    req.renderFunction("factor",{$user:s.factorAuth[req.body.ke][req.body.id].info,lang:req.lang});
                    res.end();
                }
            }else{
                req.failed()
            }
        }else{
            req.failed()
        }
    }
});
// Get HLS stream (m3u8)
app.get('/:auth/hls/:ke/:id/:file', function (req,res){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    req.fn=function(user){
        req.dir=s.dir.streams+req.params.ke+'/'+req.params.id+'/'+req.params.file;
        res.on('finish',function(){res.end();});
        if (fs.existsSync(req.dir)){
            fs.createReadStream(req.dir).pipe(res);
        }else{
            res.send(user.lang['File Not Found'])
        }
    }
    s.auth(req.params,req.fn,res,req);
});
//Get JPEG snap
app.get('/:auth/jpeg/:ke/:id/s.jpg', function(req,res){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    s.auth(req.params,function(user){
        if(user.details.sub&&user.details.allmonitors!=='1'&&user.details.monitors.indexOf(req.params.id)===-1){
            res.end(user.lang['Not Permitted'])
            return
        }
        req.dir=s.dir.streams+req.params.ke+'/'+req.params.id+'/s.jpg';
            res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
            });
        res.on('finish',function(){res.end();delete(res)});
        if (fs.existsSync(req.dir)){
            fs.createReadStream(req.dir).pipe(res);
        }else{
            fs.createReadStream(config.defaultMjpeg).pipe(res);
        }
    },res,req);
});
//Get MJPEG stream
app.get(['/:auth/mjpeg/:ke/:id','/:auth/mjpeg/:ke/:id/:addon'], function(req,res) {
    if(req.params.addon=='full'){
        res.render('mjpeg',{url:'/'+req.params.auth+'/mjpeg/'+req.params.ke+'/'+req.params.id})
    }else{
        s.auth(req.params,function(user){
            if(user.permissions.watch_stream==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.monitors.indexOf(req.params.id)===-1){
                res.end(user.lang['Not Permitted'])
                return
            }
            res.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace; boundary=shinobi',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache'
            });
            var contentWriter,content = fs.readFileSync(config.defaultMjpeg,'binary');
            res.write("--shinobi\r\n");
            res.write("Content-Type: image/jpeg\r\n");
            res.write("Content-Length: " + content.length + "\r\n");
            res.write("\r\n");
            res.write(content,'binary');
            res.write("\r\n");
            if(s.group[req.params.ke]&&s.group[req.params.ke].mon[req.params.id]&&s.group[req.params.ke].mon[req.params.id].emitter){
                s.group[req.params.ke].mon[req.params.id].emitter.on('data',contentWriter=function(d){
                    content = d;
                    res.write(content,'binary');
                })
                res.on('close', function () {
                    s.group[req.params.ke].mon[req.params.id].emitter.removeListener('data',contentWriter)
                });
            }else{
                res.end();
            }
        },res,req);
    }
});
//embed monitor
app.get(['/:auth/embed/:ke/:id','/:auth/embed/:ke/:id/:addon'], function (req,res){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    req.params.protocol=req.protocol;
    s.auth(req.params,function(user){
        if(user.permissions.watch_stream==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.monitors.indexOf(req.params.id)===-1){
            res.end(user.lang['Not Permitted'])
            return
        }
        if(s.group[req.params.ke]&&s.group[req.params.ke].mon[req.params.id]){
            if(s.group[req.params.ke].mon[req.params.id].started===1){
                res.render("embed",{data:req.params,baseUrl:req.protocol+'://'+req.hostname,config:config,lang:user.lang,mon:CircularJSON.parse(CircularJSON.stringify(s.group[req.params.ke].mon_conf[req.params.id]))});
            }else{
                res.end(user.lang['Cannot watch a monitor that isn\'t running.'])
            }
        }else{
            res.end(user.lang['No Monitor Exists with this ID.'])
        }
    },res,req);
});
// Get monitors json
app.get(['/:auth/monitor/:ke','/:auth/monitor/:ke/:id'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(user){
    if(user.permissions.get_monitors==="0"){
        res.end(s.s([]))
        return
    }
        req.sql='SELECT * FROM Monitors WHERE ke=?';req.ar=[req.params.ke];
        if(!req.params.id){
            if(user.details.sub&&user.details.monitors&&user.details.allmonitors!=='1'){
                try{user.details.monitors=JSON.parse(user.details.monitors);}catch(er){}
                req.or=[];
                user.details.monitors.forEach(function(v,n){
                    req.or.push('mid=?');req.ar.push(v)
                })
                req.sql+=' AND ('+req.or.join(' OR ')+')'
            }
        }else{
            if(!user.details.sub||user.details.allmonitors!=='0'||user.details.monitors.indexOf(req.params.id)>-1){
                req.sql+=' and mid=?';req.ar.push(req.params.id)
            }else{
                res.send('[]');return;
            }
        }
        sql.query(req.sql,req.ar,function(err,r){
            if(r.length===1){r=r[0];}
            res.send(s.s(r, null, 3));
        })
    }
    s.auth(req.params,req.fn,res,req);
});
// Get videos json
app.get(['/:auth/videos/:ke','/:auth/videos/:ke/:id'], function (req,res){
    s.auth(req.params,function(user){
        if(user.permissions.watch_videos==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.video_view.indexOf(req.params.id)===-1){
            res.end(s.s([]))
            return
        }
        req.sql='SELECT * FROM Videos WHERE ke=?';req.ar=[req.params.ke];
        req.count_sql='SELECT COUNT(*) FROM Videos WHERE ke=?';req.count_ar=[req.params.ke];
        if(!req.params.id){
            if(user.details.sub&&user.details.monitors&&user.details.allmonitors!=='1'){
                try{user.details.monitors=JSON.parse(user.details.monitors);}catch(er){}
                req.or=[];
                user.details.monitors.forEach(function(v,n){
                    req.or.push('mid=?');req.ar.push(v)
                })
                req.sql+=' AND ('+req.or.join(' OR ')+')'
                req.count_sql+=' AND ('+req.or.join(' OR ')+')'
            }
        }else{
            if(!user.details.sub||user.details.allmonitors!=='0'||user.details.monitors.indexOf(req.params.id)>-1){
                req.sql+=' and mid=?';req.ar.push(req.params.id)
                req.count_sql+=' and mid=?';req.count_ar.push(req.params.id)
            }else{
                res.send('[]');return;
            }
        }
        if(req.query.start&&req.query.start!==''){
            req.query.start=req.query.start.replace('T',' ')
            if(req.query.end&&req.query.end!==''){
                req.query.end=req.query.end.replace('T',' ')
                req.sql+=' AND `time` >= ? AND `time` <= ?';
                req.count_sql+=' AND `time` >= ? AND `time` <= ?';
                req.ar.push(req.query.start)
                req.ar.push(req.query.end)
                req.count_ar.push(req.query.start)
                req.count_ar.push(req.query.end)
            }else{
                req.sql+=' AND `time` >= ?';
                req.count_sql+=' AND `time` >= ?';
                req.ar.push(req.query.start)
                req.count_ar.push(req.query.start)
            }
        }
        req.sql+=' ORDER BY `time` DESC';
        if(req.query.limit!=='0'){
            if(!req.query.limit||req.query.limit==''){
                req.query.limit=100
            }
            req.sql+=' LIMIT '+req.query.limit
        }
        sql.query(req.sql,req.ar,function(err,r){
            if(!r){
                res.end(s.s({total:0,limit:req.query.limit,skip:0,videos:[]}, null, 3));
                return
            }
        sql.query(req.count_sql,req.count_ar,function(err,count){
            r.forEach(function(v){
                v.href='/'+req.params.auth+'/videos/'+v.ke+'/'+v.mid+'/'+s.moment(v.time)+'.'+v.ext;
            })
            if(req.query.limit.indexOf(',')>-1){
                req.skip=parseInt(req.query.limit.split(',')[0])
                req.query.limit=parseInt(req.query.limit.split(',')[0])
            }else{
                req.skip=0
                req.query.limit=parseInt(req.query.limit)
            }
            res.end(s.s({total:count[0]['COUNT(*)'],limit:req.query.limit,skip:req.skip,videos:r}, null, 3));
        })
        })
    },res,req);
});
// Get events json (motion logs)
app.get(['/:auth/events/:ke','/:auth/events/:ke/:id','/:auth/events/:ke/:id/:limit','/:auth/events/:ke/:id/:limit/:start','/:auth/events/:ke/:id/:limit/:start/:end'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(user){
        if(user.permissions.watch_videos==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.video_view.indexOf(req.params.id)===-1){
            res.end(s.s([]))
            return
        }
        req.sql='SELECT * FROM Events WHERE ke=?';req.ar=[req.params.ke];
        if(!req.params.id){
            if(user.details.sub&&user.details.monitors&&user.details.allmonitors!=='1'){
                try{user.details.monitors=JSON.parse(user.details.monitors);}catch(er){}
                req.or=[];
                user.details.monitors.forEach(function(v,n){
                    req.or.push('mid=?');req.ar.push(v)
                })
                req.sql+=' AND ('+req.or.join(' OR ')+')'
            }
        }else{
            if(!user.details.sub||user.details.allmonitors!=='0'||user.details.monitors.indexOf(req.params.id)>-1){
                req.sql+=' and mid=?';req.ar.push(req.params.id)
            }else{
                res.send('[]');return;
            }
        }
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
    s.auth(req.params,function(user){
        if(user.permissions.get_logs==="0"){
            res.end(s.s([]))
            return
        }
        req.sql='SELECT * FROM Logs WHERE ke=?';req.ar=[req.params.ke];
        if(!req.params.id){
            if(user.details.sub&&user.details.monitors&&user.details.allmonitors!=='1'){
                try{user.details.monitors=JSON.parse(user.details.monitors);}catch(er){}
                req.or=[];
                user.details.monitors.forEach(function(v,n){
                    req.or.push('mid=?');req.ar.push(v)
                })
                req.sql+=' AND ('+req.or.join(' OR ')+')'
            }
        }else{
            if(!user.details.sub||user.details.allmonitors!=='0'||user.details.monitors.indexOf(req.params.id)>-1){
                req.sql+=' and mid=?';req.ar.push(req.params.id)
            }else{
                res.send('[]');return;
            }
        }
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
    req.fn=function(user){
        if(user.permissions.get_monitors==="0"){
            res.end(s.s([]))
            return
        }
        req.sql='SELECT * FROM Monitors WHERE ke=?';req.ar=[req.params.ke];
        if(user.details.sub&&user.details.monitors&&user.details.allmonitors!=='1'){
            try{user.details.monitors=JSON.parse(user.details.monitors);}catch(er){}
            req.or=[];
            user.details.monitors.forEach(function(v,n){
                req.or.push('mid=?');req.ar.push(v)
            })
            req.sql+=' AND ('+req.or.join(' OR ')+')'
        }
        sql.query(req.sql,req.ar,function(err,r){
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
// Monitor Add,Edit,Delete
app.all(['/:auth/configureMonitor/:ke/:id','/:auth/configureMonitor/:ke/:id/:f'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(user){
        if(req.params.f!=='delete'){
            if(!req.body.data&&!req.query.data){
                req.ret.msg='No Monitor Data found.'
                res.end(s.s(req.ret, null, 3))
                return
            }
            try{
                if(req.query.data){
                    req.monitor=JSON.parse(req.query.data)
                }else{
                    req.monitor=JSON.parse(req.body.data)
                }
            }catch(er){
                req.ret.msg=user.lang.monitorEditText1;
                res.end(s.s(req.ret, null, 3))
                return
            }
            if(!user.details.sub||user.details.allmonitors==='1'||user.details.monitor_edit.indexOf(req.monitor.mid)>-1){
                    if(req.monitor&&req.monitor.mid&&req.monitor.name){
                        req.set=[],req.ar=[];
                        req.monitor.mid=req.monitor.mid.replace(/[^\w\s]/gi,'').replace(/ /g,'');
                        try{JSON.parse(req.monitor.details)}catch(er){
                            req.ret.msg=user.lang.monitorEditText2;
                            res.end(s.s(req.ret, null, 3))
                            return
                        }
                        req.monitor.ke=req.params.ke
                        req.logObject={details:JSON.parse(req.monitor.details),ke:req.params.ke,mid:req.params.id}
                        sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.monitor.ke,req.monitor.mid],function(er,r){
                            req.tx={f:'monitor_edit',mid:req.monitor.mid,ke:req.monitor.ke,mon:req.monitor};
                            if(r&&r[0]){
                                req.tx.new=false;
                                Object.keys(req.monitor).forEach(function(v){
                                    if(req.monitor[v]&&req.monitor[v]!==''){
                                        req.set.push(v+'=?'),req.ar.push(req.monitor[v]);
                                    }
                                })
                                req.set=req.set.join(',');
                                req.ar.push(req.monitor.ke),req.ar.push(req.monitor.mid);
                                s.log(req.monitor,{type:'Monitor Updated',msg:'by user : '+user.uid});
                                req.ret.msg=user.lang['Monitor Updated by user']+' : '+user.uid;
                                sql.query('UPDATE Monitors SET '+req.set+' WHERE ke=? AND mid=?',req.ar)
                                req.finish=1;
                            }else{
                                if(!s.group[req.monitor.ke].init.max_camera||s.group[req.monitor.ke].init.max_camera==''||Object.keys(s.group[req.monitor.ke].mon).length <= parseInt(s.group[req.monitor.ke].init.max_camera)){
                                    req.tx.new=true;
                                    req.st=[];
                                    Object.keys(req.monitor).forEach(function(v){
                                        if(req.monitor[v]&&req.monitor[v]!==''){
                                            req.set.push(v),req.st.push('?'),req.ar.push(req.monitor[v]);
                                        }
                                    })
        //                                        req.set.push('ke'),req.st.push('?'),req.ar.push(req.monitor.ke);
                                    req.set=req.set.join(','),req.st=req.st.join(',');
                                    s.log(req.monitor,{type:'Monitor Added',msg:'by user : '+user.uid});
                                    req.ret.msg=user.lang['Monitor Added by user']+' : '+user.uid;
                                    sql.query('INSERT INTO Monitors ('+req.set+') VALUES ('+req.st+')',req.ar)
                                    req.finish=1;
                                }else{
                                    req.tx.f='monitor_edit_failed';
                                    req.tx.ff='max_reached';
                                    req.ret.msg=user.lang.monitorEditFailedMaxReached;
                                }
                            }
                            if(req.finish===1){
                                req.monitor.details=JSON.parse(req.monitor.details)
                                req.ret.ok=true;
                                s.init(0,{mid:req.monitor.mid,ke:req.monitor.ke});
                                s.group[req.monitor.ke].mon_conf[req.monitor.mid]=s.init('noReference',req.monitor);
                                if(req.monitor.mode==='stop'){
                                    s.camera('stop',req.monitor);
                                }else{
                                    s.camera('stop',req.monitor);setTimeout(function(){s.camera(req.monitor.mode,req.monitor);},5000)
                                };
                                s.tx(req.tx,'STR_'+req.monitor.ke);
                            };
                            s.tx(req.tx,'GRP_'+req.monitor.ke);
                            res.end(s.s(req.ret, null, 3))
                        })
                    }else{
                        req.ret.msg='Invalid Data, Check to see this is a valid import string.';
                        res.end(s.s(req.ret, null, 3))
                    }
            }else{
                    req.ret.msg=user.lang['Not Permitted'];
                    res.end(s.s(req.ret, null, 3))
            }
        }else{
            if(!user.details.sub||user.details.allmonitors==='1'||user.details.monitor_edit.indexOf(req.params.id)>-1){
                s.log(s.group[req.params.ke].mon_conf[req.params.id],{type:'Monitor Deleted',msg:'by user : '+user.uid});
                req.params.delete=1;s.camera('stop',req.params);
                s.tx({f:'monitor_delete',uid:user.uid,mid:req.params.id,ke:req.params.ke},'GRP_'+req.params.ke);
                sql.query('DELETE FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.id])
                req.ret.ok=true;
                req.ret.msg='Monitor Deleted by user : '+user.uid
                res.end(s.s(req.ret, null, 3))
            }
        }
    })
})
app.get(['/:auth/monitor/:ke/:id/:f','/:auth/monitor/:ke/:id/:f/:ff','/:auth/monitor/:ke/:id/:f/:ff/:fff'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    req.fn=function(user){
        if(user.permissions.control_monitors==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.monitor_edit.indexOf(req.params.id)===-1){
            res.end(user.lang['Not Permitted'])
            return
        }
        if(req.params.f===''){req.ret.msg=user.lang.monitorGetText1;res.send(s.s(req.ret, null, 3));return}
        if(req.params.f!=='stop'&&req.params.f!=='start'&&req.params.f!=='record'){
            req.ret.msg='Mode not recognized.';
            res.end(s.s(req.ret, null, 3));
            return;
        }
        sql.query('SELECT * FROM Monitors WHERE ke=? AND mid=?',[req.params.ke,req.params.id],function(err,r){
            if(r&&r[0]){
                r=r[0];
                if(req.query.reset==='1'||(s.group[r.ke]&&s.group[r.ke].mon_conf[r.mid].mode!==req.params.f)){
                    if(req.query.reset!=='1'||!s.group[r.ke].mon[r.mid].trigger_timer){
                        s.group[r.ke].mon[r.mid].currentState=r.mode.toString()
                        r.mode=req.params.f;
                        try{r.details=JSON.parse(r.details);}catch(er){}
                        r.id=r.mid;
                        sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',[r.mode,r.ke,r.mid]);
                        s.group[r.ke].mon_conf[r.mid]=r;
                        s.tx({f:'monitor_edit',mid:r.mid,ke:r.ke,mon:r},'GRP_'+r.ke);
                        s.tx({f:'monitor_edit',mid:r.mid,ke:r.ke,mon:r},'STR_'+r.ke);
                        s.camera('stop',s.init('noReference',r));
                        if(req.params.f!=='stop'){
                            s.camera(req.params.f,s.init('noReference',r));
                        }
                        req.ret.msg=user.lang['Monitor mode changed']+' : '+req.params.f;
                    }else{
                        req.ret.msg=user.lang['Reset Timer'];
                    }
                    req.ret.cmd_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss');
                    req.ret.ok=true;
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
                            delete(s.group[r.ke].mon[r.mid].trigger_timer)
                            sql.query('UPDATE Monitors SET mode=? WHERE ke=? AND mid=?',[s.group[r.ke].mon[r.mid].currentState,r.ke,r.mid]);
                            r.neglectTriggerTimer=1;
                            r.mode=s.group[r.ke].mon[r.mid].currentState;
                            s.camera('stop',s.init('noReference',r),function(){
                                if(s.group[r.ke].mon[r.mid].currentState!=='stop'){
                                    s.camera(s.group[r.ke].mon[r.mid].currentState,s.init('noReference',r));
                                }
                                s.group[r.ke].mon_conf[r.mid]=r;
                            });
                            s.tx({f:'monitor_edit',mid:r.mid,ke:r.ke,mon:r},'GRP_'+r.ke);
                            s.tx({f:'monitor_edit',mid:r.mid,ke:r.ke,mon:r},'STR_'+r.ke);
                        },req.timeout);
//                        req.ret.end_at=s.moment(new Date,'YYYY-MM-DD HH:mm:ss').add(req.timeout,'milliseconds');
                    }
                 }else{
                    req.ret.msg=user.lang['Monitor mode is already']+' : '+req.params.f;
                }
            }else{
                req.ret.msg=user.lang['Monitor or Key does not exist.'];
            }
            res.end(s.s(req.ret, null, 3));
        })
    }
    s.auth(req.params,req.fn,res,req);
})

// Get video file
app.get('/:auth/videos/:ke/:id/:file', function (req,res){
    s.auth(req.params,function(user){
        if(user.permissions.watch_videos==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.monitors.indexOf(req.params.id)===-1){
            res.end(user.lang['Not Permitted'])
            return
        }
        req.dir=s.dir.videos+req.params.ke+'/'+req.params.id+'/'+req.params.file;
        if (fs.existsSync(req.dir)){
            req.ext=req.params.file.split('.')[1];
            var total = fs.statSync(req.dir).size;
            if (req.headers['range']) {
                var range = req.headers.range;
                var parts = range.replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];

                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : total-1;
                var chunksize = (end-start)+1;
                var file = fs.createReadStream(req.dir, {start: start, end: end});
                req.headerWrite={ 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/'+req.ext }
                req.writeCode=206
            } else {
                req.headerWrite={ 'Content-Length': total, 'Content-Type': 'video/'+req.ext};
                var file=fs.createReadStream(req.dir)
                req.writeCode=200
            }
            if(req.query.downloadName){
                req.headerWrite['content-disposition']='attachment; filename="'+req.query.downloadName+'"';
            }
            res.writeHead(req.writeCode,req.headerWrite);
            file.pipe(res);
        }else{
            res.end(user.lang['File Not Found'])
        }
    },res,req);
});
//motion trigger
app.get('/:auth/motion/:ke/:id', function (req,res){
    s.auth(req.params,function(user){
        if(req.query.data){
            try{
                var d={id:req.params.id,ke:req.params.ke,details:JSON.parse(req.query.data)};
            }catch(err){
                res.end('Data Broken');
                return;
            }
        }else{
            res.end('No Data');
            return;
        }
        if(!d.ke||!d.id||!s.group[d.ke]){
            res.end(user.lang['No Group with this key exists']);
            return;
        }
        s.camera('motion',d,function(){
            res.end(user.lang['Trigger Successful'])
        });
},res,req);
})
//modify video file
app.get(['/:auth/videos/:ke/:id/:file/:mode','/:auth/videos/:ke/:id/:file/:mode/:f'], function (req,res){
    req.ret={ok:false};
    res.setHeader('Content-Type', 'application/json');
    s.auth(req.params,function(user){
        if(user.permissions.watch_videos==="0"||user.details.sub&&user.details.allmonitors!=='1'&&user.details.video_delete.indexOf(req.params.id)===-1){
            res.end(user.lang['Not Permitted'])
            return
        }
        req.sql='SELECT * FROM Videos WHERE ke=? AND mid=? AND time=?';
        req.ar=[req.params.ke,req.params.id,s.nameToTime(req.params.file)];
        sql.query(req.sql,req.ar,function(err,r){
            if(r&&r[0]){
                r=r[0];r.filename=s.moment(r.time)+'.'+r.ext;
                switch(req.params.mode){
                    case'fix':
                        req.ret.ok=true;
                        s.video('fix',r)
                    break;
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
                        req.ret.msg=user.lang.modifyVideoText1;
                    break;
                }
            }else{
                req.ret.msg=user.lang['No such file'];
            }
            res.send(s.s(req.ret, null, 3));
        })
    },res,req);
})
try{
s.cpuUsage=function(e){
    k={}
    switch(s.platform){
        case'win32':
            k.cmd="@for /f \"skip=1\" %p in ('wmic cpu get loadpercentage') do @echo %p%"
        break;
        case'darwin':
            k.cmd="ps -A -o %cpu | awk '{s+=$1} END {print s}'";
        break;
        case'linux':
            k.cmd='LANG=C top -b -n 2 | grep "^'+config.cpuUsageMarker+'" | awk \'{print $2}\' | tail -n1';
        break;
    }
    if(k.cmd){
         exec(k.cmd,{encoding:'utf8',detached: true},function(err,d){
             if(s.isWin===true){
                 d=d.replace(/(\r\n|\n|\r)/gm,"").replace(/%/g,"")
             }
             e(d)
         });
    }else{
        e(0)
    }
}
s.ramUsage=function(e){
    k={}
    switch(s.platform){
        case'win32':
            k.cmd = "wmic OS get FreePhysicalMemory /Value"
        break;
        case'darwin':
            k.cmd = "vm_stat | awk '/^Pages free: /{f=substr($3,1,length($3)-1)} /^Pages active: /{a=substr($3,1,length($3-1))} /^Pages inactive: /{i=substr($3,1,length($3-1))} /^Pages speculative: /{s=substr($3,1,length($3-1))} /^Pages wired down: /{w=substr($4,1,length($4-1))} /^Pages occupied by compressor: /{c=substr($5,1,length($5-1)); print ((a+w)/(f+a+i+w+s+c))*100;}'"
        break;
        default:
            k.cmd = "LANG=C free | grep Mem | awk '{print $4/$2 * 100.0}'";
        break;
    }
    if(k.cmd){
         exec(k.cmd,{encoding:'utf8',detached: true},function(err,d){
             if(s.isWin===true){
                 d=(parseInt(d.split('=')[1])/(s.totalmem/1000))*100
             }
             e(d)
         });
    }else{
        e(0)
    }
}
    setInterval(function(){
        s.cpuUsage(function(cpu){
            s.ramUsage(function(ram){
                s.tx({f:'os',cpu:cpu,ram:ram},'CPU');
            })
        })
    },10000);
}catch(err){s.systemLog(lang['CPU indicator will not work. Continuing...'])}
//check disk space every 20 minutes
if(config.autoDropCache===true){
    setInterval(function(){
        exec('echo 3 > /proc/sys/vm/drop_caches',{detached: true})
    },60000*20);
}
s.beat=function(){
    setTimeout(s.beat, 8000);
    io.sockets.emit('ping',{beat:1});
}
s.beat();
setTimeout(function(){
    //get current disk used for each isolated account (admin user) on startup
    sql.query('SELECT * FROM Users WHERE details NOT LIKE ?',['%"sub"%'],function(err,r){
        if(r&&r[0]){
            var count = r.length
            var countFinished = 0
            r.forEach(function(v,n){
                v.size=0;
                v.limit=JSON.parse(v.details).size
                sql.query('SELECT * FROM Videos WHERE ke=? AND status!=?',[v.ke,0],function(err,rr){
                    ++countFinished
                    if(r&&r[0]){
                        rr.forEach(function(b){
                            v.size+=b.size
                        })
                    }
                    s.systemLog(v.mail+' : '+lang.startUpText0+' : '+rr.length,v.size)
                    if(!s.group[v.ke]){
                        s.group[v.ke]={}
                    }
                    if(!s.group[v.ke].init){
                        s.group[v.ke].init={}
                    }
                    if(!v.limit||v.limit===''){v.limit=10000}else{v.limit=parseFloat(v.limit)}
                    //save global space limit for group key (mb)
                    s.group[v.ke].init.size=v.limit;
                    //save global used space as megabyte value
                    s.group[v.ke].init.used_space=v.size/1000000;
                    //emit the changes to connected users
                    s.init('diskUsed',v)
                    s.systemLog(v.mail+' : '+lang.startUpText1,countFinished,count)
                    if(countFinished===count){
                        s.systemLog(lang.startUpText2)
                        ////close open videos
                        sql.query('SELECT * FROM Videos WHERE status=?',[0],function(err,r){
                            if(r&&r[0]){
                                r.forEach(function(v){
                                    s.init(0,v)
                                    v.filename=s.moment(v.time);
                                    s.video('close',v);
                                })
                            }
                            s.systemLog(lang.startUpText3)
                            setTimeout(function(){
                                s.systemLog(lang.startUpText4)
                                //preliminary monitor start
                                sql.query('SELECT * FROM Monitors', function(err,r) {
                                    if(err){s.systemLog(err)}
                                    if(r&&r[0]){
                                        r.forEach(function(v){
                                            s.init(0,v);
                                            r.ar={};
                                            r.ar.id=v.mid;
                                            Object.keys(v).forEach(function(b){
                                                r.ar[b]=v[b];
                                            })
                                            if(!s.group[v.ke]){
                                                s.group[v.ke]={}
                                                s.group[v.ke].mon_conf={}
                                            }
                                            v.details=JSON.parse(v.details);
                                            s.group[v.ke].mon_conf[v.mid]=v;
                                            s.camera(v.mode,r.ar);
                                        });
                                    }
                                    s.systemLog(lang.startUpText5)
                                    process.send('ready')
                                });
                            },3000)
                        })
                    }
                })
            })
        }
    })
},1500)