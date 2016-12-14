var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var request = require("request");
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {};
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var connectionTester = require('connection-tester');
exec("ps aux | grep -ie ffmpeg | awk '{print $2}' | xargs kill -9");//kill any ffmpeg running
process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
s={connected:false,socket_key:'3123asdasdf1dtj1hjk23sdfaasd12asdasddfdbtnkkfgvesra3asdsd3123afdsfqw345',child_node:true};

s.spawns={};
sql={query:function(x,y,z){io.emit('c',{f:'sql',query:x,values:y});if(typeof z==='function'){z();}
}}

io = require('socket.io-client')('ws://66.51.132.100:80');//connect to master
s.cx=function(x){io.emit('c',x)}
s.tx=function(x,y){s.cx({f:'s.tx',data:x,to:y})}
s.camera=function(x,y){s.cx({f:'camera',mode:x,data:y})}

///////camera controller edited for child helper
//load camera controller vars
s.nameToTime=function(x){x=x.replace('.webm','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
s.ratio=function(width,height,ratio){ratio = width / height;return ( Math.abs( ratio - 4 / 3 ) < Math.abs( ratio - 16 / 9 ) ) ? '4:3' : '16:9';}
s.gid=function(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
};
s.moment=function(e,x){if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};return moment(e).utcOffset('-0800').format(x)}
s.kill=function(x,e,p){
    if(e&&s.users[e.ke].mon[e.id].record){
        clearTimeout(s.users[e.ke].mon[e.id].record.capturing);
        if(s.users[e.ke].mon[e.id].record.request&&s.users[e.ke].mon[e.id].record.request.abort){s.users[e.ke].mon[e.id].record.request.abort();delete(s.users[e.ke].mon[e.id].record.request);}
    };
    if(!x||x===1){return};if(!x.stdin){return};p=x.pid;x.stdin.pause();setTimeout(function(){x.kill('SIGTERM');delete(x);setTimeout(function(){exec('kill -9 '+p)},1000)},1000)
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
    switch(x){
        case 0://camera
            if(!s.users[e.ke]){s.users[e.ke]={}};
            if(!s.users[e.ke].mon){s.users[e.ke].mon={}}
            if(!s.users[e.ke].mon[e.mid]){s.users[e.ke].mon[e.mid]={}}
            if(!s.users[e.ke].mon[e.mid].watch){s.users[e.ke].mon[e.mid].watch={}};
            if(e.type==='record'){e.record=1}else{e.record=0}
            if(!s.users[e.ke].mon[e.mid].record){s.users[e.ke].mon[e.mid].record={yes:e.record}};
            if(!s.users[e.ke].mon[e.mid].started){s.users[e.ke].mon[e.mid].started={}};
            if(!s.users[e.ke].mon[e.mid].running){s.users[e.ke].mon[e.mid].running={}};
        break;
        case'clean':
            if(e instanceof Object){
                x={keys:Object.keys(e),ar:{}};
                x.keys.forEach(function(v){
                    if(v!=='record'&&v!=='spawn'&&v!=='running'&&(typeof e[v]!=='function')){x.ar[v]=e[v];}
                });
                return x.ar;
            }
        break;
    }
    if(typeof e.callback==='function'){setTimeout(function(){e.callback();delete(e.callback);},2000);}
}
s.event=function(x,e){
    if(!e){e={}};
    if(e.mid){e.id=e.mid};
    switch(x){
        case'delete':
            e.dir=s.dir.events+e.ke+'/'+e.id+'/';
            e.save=[e.id,e.ke,s.nameToTime(e.filename),0];
            sql.query('DELETE FROM Videos WHERE `mid`=? AND `ke`=? AND `time`=? AND `status`=?',e.save)
            s.tx({f:'event_delete',reason:'Camera Error',filename:e.filename+'.webm',mid:e.id,ke:e.ke,time:s.nameToTime(e.filename),end:moment().format('YYYY-MM-DD HH:mm:ss')},'GRP_'+e.ke);
            if(fs.existsSync(e.dir+e.filename+'.webm')){
                return fs.unlink(e.dir+e.filename+'.webm');
            }
        break;
        case'close':
            e.dir=s.dir.events+e.ke+'/'+e.id+'/';
            console.log(e.dir+e.filename+'.webm')
            if(fs.existsSync(e.dir+e.filename+'.webm')){
                e.filesize=fs.statSync(e.dir+e.filename+'.webm')["size"];
                if((e.filesize/100000).toFixed(2)>0.25){
                    e.save=[e.filesize,e.frames,1,e.id,e.ke,s.nameToTime(e.filename)];
                    sql.query('UPDATE Videos SET `size`=?,`frames`=?,`status`=? WHERE `mid`=? AND `ke`=? AND `time`=?',e.save)
                    fs.readFile(e.dir+e.filename+'.webm',function (err,data) {
                        s.cx({f:'created_file',mid:e.id,ke:e.ke,created_file:data,filename:e.filename+'.webm',d:s.init('clean',e)});
                    });
                }else{
                    console.log('File Error '+e.id)
                    s.event('delete',e);
                }
            }else{
                console.log('No File '+e.id)
                s.event('delete',e);
            }
        break;
    }
}
s.ffmpeg=function(y,e,x){
    if(!x){x={tmp:''}}
    switch(y){
    case'args':
        switch(e.type){
            case'jpeg':
                ////' -vf "drawtext=fontfile=/usr/share/fonts/truetype/freefont/FreeSans.ttf:text=\'%{localtime}\':x=(w-tw)/2:y=0:fontcolor=white:box=1:boxcolor=0x00000000@1:fontsize=10'"
                x.tmp='-loglevel quiet -use_wallclock_as_timestamps 1 -f image2pipe -framerate 1 -vcodec mjpeg -i - -f webm -framerate 2 -q:v 1 '+e.dir+e.filename+'.webm'
            break;
            case'mjpeg':
                x.tmp='-loglevel warning -use_wallclock_as_timestamps 1 -reconnect 1 -r 5 -f mjpeg -i '+e.url+' -vcodec libvpx -r '+e.fps+' -q:v 1 '+e.dir+e.filename+'.webm -f mjpeg -vf fps=1 -s '+e.ratio+' pipe:1'
            break;
        }
        return x.tmp.split(' ');
    break;
    }
}

//child functions
var cn={};
io.on('connect', function(d){
    console.log('connected');
    io.emit('c',{f:'init',socket_key:s.socket_key,u:{name:'Macbook'}})
});
io.on('c',function(d){
    console.log(d.f);
    switch(d.f){
        case'init_success':
            s.connected=true;
            s.other_helpers=d.child_helpers;
        break;
        case'kill':
            s.init(0,d.d);
            s.kill(s.users[d.d.ke].mon[d.d.id].spawn,d.d)
        break;
        case'sync':
            s.init(0,d.sync);
            Object.keys(d.sync).forEach(function(v){
                s.users[d.sync.ke].mon[d.sync.mid][v]=d.sync[v];
            });
        break;
        case'delete_file'://delete event
            d.dir=s.dir.events+d.ke+'/'+d.mid+'/'+d.file;
            if(fs.existsSync(d.dir)){
                fs.unlink(d.dir);
            }
        break;
        case'close'://close event
            s.event('close',d.d);
        break;
        case'spawn'://start event
            s.init(0,d.d);
            s.users[d.d.ke].mon[d.d.id]=d.mon;
            s.init(0,d.d);
            if(s.users[d.d.ke].mon[d.d.id].spawn&&s.users[d.d.ke].mon[d.d.id].spawn.stdin){return}
            if(d.d.mode==='record'){
                s.users[d.d.ke].mon[d.d.id].record.yes=1;
                d.d.dir=s.dir.events+d.d.ke+'/';
                if (!fs.existsSync(d.d.dir)){
                    fs.mkdirSync(d.d.dir);
                }
                d.d.dir=s.dir.events+d.d.ke+'/'+d.d.id+'/';
                if (!fs.existsSync(d.d.dir)){
                    fs.mkdirSync(d.d.dir);
                }
            }else{
                d.d.dir=s.dir.frames+d.d.ke+'/';
                if (!fs.existsSync(d.d.dir)){
                    fs.mkdirSync(d.d.dir);
                }
                d.d.dir=s.dir.frames+d.d.ke+'/'+d.d.id+'/';
                if (!fs.existsSync(d.d.dir)){
                    fs.mkdirSync(d.d.dir);
                }
            }
            s.users[d.d.ke].mon[d.d.id].spawn=spawn('ffmpeg',s.ffmpeg('args',d.d));
            switch(d.d.type){
                case'jpeg':
                    d.d.captureOne=function(f){
                        s.users[d.d.ke].mon[d.d.id].record.request=request({url:d.d.url,method:'GET',encoding: null,timeout:3000},function(er,data){
                           ++d.d.frames; 
                            if(er){++d.d.error_count;
                            if(d.d.error_count>4){s.camera('stop',{id:d.d.id,ke:d.d.ke});return}
                                   d.d.captureOne();
                                   return;
                            }
                            s.users[d.d.ke].mon[d.d.id].spawn.stdin.write(data.body);
                            if(s.users[d.d.ke].mon[d.d.id].watch&&Object.keys(s.users[d.d.ke].mon[d.d.id].watch).length>0){
                                s.tx({f:'monitor_frame',ke:d.d.ke,id:d.d.id,time:s.moment(),frame:data.body.toString('base64'),frame_format:'b64'},'MON_'+d.d.id);
                            }
                            
                            s.users[d.d.ke].mon[d.d.id].record.capturing=setTimeout(function(){d.d.captureOne()},800);
                            clearTimeout(d.d.timeOut),d.d.timeOut=setTimeout(function(){d.d.error_count=0;},3000)
                        }).on('error', function(err){
                            if(s.users[d.d.ke].mon[d.d.id].record.request&&s.users[d.d.ke].mon[d.d.id].record.request.abort){s.users[d.d.ke].mon[d.d.id].record.request.abort();};
                            clearTimeout(s.users[d.d.ke].mon[d.d.id].record.capturing);
                            d.d.captureOne();
                        })
                  }
                  d.d.captureOne()
                break;
                case'mjpeg':
                    s.users[d.d.ke].mon[d.d.id].spawn.stdout.on('data',function(da){
                        s.tx({f:'monitor_frame',ke:d.d.ke,id:d.d.id,time:s.moment(),frame:da.toString('base64'),frame_format:'b64'},'MON_'+d.d.id);
                    });
                    s.users[d.d.ke].mon[d.d.id].spawn.stderr.on('data',function(err){
                        err=err.toString();console.log('SPAWN ERROR '+d.d.id,err);
                        d.d.chk=function(x){return err.indexOf(x)>-1;}
                        switch(true){
                            case d.d.chk('No such file or directory'):
                            case d.d.chk('Invalid data found when processing input'):
                                s.event('delete',d.d);d.d.fn();
                            break;
                            case d.d.chk('Immediate exit requested'):
                            case d.d.chk('timed out'):
                            case d.d.chk('reset by peer'):
                               if(d.d.frames===0){s.event('delete',d.d)};s.camera('stop',d.d);return;
                            break;
                        }
                    });
                break;
            }
        break;
        case'event':
            s.event(d.d[0],d.d[1]);
        break;
    }
});
io.on('disconnect',function(d){
    s.connected=false;
});