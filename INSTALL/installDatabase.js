var knex = require('knex');
if(config.databaseType===undefined){config.databaseType='mysql'}

var databaseOptions = {
  client: config.databaseType,
  connection: config.db,
}
if(databaseOptions.client.indexOf('sqlite')>-1){
    databaseOptions.client = 'sqlite3';
    databaseOptions.useNullAsDefault = true;
}
if(databaseOptions.client === 'sqlite3' && databaseOptions.connection.filename === undefined){
    databaseOptions.connection.filename = __dirname+"/shinobi.sqlite"
}
s.databaseEngine = knex(databaseOptions)
s.sqlQuery = function(query,values,onMoveOn,hideLog){
    if(!values){values=[]}
    if(typeof values === 'function'){
        var onMoveOn = values;
        var values = [];
    }
    if(!onMoveOn){onMoveOn=function(){}}
    return s.databaseEngine.raw(query,values)
        .asCallback(function(err,r){
            if(err&&config.databaseLogs){
                s.systemLog('s.sqlQuery QUERY',query)
                s.systemLog('s.sqlQuery ERROR',err)
            }
            if(onMoveOn)
                if(typeof onMoveOn === 'function'){
                    if(!r)r=[]
                    onMoveOn(err,r)
                }else{
                    console.log(onMoveOn)
                }
        })
}