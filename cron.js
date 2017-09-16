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
if(config.cron===undefined)config.cron={};
if(config.cron.deleteOld===undefined)config.cron.deleteOld=true;
if(config.cron.deleteOrphans===undefined)config.cron.deleteOrphans=false;
if(config.cron.deleteNoVideo===undefined)config.cron.deleteNoVideo=true;
if(config.cron.deleteOverMax===undefined)config.cron.deleteOverMax=true;
if(config.cron.deleteLogs===undefined)config.cron.deleteLogs=true;
if(config.cron.deleteEvents===undefined)config.cron.deleteEvents=true;
if(config.cron.interval===undefined)config.cron.interval=1;

if(!config.ip||config.ip===''||config.ip.indexOf('0.0.0.0')>-1)config.ip='localhost';
if(!config.videosDir)config.videosDir=__dirname+'/videos/';
if(!config.addStorage){config.addStorage=[]}
s.checkCorrectPathEnding=function(x){
    var length=x.length
    if(x.charAt(length-1)!=='/'){
        x=x+'/'
    }
    return x.replace('__DIR__',__dirname)
}
s.dir={
    videos:s.checkCorrectPathEnding(config.videosDir),
    addStorage:config.addStorage,
};
s.moment=function(e,x){
    if(!e){e=new Date};if(!x){x='YYYY-MM-DDTHH-mm-ss'};
    return moment(e).format(x);
}
s.nameToTime=function(x){x=x.replace('.webm','').replace('.mp4','').split('T'),x[1]=x[1].replace(/-/g,':');x=x.join(' ');return x;}
io = require('socket.io-client')('ws://'+config.ip+':'+config.port);//connect to master
s.cx=function(x){x.cronKey=config.cron.key;return io.emit('cron',x)}
//emulate master socket emitter
s.tx=function(x,y){s.cx({f:'s.tx',data:x,to:y})}
s.video=function(x,y){s.cx({f:'s.video',data:x,file:y})}
//Cron Job
s.cx({f:'init',time:moment()})
s.getVideoDirectory=function(e){
    if(e.mid&&!e.id){e.id=e.mid};
    if(e.details&&(e.details instanceof Object)===false){
        try{e.details=JSON.parse(e.details)}catch(err){}
    }
    if(e.details.dir&&e.details.dir!==''){
        return s.checkCorrectPathEnding(e.details.dir)+e.ke+'/'+e.id+'/'
    }else{
        return s.dir.videos+e.ke+'/'+e.id+'/';
    }
}
s.checkFilterRules=function(v){
    Object.keys(v.d.filters).forEach(function(m,b){
        b=v.d.filters[m];
        if(b.enabled==="1"){
            b.ar=[v.ke];
            b.sql=[];
            b.where.forEach(function(j,k){
                if(j.p1==='ke'){j.p3=v.ke}
                switch(j.p3_type){
                    case'function':
                        b.sql.push(j.p1+' '+j.p2+' '+j.p3)
                    break;
                    default:
                        b.sql.push(j.p1+' '+j.p2+' ?')
                        b.ar.push(j.p3)
                    break;
                }
            })
            b.sql='WHERE ke=? AND status != 0 AND ('+b.sql.join(' AND ')+')';
            if(b.sort_by&&b.sort_by!==''){
                b.sql+=' ORDER BY `'+b.sort_by+'` '+b.sort_by_direction
            }
            if(b.limit&&b.limit!==''){
                b.sql+=' LIMIT '+b.limit
            }
            sql.query('SELECT * FROM Videos '+b.sql,b.ar,function(err,r){
                 if(r&&r[0]){
                    b.cx={
                        f:'filters',
                        name:b.name,
                        videos:r,
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
                }
            })

        }
    })
}
s.checkForOrphanedFiles=function(v){
    if(config.cron.deleteOrphans===true){
        e={};
        sql.query('SELECT * FROM Monitors WHERE ke=?',[v.ke],function(arr,b) {
            b.forEach(function(mon,m){
                mon.dir=s.
                fs.readdir(s.getVideoDirectory(mon), function(err, items) {
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
                                    exec('rm '+s.getVideoDirectory(mon)+v);
                                }
                            })
                        })
                    }
                })
            });
        });
    }
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
                if(config.cron.deleteOld===true){
                    v.d.filters.deleteOldByCron={
                        "id":"deleteOldByCron",
                        "name":"deleteOldByCron",
                        "sort_by":"time",
                        "sort_by_direction":"ASC",
                        "limit":"",
                        "enabled":"1",
                        "archive":"0",
                        "email":"0",
                        "delete":"1",
                        "execute":"",
                        "where":[{
                            "p1":"end",
                            "p2":"<",
                            "p3":"NOW() - INTERVAL "+(v.d.days*24)+" HOUR",
                            "p3_type":"function",
                        }]
                    };
                }
                s.checkFilterRules(v);
                //purge SQL rows with no file
                v.fn=function(){
                    if(s.lock[v.ke]!==1){
                        s.lock[v.ke]=1;
                        es={};
                        sql.query('SELECT * FROM Videos WHERE ke = ? AND status != 0 AND time < (NOW() - INTERVAL 10 MINUTE)',[v.ke],function(err,evs){
                            if(evs&&evs[0]){
                                es.del=[];es.ar=[v.ke];
                                evs.forEach(function(ev){
                                    ev.dir=s.getVideoDirectory(ev)+s.moment(ev.time)+'.'+ev.ext;
                                    if(config.cron.deleteNoVideo===true&&fs.existsSync(ev.dir)!==true){
                                        s.video('delete',ev)
                                        es.del.push('(mid=? AND time=?)');
                                        es.ar.push(ev.mid),es.ar.push(ev.time);
                                        s.tx({f:'video_delete',filename:s.moment(ev.time)+'.'+ev.ext,mid:ev.mid,ke:ev.ke,time:ev.time,end:s.moment(new Date,'YYYY-MM-DD HH:mm:ss')},'GRP_'+ev.ke);
                                    }
                                });
                                if(config.cron.deleteNoVideo===true){
                                    s.cx({f:'deleteNoVideo',msg:es.del.length+' SQL rows with no file deleted',ke:v.ke,time:moment()})
                                }
                            }
                            //delete files when over specified maximum
                            s.lock[v.ke]=0;
                            setTimeout(function(){
                                s.checkForOrphanedFiles(v);
                            },3000)
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