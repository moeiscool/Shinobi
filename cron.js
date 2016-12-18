var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
const del = require('del');
var db_config=JSON.parse(fs.readFileSync('conf.json','UTF8'));
var sql=mysql.createConnection(db_config);
s={dir:{events:__dirname+'/events/',frames:__dirname+'/frames/'}};
s.moment=function(e,x){if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};return moment(e).utcOffset('-0800').format(x)}
s.nameToTime=function(x){x=x.replace('.webm','').replace('.mp4','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
io = require('socket.io-client')('ws://66.51.132.100:80');//connect to master
s.cx=function(x){return io.emit('cron',x)}
//Cron Job
s.cx({f:'init',time:moment()})
s.cron=function(){
    x={};
    s.cx({f:'start',time:moment()})
    sql.query('SELECT ke,uid,details FROM Users', function(arr,r) {
        if(r&&r[0]){
            arr={};
            r.forEach(function(v){
                if(!arr[v.ke]){arr[v.ke]=0;}else{return false;}
                //set permissions
                v.d=JSON.parse(v.details);
                if(!v.d.size){if(!v.d.super){v.d.size=10000}else{v.d.size=20000}};//in Megabytes
                if(!v.d.days){if(!v.d.super){v.d.days=3}else{v.d.days=15}};
                //Orphaned Events : check if event is in sql, if not delete it.
//                sql.query('SELECT * FROM Monitors WHERE ke = ?',[v.ke],function(err,mons){
//                    if(mons&&mons[0]){
//                        mons.forEach(function(mon){
//                            mon.files=[];mon.query=[];mon.ar=[v.ke];
//                            fs.readdir(s.dir.events+v.ke+'/'+mon.mid,function(err,files){
//                                if(files&&files.length>0){
//                                    files.forEach(function(file){
//                                        if(file.indexOf('.webm')>-1||file.indexOf('.mp4')>-1){
//                                            mon.query.push('time=?');
//                                            mon.time=s.nameToTime(file),mon.ar.push(mon.time),mon.files.push(mon.time);
//                                        }
//                                    });
//                                    mon.query=mon.query.join(' OR ');
//                                    sql.query('SELECT * FROM Videos WHERE ke=? AND ('+mon.query+')',mon.ar,function(err,vids,n){
//                                        if(vids&&vids[0]){
//                                            err=[];
//                                            vids.n=0;
//                                            mon.files.forEach(function(file){
//                                                console.log(file)
//                                                vids.forEach(function(vid){
//                                                    if(s.moment(file)===s.moment(vid.time)){err.push(s.dir.events+v.ke+'/'+mon.mid+'/'+files[vids.n])}
//                                                })
//                                                ++vids.n;
//                                            });
//                                            n=0;
//                                            err.forEach(function(v){
//                                                console.log(v)
//                                                err[n]=s.dir.events+v.ke+'/'+mon.mid+'/'+v;
//                                                ++n;
//                                            });
//                                            err.join('|');
//                                            exec("ls -1 | grep -E -v '"+err+"' | xargs rm -f")
//                                            s.cx({f:'end',msg:err.length+' Orphaned Events Deleted',time:moment()})
//                                        }else{
//                                            s.cx({f:'end',msg:'No Videos',time:moment()})
//                                        }
//                                    })
//                                }
//                            })
//                        })
//                    }
//                })
                
                //check for old events
                sql.query('SELECT * FROM Videos WHERE ke = ? AND end < DATE_SUB(NOW(), INTERVAL '+v.d.days+' DAY);',[v.ke],function(err,evs,es){
                    if(evs&&evs[0]){
                        es.del=[];
                        es.ar=[v.ke];
                        es.qu=[];
                        evs.forEach(function(ev){
                            es.qu.push('(mid=? AND time=?)');es.ar.push(ev.mid),es.ar.push(ev.time);
                            es.del.push(s.dir.events+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.'+ev.ext);
                        })
                        if(es.del.length){
                            sql.query('DELETE FROM Videos WHERE ke =? AND ('+es.qu+')',es.ar)
                            del(es.del).then(paths => {
                                s.cx({f:'end',msg:es.del.length+' old events deleted',ke:v.ke,time:moment()})
                                console.log('Deleted files and folders:\n', paths.join('\n'));
                            });
                        }else{
                            s.cx({f:'end',msg:'0 old events deleted',time:moment()})
                        }
                    }
                    
                    //purge SQL rows with no file
                    sql.query('SELECT * FROM Videos WHERE ke = ?;',[v.ke],function(err,evs){
                        if(evs&&evs[0]){
                            es.del=[];es.ar=[v.ke];
                            evs.forEach(function(ev){
                                ev.dir=s.dir.events+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.'+ev.ext;
                                if(!fs.existsSync(ev.dir)){
                                    es.del.push('(mid=? AND time=?)');
                                    es.ar.push(ev.mid),es.ar.push(ev.time);
                                }
                            })
                            if(es.del.length>0){
                                s.cx({f:'end',msg:es.del.length+' SQL rows with no file deleted',ke:v.ke,time:moment()})
                                es.del=es.del.join(' OR ');
                                sql.query('DELETE FROM Videos WHERE ke =? AND ('+es.del+')',es.ar)
                            }else{
                                s.cx({f:'end',msg:'0 SQL rows with no file deleted',ke:v.ke,time:moment()})
                            }
                        }
                    })
                })
            })
        }
    })
}
setInterval(function(){
    s.cron();
},600000*60)//every hour
s.cron()