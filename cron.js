var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
const del = require('del');
var db_config=JSON.parse(fs.readFileSync('conf.json','UTF8'));
var sql=mysql.createConnection(db_config);
s={dir:{events:__dirname+'/events/',frames:__dirname+'/frames/'}};
s.moment=function(e,x){if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};return moment(e).utcOffset('-0800').format(x)}
s.nameToTime=function(x){x=x.replace('.webm','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
//Cron Job
s.cron=function(){
    sql.query('SELECT ke,uid,details FROM Users', function(err,r) {
        if(r){
            r.forEach(function(v){
                //set permissions
                v.d=JSON.parse(v.details);
                if(!v.d.size){if(!v.d.super){v.d.size=10000}else{v.d.size=20000}};//in Megabytes
                if(!v.d.days){if(!v.d.super){v.d.days=3}else{v.d.days=15}};
                
                //check if event is in sql, if not delete it.
                sql.query('SELECT * FROM Monitors WHERE ke = ?',[v.ke],function(err,mons){
                    if(mons&&mons[0]){
                        mons.forEach(function(mon){
                            mon.files=[];mon.query=[];mon.ar=[v.ke];
                            console.log(s.dir.events+v.ke+'/'+mon.mid)
                            fs.readdir(s.dir.events+v.ke+'/'+mon.mid,function(err,files){
                                if(files&&files.length>0){
                                    files.forEach(function(file){
                                        if(file.indexOf('.webm')>-1){
                                            mon.query.push('time=?');
                                            mon.time=s.nameToTime(file),mon.ar.push(mon.time),mon.files.push(mon.time);
                                        }
                                    });
                                    mon.query=mon.query.join(' OR ');
                                    sql.query('SELECT * FROM Videos WHERE ke=? AND ('+mon.query+')',mon.ar,function(err,vids){
                                        if(vids&&vids[0]){
                                            vids.nodel=[];
                                            vids.n=0;
                                            mon.files.forEach(function(file){
                                                vids.forEach(function(vid){
                                                    if(s.nameToTime(file)===s.moment(vid.time)){vids.nodel.push(s.dir.events+v.ke+'/'+mon.mid+'/'+files[vids.n])}
                                                })
                                                ++vids.n;
                                            });
                                            vids.nodel.join('|');
                                            exec("ls -1 | grep -E -v '"+vids.nodel+"' | xargs rm -f")
                                        }
                                    })
                                }
                            })
                        })
                    }
                })
                
                //check for old events
                sql.query('SELECT * FROM Videos WHERE ke = ? AND end < DATE_SUB(NOW(), INTERVAL '+v.d.days+' DAY);',[v.ke],function(err,evs){
                    if(evs&&evs[0]){
                        evs.del=[];
                        evs.forEach(function(ev){
                            evs.del.push(s.dir.events+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.webm');
                        })
                        del(evs.del).then(paths => {
                            console.log('Deleted files and folders:\n', paths.join('\n'));
                        });
                    }
                    
                    //purge files with no SQL row and reverse
                    sql.query('SELECT * FROM Videos WHERE ke = ?;',[v.ke],function(err,evs){
                        if(evs&&evs[0]){
                            evs.del=[];evs.ar=[v.ke];
                            evs.forEach(function(ev){
                                ev.dir=s.dir.events+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.webm';
                                if(!fs.existsSync(ev.dir)){
                                    evs.del.push('(mid=? AND time=?)');
                                    evs.ar.push(ev.mid),evs.ar.push(ev.time);
                                }
                            })
                            if(evs.del.length>0){
                                evs.del=evs.del.join(' OR ');
                                sql.query('DELETE FROM Videos WHERE ke =? AND ('+evs.del+')',evs.ar)
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
},60000*60)//every hour
s.cron()