process.on('uncaughtException', function (err) {
    console.error('uncaughtException',err);
});
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var moment = require('moment');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var config=require('./conf.json');
var sql=mysql.createConnection(config.db);

//set option defaults
s={lock:{}};
if(!config.cron)config.cron={};
if(!config.cron.deleteOld)config.cron.deleteOld=true;
if(!config.cron.deleteOrphans)config.cron.deleteOrphans=false;
if(!config.cron.deleteNoVideo)config.cron.deleteNoVideo=true;
if(!config.cron.deleteOverMax)config.cron.deleteOverMax=true;
if(!config.cron.deleteLogs)config.cron.deleteLogs=true;
if(!config.cron.deleteEvents)config.cron.deleteEvents=true;
if(!config.cron.interval)config.cron.interval=1;

if(!config.videosDir){config.videosDir=__dirname+'/videos/'}
s.dir={videos:config.videosDir};
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    return moment(e).format(x);
}
s.nameToTime=function(x){x=x.replace('.webm','').replace('.mp4','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
io = require('socket.io-client')('ws://localhost:'+config.port);//connect to master
s.cx=function(x){return io.emit('cron',x)}
//emulate master socket emitter
s.tx=function(x,y){s.cx({f:'s.tx',data:x,to:y})}
//Cron Job
s.cx({f:'init',time:moment()})

s.checkFilterRules=function(v){
    Object.keys(v.d.filters).forEach(function(m,b){
        b=v.d.filters[m];
        if(b.enabled==="1"){
            b.ar=[];
            b.sql=[];
            b.where.forEach(function(j,k){
                if(j.p1==='ke'){j.p3=v.ke}
                b.sql.push(j.p1+' '+j.p2+' ?')
                b.ar.push(j.p3)
            })
            b.sql='WHERE ('+b.sql.join(' AND ')+')';
            if(b.sort_by&&b.sort_by!==''){
                b.sql+=' ORDER BY `'+b.sort_by+'` '+b.sort_by_direction
            }
            if(b.limit&&b.limit!==''){
                b.sql+=' LIMIT '+b.limit
            }
            sql.query('SELECT * FROM Videos '+b.sql,b.ar,function(err,r){
//                                sql.query('SELECT * FROM Events '+b.sql,b.ar,function(err,rr){
                    b.cx={
                        f:'filters',
                        name:b.name,
                        videos:r,
//                                        events:rr,
                        time:moment(),
                        ke:v.ke,
                        id:b.id
                    };
                    if(b.archive==="1"){
                        s.cx({f:'filters',ff:'archive',videos:r,time:moment(),ke:v.ke,id:b.id});
                    }else{
                        if(b.delete==="1"){
                            s.cx({f:'filters',ff:'delete',videos:r,time:moment(),ke:v.ke,id:b.id});
                        }
                    }
                    if(b.email==="1"){
                        b.cx.ff='email';
                        b.cx.delete=b.delete;
                        b.cx.mail=v.mail;
                        b.cx.execute=b.execute;
                        b.cx.query=b.sql;
                        s.cx(b.cx);
                    }
                    if(b.execute&&b.execute!==""){
                        s.cx({f:'filters',ff:'execute',execute:b.execute,time:moment()});
                    }
//                                })
            })

        }
    })
}
s.checkForOrphanedFiles=function(v){
    if(config.cron.deleteOrphans===true){
        e={};
        sql.query('SELECT * FROM Monitors WHERE ke=?',[v.ke],function(arr,b) {
            b.forEach(function(mon,m){
                fs.readdir(s.dir.videos+mon.ke+'/'+mon.mid, function(err, items) {
                    e.query=[];
                    e.filesFound=[mon.ke,mon.mid];
                    if(items&&items.length>0){
                        items.forEach(function(v,n){
                            e.query.push('time=?')
                            e.filesFound.push(s.nameToTime(v))
                        })
                        sql.query('SELECT * FROM Videos WHERE ke=? AND mid=? AND ('+e.query.join(' OR ')+')',e.filesFound,function(arr,r) {
                            if(!r){r=[]};
                            e.foundSQLrows=[];
                            r.forEach(function(v,n){
                                v.index=e.filesFound.indexOf(s.moment(v.time,'YYYY-MM-DD HH:mm:ss'));
                                if(v.index>-1){
                                    delete(items[v.index-2]);
                                }
                            });
                            items.forEach(function(v,n){
                                if(v&&v!==null){
                                    exec('rm '+s.dir.videos+mon.ke+'/'+mon.mid+'/'+v);
                                }
                            })
                        })
                    }
                })
            });
        });
    }
}
s.updateUserUsedSpace=function(v){
    sql.query('SELECT details FROM Users WHERE ke=? AND uid=?',[v.ke,v.uid], function(arr,r) {
        r=r[0];
        r.details=JSON.parse(r.details);
        r.details.used_space=v.size;
        s.cx({f:'diskUsed',size:v.size,limit:v.d.size,ke:v.ke,uid:v.uid})
        sql.query('UPDATE Users SET details=? WHERE ke=? AND uid=?',[JSON.stringify(r.details),v.ke,v.uid])
    })
}
s.cron=function(){
    x={};
    s.cx({f:'start',time:moment()})
    sql.query('SELECT ke,uid,details,mail FROM Users WHERE details NOT LIKE \'%"sub"%\'', function(arr,r) {
        if(r&&r[0]){
            arr={};
            r.forEach(function(v){
                if(!arr[v.ke]){arr[v.ke]=0;}else{return false;}
                //set permissions
                v.d=JSON.parse(v.details);
                //size
                if(!v.d.size||v.d.size==''){v.d.size=10000}else{v.d.size=parseFloat(v.d.size)};
                //days to keep videos
                if(!v.d.days||v.d.days==''){v.d.days=5}else{v.d.days=parseFloat(v.d.days)};
                //purge logs
                if(!v.d.log_days||v.d.log_days==''){v.d.log_days=10}else{v.d.log_days=parseFloat(v.d.log_days)};
                if(config.cron.deleteLogs===true&&v.d.log_days!==0){
                    sql.query("DELETE FROM Logs WHERE ke=? AND `time` < DATE_SUB(NOW(), INTERVAL ? DAY)",[v.ke,v.d.log_days],function(err,rrr){
                        if(err)return console.log(err);
                        s.cx({f:'deleteLogs',msg:rrr.affectedRows+' SQL rows older than '+v.d.log_days+' days deleted',ke:v.ke,time:moment()})
                    })
                }
                //purge events
                if(!v.d.event_days||v.d.event_days==''){v.d.event_days=10}else{v.d.event_days=parseFloat(v.d.event_days)};
                if(config.cron.deleteEvents===true&&v.d.event_days!==0){
                    sql.query("DELETE FROM Events WHERE ke=? AND `time` < DATE_SUB(NOW(), INTERVAL ? DAY)",[v.ke,v.d.event_days],function(err,rrr){
                        if(err)return console.log(err);
                        s.cx({f:'deleteEvents',msg:rrr.affectedRows+' SQL rows older than '+v.d.event_days+' days deleted',ke:v.ke,time:moment()})
                    })
                }
                //filters
                if(!v.d.filters||v.d.filters==''){
                    v.d.filters={};
                }
                //delete old videos with filter
                if(config.deleteOld===true){
                    v.d.filters.deleteOldByCron={
                        "id":"deleteOldByCron",
                        "name":"deleteOldByCron",
                        "sort_by":"time",
                        "sort_by_direction":"ASC",
                        "limit":"",
                        "enabled":"0",
                        "archive":"0",
                        "email":"0",
                        "delete":"0",
                        "execute":"",
                        "where":[{
                            "p1":"end",
                            "p2":"<",
                            "p3":"DATE_SUB(NOW(), INTERVAL "+v.d.days+" DAY)",
                        }]
                    };
                }
                s.checkFilterRules(v);
                //purge SQL rows with no file
                v.fn=function(){
                    if(s.lock[v.ke]!==1){
                        s.lock[v.ke]=1;
                        es={};
                        v.size=0;
                        sql.query('SELECT * FROM Videos WHERE ke = ? AND status != 0 AND time < (NOW() - INTERVAL 10 MINUTE)',[v.ke],function(err,evs){
                            if(evs&&evs[0]){
                                es.del=[];es.ar=[v.ke];
                                evs.forEach(function(ev){
                                    v.size+=ev.size;
                                    ev.dir=s.dir.videos+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.'+ev.ext;
                                    if(config.cron.deleteNoVideo===true&&fs.existsSync(ev.dir)!==true){
                                        es.del.push('(mid=? AND time=?)');
                                        es.ar.push(ev.mid),es.ar.push(ev.time);
                                        exec('rm '+ev.dir);
                                        s.tx({f:'video_delete',filename:s.moment(ev.time)+'.'+ev.ext,mid:ev.mid,ke:ev.ke,time:ev.time,end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+ev.ke);
                                    }
                                });
                                if(config.cron.deleteNoVideo===true){
                                    es.count=es.del.length;
                                    if(es.del.length>0){
                                        es.del=es.del.join(' OR ');
                                        sql.query('DELETE FROM Videos WHERE ke =? AND ('+es.del+')',es.ar)
                                    }
                                    s.cx({f:'deleteNoVideo',msg:es.count+' SQL rows with no file deleted',ke:v.ke,time:moment()})
                                }
                            }
                            //delete files when over specified maximum
                            if(config.cron.deleteOverMax===true&&(v.size/1000000)>v.d.size){
                                sql.query('SELECT * FROM Videos WHERE status != 0 AND ke=? ORDER BY `time` ASC LIMIT 15',[v.ke],function(err,evs){
                                es.del=[];es.ar=[v.ke];
                                    evs.forEach(function(ev){
                                        ev.dir=s.dir.videos+v.ke+'/'+ev.mid+'/'+s.moment(ev.time)+'.'+ev.ext;
                                        es.del.push('(mid=? AND time=?)');
                                        es.ar.push(ev.mid),es.ar.push(ev.time);
                                        exec('rm '+ev.dir);
                                       s.tx({f:'video_delete',filename:s.moment(ev.time)+'.'+ev.ext,mid:ev.mid,ke:ev.ke,time:ev.time,end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+ev.ke);

                                    });
                                    if(es.del.length>0){
                                        es.qu=es.del.join(' OR ');
                                        sql.query('DELETE FROM Videos WHERE ke =? AND ('+es.qu+')',es.ar,function(){
                                            s.lock[v.ke]=0;
                                            setTimeout(function(){
                                                v.fn()
                                            },3000)
                                        })
                                        s.cx({f:'deleteOverMax',msg:es.del.length+' old videos deleted because over max of '+v.d.size+' MB',ke:v.ke,time:moment()})
                                    }else{
                                        s.lock[v.ke]=0;
                                        setTimeout(function(){
                                            s.checkForOrphanedFiles(v);
                                            s.updateUserUsedSpace(v);
                                        },3000)
                                    }
                                })
                            }else{
                                s.lock[v.ke]=0;
                                setTimeout(function(){
                                    s.checkForOrphanedFiles(v);
                                    s.updateUserUsedSpace(v);
                                },3000)
                            }
                        })
                    }
                };
                v.fn();
            })
        }
    })
    s.timeout=setTimeout(function(){
        s.cron();
    },parseFloat(config.cron.interval)*60000*60)
}
s.cron();

io.on('f',function(d){
    switch(d.f){
        case'start':case'restart':
            clearTimeout(s.timeout);
            s.cron();
        break;
        case'stop':
            clearTimeout(s.timeout);
        break;
    }
})


console.log('Shinobi : cron.js started')