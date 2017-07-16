console.log('This translation tool uses Yandex.')
if(!process.argv[2]||!process.argv[3]||!process.argv[4]){
    console.log('You must input arguments.')
    console.log('# node translateLanguageFile.js <SOURCE> <FROM_LANGUAGE> <TO_LANGUAGE>')
    console.log('Example:')
    console.log('# node translateLanguageFile.js en_US en ar')
    return
}
var langDir='../languages/'
var fs=require('fs');
var https = require('https');
var jsonfile=require('jsonfile');
var source=require(langDir+process.argv[2]+'.json')
var complete=0;
var list = Object.keys(source)
console.log(list.length)
var newList={}
var newListAlphabetical={}
list.forEach(function(v,n){
    var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20160311T042953Z.341f2f63f38bdac6.c7e5c01fff7f57160141021ca61b60e36ff4d379&lang='+process.argv[3]+'-'+process.argv[4]+'&text='+source[v]
    https.request(url, function(data) {
        data.setEncoding('utf8');
        var chunks='';
        data.on('data', (chunk) => {
            chunks+=chunk;
        });
        data.on('end', () => {
            ++complete
            try{
                var translation=JSON.parse(chunks).text[0]
            }catch(err){
                var translation=source[v]
            }
            newList[v]=translation;
            if(list.length===complete){
                console.log('complete')
                Object.keys(newList).sort().forEach(function(y,t){
                    newListAlphabetical[y]=newList[y]
                })
                console.log(fs.statSync(langDir+process.argv[4]+'.json'))
                jsonfile.writeFile(langDir+process.argv[4]+'.json',newListAlphabetical,{spaces: 2},function(){

                })
            }
        });
    }).on('error', function(e) {
        console.log('ERROR : 500 '+v)
        res.sendStatus(500);
    }).end();
    console.log(n+','+v)
})
