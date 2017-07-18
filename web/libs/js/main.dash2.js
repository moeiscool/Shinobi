switch("<%-config.language%>"){
    case'ar'://Arabic
    case'bn'://Bengali
        $('body').addClass('right-to-left')
        $('.mdl-menu__item').each(function(n,v){
            v=$(v).find('i')
            v.appendTo(v.parent())
        })
    break;
}
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
$.ccio={fr:$('#files_recent'),mon:{}};
    $.ccio.log=function(x,y,z){
        if($.ccio.op().browserLog==="1"){
            if(!y){y=''};if(!z){z=''};
            console.log(x,y,z)
        }
    }
    $.ccio.gid=function(x){
        if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < x; i++ )
            t += p.charAt(Math.floor(Math.random() * p.length));
        return t;
    };
    $.ccio.init=function(x,d,z,k){
        if(!k){k={}};k.tmp='';
        switch(x){
            case'drawMatrices':
                d.height=d.stream.height()
                d.width=d.stream.width()
                if(d.monitorDetails.detector_scale_x===''){d.monitorDetails.detector_scale_x=320}
                if(d.monitorDetails.detector_scale_y===''){d.monitorDetails.detector_scale_y=240}

                d.widthRatio=d.width/d.monitorDetails.detector_scale_x
                d.heightRatio=d.height/d.monitorDetails.detector_scale_y

                d.streamObjects.find('.stream-detected-object[name="'+d.details.name+'"]').remove()
                d.tmp=''
                $.each(d.details.matrices,function(n,v){
                    d.tmp+='<div class="stream-detected-object" name="'+d.details.name+'" style="height:'+(d.heightRatio*v.height)+'px;width:'+(d.widthRatio*v.width)+'px;top:'+(d.heightRatio*v.y)+'px;left:'+(d.widthRatio*v.x)+'px;"></div>'
                })
                d.streamObjects.append(d.tmp)
            break;
            case'clearTimers':
                if(!d.mid){d.mid=d.id}
                clearTimeout($.ccio.mon[d.mid]._signal);
                clearInterval($.ccio.mon[d.mid].hlsGarbageCollectorTimer)
                clearTimeout($.ccio.mon[d.mid].jpegInterval);
                clearInterval($.ccio.mon[d.mid].signal);
                clearInterval($.ccio.mon[d.mid].m3uCheck);
            break;
            case'note':
                k.o=$.ccio.op().switches
                if(k.o&&k.o.notifyHide!==1){
                    new PNotify(d)
                }
            break;
            case'montage':
                k.dimensions=$.ccio.op().montage
                k.monitors=$('.monitor_item');
                $.each([1,2,3,4,5,'5ths',6,7,8,9,10,11,12],function(n,v){
                    k.monitors.removeClass('col-md-'+v)
                })
                if(!$('#monitors_live').hasClass('montage')){
                    k.dimensions='2'
                }else{
                    if(!k.dimensions){
                        k.dimensions='3'
                    }
                }
                switch((k.dimensions).toString()){
                    case'1':
                        k.class='12'
                    break;
                    case'2':
                        k.class='6'
                    break;
                    case'4':
                        k.class='3'
                    break;
                    case'5':
                        k.class='5ths'
                    break;
                    case'6':
                        k.class='2'
                    break;
                   default://3
                        k.class='4'
                    break;
                }
                k.class='col-md-'+k.class;
                k.monitors.addClass(k.class)
            break;
            case'monitorOrder':
                k.order = JSON.parse($user.details).monitorOrder;
                if(!k.order){
                    k.order=[];
                    $('#monitors_list .monitor_block').each(function(n,v){
                        v=$(v).attr('mid')
                        if(v){
                            k.order.push(v)
                        }
                    })
                }
                k.switches=$.ccio.op().switches
                k.lists = ['#monitors_list']
                if(k.switches&&k.switches.monitorOrder===1){
                    k.lists.push('#monitors_live')
                }
                if(d&&d.no&&d.no instanceof Array){
                    k.arr=[]
                    $.each(k.lists,function(n,v){
                        if(d.no.indexOf(v)===-1){
                            k.arr.push(v)
                        }
                    })
                    k.lists=k.arr;
                }
                $.each(k.lists,function(n,v){
                    v = $(v);
                    for(var i = 0, len = k.order.length; i < len; ++i) {
                        v.children('[mid=' + k.order[i] + ']').appendTo(v);
                    }
                    v.find('video').each(function(m,b){
                        b=$(b).parents('.monitor_item')
                        $.ccio.cx({f:'monitor',ff:'watch_on',id:b.attr('mid')});
                    })
                })
                return k.order
            break;
            case'monGroup':
                $.ccio.mon_groups={};
                $.each($.ccio.mon,function(n,v,x){
                    if(typeof v.details==='string'){
                        k.d=JSON.parse(v.details)
                    }else{
                        k.d=v.details
                    }
                    try{
                        k.groups=JSON.parse(k.d.groups)
                        $.each(k.groups,function(m,b){
                            if(!$.ccio.mon_groups[b])$.ccio.mon_groups[b]={}
                            $.ccio.mon_groups[b][v.mid]=v;
                        })
                    }catch(er){
                           
                    }
                })
                return $.ccio.mon_groups;
            break;
            case'jpegModeStop':
                clearTimeout($.ccio.mon[d.mid].jpegInterval);
                delete($.ccio.mon[d.mid].jpegInterval);
                $('#monitor_live_'+d.mid+' .stream-element').unbind('load')
            break;
            case'jpegMode':
                if(d.watch===1){
                    k=JSON.parse(d.details);
                    k.jpegInterval=parseFloat(k.jpegInterval);
                    if(!k.jpegInterval||k.jpegInterval===''||isNaN(k.jpegInterval)){k.jpegInterval=1}
                    $.ccio.tm('stream-element',$.ccio.mon[d.mid]);
                    k.e=$('#monitor_live_'+d.mid+' .stream-element');
                    $.ccio.init('jpegModeStop',d);
                    k.run=function(){
                        k.e.attr('src',$user.auth_token+'/jpeg/'+d.ke+'/'+d.mid+'/s.jpg?time='+(new Date()).getTime())
                    }
                    k.e.load(function(){
                        $.ccio.mon[d.mid].jpegInterval=setTimeout(k.run,1000/k.jpegInterval);
                    }).error(function(){
                        $.ccio.mon[d.mid].jpegInterval=setTimeout(k.run,1000/k.jpegInterval);
                    })
                    k.run()
                };
            break;
            case'jpegModeAll':
                $.each($.ccio.mon,function(n,v){
                    $.ccio.init('jpegMode',v)
                });
            break;
            case'dragWindows':
                k.e=$("#monitors_live");
                if(k.e.disableSelection){k.e.disableSelection()};
                k.e.sortable({
                  handle: ".mdl-card__supporting-text",
                  placeholder: "ui-state-highlight col-md-6"
                });
            break;
            case'getLocation':
                var l = document.createElement("a");
                l.href = d;
                return l;
            break;
            case'ArrayBuffertoB64':
                var reader = new FileReader();
                reader.addEventListener("loadend",function(d){return z(reader.result)});
                reader.readAsDataURL(new Blob([d], {                     
                    type: "image/jpeg"
                }));
            break;
            case 'ls'://livestamp all
                g={e:jQuery('.livestamp')};
                g.e.each(function(){g.v=jQuery(this),g.t=g.v.attr('title');if(!g.t){return};g.v.toggleClass('livestamp livestamped').attr('title',$.ccio.init('t',g.t)).livestamp(g.t);})
                return g.e
            break;
            case't'://format time
                if(!d){d=new Date();}
                return moment(d).format('YYYY-MM-DD HH:mm:ss')
            break;
            case'th'://format time hy
                if(!d){d=new Date();}
                return moment(d).format('YYYY-MM-DDTHH:mm:ss')
            break;
            case'tf'://time to filename
                if(!d){d=new Date();}
                return moment(d).format('YYYY-MM-DDTHH-mm-ss')
            break;
            case'fn'://row to filename
                return $.ccio.init('tf',d.time)+'.'+d.ext
            break;
            case'filters':
                k.tmp='<option value="" selected><%-lang['Add New']%></option>';
                $.each($user.filters,function(n,v){
                    k.tmp+='<option value="'+v.id+'">'+v.name+'</option>'
                });
                $('#saved_filters').html(k.tmp)
            break;
            case'id':
                $('.usermail').html(d.mail)
                try{k.d=JSON.parse(d.details);}catch(er){k.d=d.details}
                try{$user.mon_groups=JSON.parse(k.d.mon_groups);}catch(er){}
                if(!$user.mon_groups)$user.mon_groups={};
                $.sM.reDrawMonGroups()
                $.each($user,function(n,v){$.sM.e.find('[name="'+n+'"]').val(v).change()})
                $.each(k.d,function(n,v){$.sM.e.find('[detail="'+n+'"]').val(v).change()})
                $.gR.drawList();
            break;
            case'jsontoblock'://draw json as block
                if(d instanceof Object){
                    $.each(d,function(n,v){
                        k.tmp+='<div>';
                        k.tmp+='<b>'+n+'</b> : '+$.ccio.init('jsontoblock',v);
                        k.tmp+='</div>';
                    })
                }else{
                    k.tmp+='<span>';
                    k.tmp+=d;
                    k.tmp+='</span>';
                }
            break;
            case'url':
                if(d.port==80){d.porty=''}else{d.porty=':'+d.port}
                d.url=d.protocol+'://'+d.host+d.porty;return d.url;
            break;
            case'data-video':
                if(!d){
                    $('[data-mid]').each(function(n,v){
                        v=$(v);v.attr('mid',v.attr('data-mid'))
                    });
                    $('[data-ke]').each(function(n,v){
                        v=$(v);v.attr('ke',v.attr('data-ke'))
                    });
                    $('[data-file]').each(function(n,v){
                        v=$(v);v.attr('file',v.attr('data-file'))
                    });
                    $('[data-status]').each(function(n,v){
                        v=$(v);v.attr('status',v.attr('data-status'))
                    });
                }else{
                    $('[data-ke="'+d.ke+'"][data-mid="'+d.mid+'"][data-file="'+d.filename+'"]').attr('mid',d.mid).attr('ke',d.ke).attr('status',d.status).attr('file',d.filename);
                }
            break;
            case'signal':
                d.mon=$.ccio.mon[d.id];d.e=$('#monitor_live_'+d.id+' .signal').addClass('btn-success').removeClass('btn-danger');d.signal=parseFloat(JSON.parse(d.mon.details).signal_check);
                if(!d.signal||d.signal==NaN){d.signal=10;};d.signal=d.signal*1000*60;
                clearTimeout($.ccio.mon[d.id]._signal);$.ccio.mon[d.id]._signal=setTimeout(function(){d.e.addClass('btn-danger').removeClass('btn-success');},d.signal)
            break;
            case'signal-check':
                try{
                d.mon=$.ccio.mon[d.id];d.p=$('#monitor_live_'+d.id);
                    try{d.d=JSON.parse(d.mon.details)}catch(er){d.d=d.mon.details;}
                d.check={c:0};
                d.fn=function(){
                    if(!d.speed){d.speed=1000}
                    switch(d.d.stream_type){
                        case'b64':
                            d.p.resize()
                        break;
                        case'hls':
                            if(d.p.find('video')[0].paused){
                                if(d.d.signal_check_log==1){
                                    d.log={type:'Stream Check',msg:'<%-lang.clientStreamFailedattemptingReconnect%>'}
                                    $.ccio.tm(4,d,'#logs,.monitor_item[mid="'+d.id+'"][ke="'+d.ke+'"] .logs')
                                }
                                $.ccio.cx({f:'monitor',ff:'watch_on',id:d.id});
                            }else{
                                if(d.d.signal_check_log==1){
                                    d.log={type:'Stream Check',msg:'Success'}
                                    $.ccio.tm(4,d,'#logs,.monitor_item[mid="'+d.id+'"][ke="'+d.ke+'"] .logs')
                                }
                                $.ccio.init('signal',d);
                            }
                        break;
                        default:
                            if($.ccio.op().jpeg_on===true){return}
                            $.ccio.snapshot(d,function(e,url){
                                d.check.f=url;
                                setTimeout(function(){
                                    $.ccio.snapshot(d,function(e,url){
                                        if(d.check.f===url){
                                            if(d.check.c<3){
                                                ++d.check.c;
                                                setTimeout(function(){
                                                    d.fn();
                                                },d.speed)
                                            }else{
                                                if(d.d.signal_check_log==1){
                                                    d.log={type:'Stream Check',msg:'Client side ctream check failed, attempting reconnect.'}
                                                    $.ccio.tm(4,d,'#logs,.monitor_item[mid="'+d.id+'"][ke="'+d.ke+'"] .logs')
                                                }
                                                delete(d.check)
                                                $.ccio.cx({f:'monitor',ff:'watch_on',id:d.id});
                                            }
                                        }else{
                                            if(d.d.signal_check_log==1){
                                                d.log={type:'Stream Check',msg:'Success'}
                                                $.ccio.tm(4,d,'#logs,.monitor_item[mid="'+d.id+'"][ke="'+d.ke+'"] .logs')
                                            }
                                            delete(d.check)
                                            $.ccio.init('signal',d);
                                        }
                                    });
                                },d.speed)
                            });
                        break;
                    }
                }
                d.fn();
                }catch(er){
                    er=er.stack;
                    d.in=function(x){return er.indexOf(x)>-1}
                    switch(true){
                        case d.in("The HTMLImageElement provided is in the 'broken' state."):
                            delete(d.check)
                            $.ccio.cx({f:'monitor',ff:'watch_on',id:d.id});
                        break;
                        default:
                            $.ccio.log('signal-check',er)
                        break;
                    }
                    clearInterval($.ccio.mon[d.id].signal);delete($.ccio.mon[d.id].signal);
                }
            break;
        }
        return k.tmp;
    }
    $.ccio.snapshot=function(e,cb){
        var image_data;
        e.details=JSON.parse(e.mon.details);
        if(e.details.stream_scale_x===''){e.details.stream_scale_x=640}
        if(e.details.stream_scale_y===''){e.details.stream_scale_y=480}
        if($.ccio.op().jpeg_on!==true){
            switch(JSON.parse(e.mon.details).stream_type){
                case'hls':
                    $('#temp').html('<canvas></canvas>')
                    var c = $('#temp canvas')[0];
                    var img = e.p.find('video')[0];
                    c.width = img.videoWidth;
                    c.height = img.videoHeight;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(img, 0, 0,c.width,c.height);
                    image_data=atob(c.toDataURL('image/jpeg').split(',')[1]);
                break;
                case'mjpeg':
                    $('#temp').html('<canvas></canvas>')
                    var c = $('#temp canvas')[0];
                    var img = $('img',e.p.find('.stream-element').contents())[0];
                    c.width = e.details.stream_scale_x;
                    c.height = e.details.stream_scale_y;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(img, 0, 0,c.width,c.height);
                    image_data=atob(c.toDataURL('image/jpeg').split(',')[1]);
                break;
                case'b64':
                    image_data = atob(e.mon.last_frame.split(',')[1]);
                break;
            }
            var arraybuffer = new ArrayBuffer(image_data.length);
            var view = new Uint8Array(arraybuffer);
            for (var i=0; i<image_data.length; i++) {
                view[i] = image_data.charCodeAt(i) & 0xff;
            }
            try {
                var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
            } catch (e) {
                var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
                bb.append(arraybuffer);
                var blob = bb.getBlob('application/octet-stream');
            }
            var url = (window.URL || window.webkitURL).createObjectURL(blob);
        }else{
            url=e.p.find('.stream-element').attr('src');
        }
            cb(url,image_data);
        try{
            URL.revokeObjectURL(url)
        }catch(er){}
    }
    $.ccio.snapshotVideo=function(videoElement,cb){
        var image_data;
        var base64
        $('#temp').html('<canvas></canvas>')
        var c = $('#temp canvas')[0];
        var img = videoElement;
        c.width = img.videoWidth;
        c.height = img.videoHeight;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0,c.width,c.height);
        base64=c.toDataURL('image/jpeg')
        image_data=atob(base64.split(',')[1]);
        var arraybuffer = new ArrayBuffer(image_data.length);
        var view = new Uint8Array(arraybuffer);
        for (var i=0; i<image_data.length; i++) {
            view[i] = image_data.charCodeAt(i) & 0xff;
        }
        try {
            var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
        } catch (e) {
            var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
            bb.append(arraybuffer);
            var blob = bb.getBlob('application/octet-stream');
        }
        cb(base64,image_data);
    }
    $.ccio.tm=function(x,d,z,k){
        var tmp='';if(!d){d={}};if(!k){k={}};
        if(d.id&&!d.mid){d.mid=d.id;}
        switch(x){
            case 0://video
                if(!d.href&&d.hrefNoAuth){d.href='/'+$user.auth_token+d.hrefNoAuth}
                if(!d.filename){d.filename=$.ccio.init('tf',d.time)+'.'+d.ext;}
                d.dlname=d.mid+'-'+d.filename;
                d.mom=moment(d.time),
                d.hr=parseInt(d.mom.format('HH')),
                d.per=parseInt(d.hr/24*100);
                d.href='href="'+d.href+'?downloadName='+d.mid+'-'+d.filename+'"';
                d.circle='<div title="at '+d.hr+' hours of '+d.mom.format('MMMM DD')+'" '+d.href+' video="launch" class="progress-circle progress-'+d.per+'"><span>'+d.hr+'</span></div>'
                tmp+='<li class="glM'+d.mid+'" mid="'+d.mid+'" ke="'+d.ke+'" status="'+d.status+'" file="'+d.filename+'">'+d.circle+'<div><span title="'+d.end+'" class="livestamp"></span></div><div><div class="small"><b><%-lang.Start%></b> : '+moment(d.time).format('h:mm:ss , MMMM Do YYYY')+'</div><div class="small"><b><%-lang.End%></b> : '+moment(d.end).format('h:mm:ss , MMMM Do YYYY')+'</div></div><div><span class="pull-right">'+(parseInt(d.size)/1000000).toFixed(2)+'mb</span><div class="controls btn-group"><a class="btn btn-sm btn-primary" video="launch" '+d.href+'><i class="fa fa-play-circle"></i></a> <a download="'+d.dlname+'" '+d.href+' class="btn btn-sm btn-default"><i class="fa fa-download"></i></a>'
                <% if(config.DropboxAppKey){ %> tmp+='<a video="download" host="dropbox" download="'+d.dlname+'" '+d.href+' class="btn btn-sm btn-default"><i class="fa fa-dropbox"></i></a>' <% } %>
                tmp+='<a title="<%-lang['Delete Video']%>" video="delete" class="btn btn-sm btn-danger permission_video_delete"><i class="fa fa-trash"></i></a></div></div></li>';
            break;
            case 1://monitor icon
                d.src=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}));
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" title="'+d.mid+' : '+d.name+'" class="monitor_block glM'+d.mid+' col-md-4"><img monitor="watch" class="snapshot" src="'+d.src+'"><div class="box"><div class="title monitor_name truncate">'+d.name+'</div><div class="list-data"><div class="monitor_mid">'+d.mid+'</div><div><b><%-lang['Save as']%> :</b> <span class="monitor_ext">'+d.ext+'</span></div><div><b>Mode :</b> <span class="monitor_mode">'+d.mode+'</span></div></div><div class="icons btn-group"><a class="btn btn-xs btn-default permission_monitor_edit" monitor="edit"><i class="fa fa-wrench"></i></a> <a monitor="calendar" class="btn btn-xs btn-default"><i class="fa fa-calendar"></i></a> <a monitor="videos_table" class="btn btn-xs btn-default"><i class="fa fa-film"></i></a></div></div></div>';
                delete(d.src);
            break;
            case 2://monitor stream
                try{k.d=JSON.parse(d.details);}catch(er){k.d=d.details;}
                switch(d.mode){
                    case'idle':
                        k.mode='<%-lang['Idle']%>'
                    break;
                    case'stop':
                        k.mode='<%-lang['Disabled']%>'
                    break;
                    case'record':
                        k.mode='<%-lang['Record']%>'
                    break;
                    case'start':
                        k.mode='<%-lang['Watch Only']%>'
                    break;
                }
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" id="monitor_live_'+d.mid+'" mode="'+k.mode+'" class="monitor_item glM'+d.mid+' mdl-grid col-md-6">';
                tmp+='<div class="mdl-card mdl-cell mdl-cell--8-col">';
                tmp+='<div class="stream-block no-padding mdl-card__media mdl-color-text--grey-50">';
                tmp+='<div class="stream-objects"></div>';
                tmp+='<div class="stream-hud"><div class="lamp" title="'+k.mode+'"><i class="fa fa-eercast"></i></div><div class="controls"><span title="<%-lang['Currently viewing']%>" class="label label-default"><span class="viewers"></span></span> <a class="btn-xs btn-danger btn" monitor="mode" mode="record"><i class="fa fa-circle"></i> <%-lang['Start Recording']%></a> <a class="btn-xs btn-primary btn" monitor="mode" mode="start"><i class="fa fa-eye"></i> <%-lang['Set to Watch Only']%></a></div></div>';
                tmp+='</div>';
                tmp+='<div class="mdl-card__supporting-text text-center">';
                tmp+='<div class="indifference"><div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar"><span></span></div></div></div>';
                tmp+='<div class="monitor_name">'+d.name+'</div>';
                tmp+='<div class="btn-group"><a title="<%-lang.Snapshot%>" monitor="snapshot" class="btn btn-primary"><i class="fa fa-camera"></i></a> <a title="<%-lang['Show Logs']%>" class_toggle="show_logs" data-target=".monitor_item[mid=\''+d.mid+'\'][ke=\''+d.ke+'\']" class="btn btn-warning"><i class="fa fa-exclamation-triangle"></i></a> <a title="<%-lang.Control%>" monitor="control_toggle" class="btn btn-default"><i class="fa fa-arrows"></i></a> <a title="<%-lang['Status Indicator']%>" class="btn btn-danger signal" monitor="watch_on"><i class="fa fa-plug"></i></a> <a title="<%-lang.Calendar%>" monitor="calendar" class="btn btn-default"><i class="fa fa-calendar"></i></a> <a title="<%-lang['Power Viewer']%>" class="btn btn-default" monitor="powerview"><i class="fa fa-map-marker"></i></a> <a title="<%-lang['Time-lapse']%>" class="btn btn-default" monitor="timelapse"><i class="fa fa-angle-double-right"></i></a> <a title="<%-lang['Videos List']%>" monitor="videos_table" class="btn btn-default"><i class="fa fa-film"></i></a> <a title="<%-lang['Monitor Settings']%>" class="btn btn-default permission_monitor_edit" monitor="edit"><i class="fa fa-wrench"></i></a> <a title="<%-lang.Enlarge%>" monitor="bigify" class="hidden btn btn-default"><i class="fa fa-expand"></i></a> <a title="<%-lang.Fullscreen%>" monitor="fullscreen" class="btn btn-default"><i class="fa fa-arrows-alt"></i></a> <a title="<%-lang.Close%> Stream" monitor="watch_off" class="btn btn-danger"><i class="fa fa-times"></i></a></div>';
                tmp+='</div>';
                tmp+='</div>';
                tmp+='<div class="mdl-card mdl-cell mdl-cell--8-col mdl-cell--4-col-desktop">';
                tmp+='<div class="mdl-card__media">';
                tmp+='<div class="side-menu logs scrollable"></div>';
                tmp+='<div class="side-menu videos_monitor_list glM'+d.mid+' scrollable"><ul></ul></div>';
                tmp+='</div>';
                tmp+='<div class="mdl-card__supporting-text meta meta--fill mdl-color-text--grey-600">';
                tmp+='<span class="monitor_name">'+d.name+'</span>';
                tmp+='<b class="monitor_mode">'+k.mode+'</b>';
                tmp+='</div>';
                tmp+='</div>';
                tmp+='</div>';
            break;
            case 3://api key row
                tmp+='<tr api_key="'+d.code+'"><td class="code">'+d.code+'</td><td class="ip">'+d.ip+'</td><td class="time">'+d.time+'</td><td class="text-right"><a class="delete btn btn-xs btn-danger">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td></tr>';
            break;
            case 4://log row, draw to global and monitor
                if(!d.time){d.time=$.ccio.init('t')}
                tmp+='<li class="log-item">'
                tmp+='<span>'
                tmp+='<div>'+d.ke+' : <b>'+d.mid+'</b></div>'
                tmp+='<span>'+d.log.type+'</span> '
                tmp+='<b class="time livestamp" title="'+d.time+'"></b>'
                tmp+='</span>'
                tmp+='<div class="message">'
                tmp+=$.ccio.init('jsontoblock',d.log.msg);
                tmp+='</div>'
                tmp+='</li>';
                $(z).each(function(n,v){
                    v=$(v);
                    if(v.find('.log-item').length>10){v.find('.log-item:last').remove()}
                })
            break;
            case 6://notification row
                if(!d.time){d.time=$.ccio.init('t')}
                if(!d.note.class){d.note.class=''}
                tmp+='<li class="note-item '+d.note.class+'" ke="'+d.ke+'" mid="'+d.id+'">'
                tmp+='<span>'
                tmp+='<div>'+d.ke+' : <b>'+d.id+'</b></div>'
                tmp+='<span>'+d.note.type+'</span> '
                tmp+='<b class="time livestamp" title="'+d.time+'"></b>'
                tmp+='</span>'
                tmp+='<div class="message">'
                tmp+=d.note.msg
                tmp+='</div>'
                tmp+='</li>';
            break;
            case'option':
                tmp+='<option value="'+d.id+'">'+d.name+'</option>'
            break;
            case'stream-element':
                try{k.d=JSON.parse(d.details);}catch(er){k.d=d.details}
                if($.ccio.mon[d.mid]&&$.ccio.mon[d.mid].previousStreamType===k.d.stream_type){
                    return;
                }
                k.e=$('#monitor_live_'+d.mid+' .stream-block');
                k.e.find('.stream-element').remove();
                if($.ccio.op().jpeg_on===true){
                    tmp+='<img class="stream-element">';
                }else{
                    switch(k.d.stream_type){
                        case'hls':
                            tmp+='<video class="stream-element" autoplay></video>';
                        break;
                        case'mjpeg':
                            tmp+='<iframe class="stream-element"></iframe>';
                        break;
                        case'jpeg'://base64
                            tmp+='<img class="stream-element">';
                        break;
                        default://base64
                            tmp+='<canvas class="stream-element"></canvas>';
                        break;
                    }
                }
                k.e.append(tmp).find('.stream-element').resize();
            break;
            case'user-row':
                d.e=$('.user-row[uid="'+d.uid+'"][ke="'+d.ke+'"]')
                if(d.e.length===0){
                    tmp+='<li class="user-row" uid="'+d.uid+'" ke="'+d.ke+'">';
                    tmp+='<span><div><span class="mail">'+d.mail+'</span> : <b class="uid">'+d.uid+'</b></div><span>Logged in</span> <b class="time livestamped" title="'+d.logged_in_at+'"></b></span>';
                    tmp+='</li>';
                }else{
                    d.e.find('.mail').text(d.mail)
                    d.e.find('.time').livestamp('destroy').toggleClass('livestamped livestamp').text(d.logged_in_at)
                }
                $.ccio.init('ls')
            break;
            case'filters-where':
                if(!d)d={};
                d.id=$('#filters_where .row').length;
                if(!d.p1){d.p1='mid'}
                if(!d.p2){d.p2='='}
                if(!d.p3){d.p3=''}
                tmp+='<div class="row where-row">';
                tmp+='   <div class="form-group col-md-4">';
                tmp+='       <label>';
                tmp+='           <select class="form-control" where="p1">';
                tmp+='               <option value="mid" selected><%-lang['Monitor ID']%></option>';
                tmp+='               <option value="ext"><%-lang['File Type']%></option>';
                tmp+='               <option value="time"><%-lang['Start Time']%></option>';
                tmp+='               <option value="end"><%-lang['End Time']%></option>';
                tmp+='               <option value="size"><%-lang['Filesize']%></option>';
                tmp+='               <option value="status"><%-lang['Video Status']%></option>';
                tmp+='           </select>';
                tmp+='       </label>';
                tmp+='   </div>';
                tmp+='   <div class="form-group col-md-4">';
                tmp+='       <label>';
                tmp+='           <select class="form-control" where="p2">';
                tmp+='               <option value="=" selected><%-lang['Equal to']%></option>';
                tmp+='               <option value="!="><%-lang['Not Equal to']%></option>';
                tmp+='               <option value=">="><%-lang['Greater Than or Equal to']%></option>';
                tmp+='               <option value=">"><%-lang['Greater Than']%></option>';
                tmp+='               <option value="<"><%-lang['Less Than']%></option>';
                tmp+='               <option value="<="><%-lang['Less Than or Equal to']%></option>';
                tmp+='               <option value="LIKE"><%-lang['Like']%></option>';
                tmp+='               <option value="=~"><%-lang['Matches']%></option>';
                tmp+='               <option value="!~"><%-lang['Not Matches']%></option>';
                tmp+='               <option value="=[]"><%-lang['In']%></option>';
                tmp+='               <option value="![]"><%-lang['Not In']%></option>';
                tmp+='           </select>';
                tmp+='       </label>';
                tmp+='   </div>';
                tmp+='   <div class="form-group col-md-4">';
                tmp+='       <label>';
                tmp+='           <input class="form-control" placeholder="Value" title="<%-lang.Value%>" where="p3">';
                tmp+='       </label>';
                tmp+='   </div>';
                tmp+='</div>';
            break;
        }
        if(z){
            $(z).prepend(tmp)
        }
        switch(x){
            case 0:case 4:
                $.ccio.init('ls');
            break;
            case 2:
                k.e=$('#monitor_live_'+d.mid);
                try{
                    if(JSON.parse(d.details).control=="1"){
                        k.e.find('[monitor="control_toggle"]').show()
                    }else{
                        k.e.find('.pad').remove();
                        k.e.find('[monitor="control_toggle"]').hide()
                    }
                    $.ccio.tm('stream-element',d)
                }catch(re){$.ccio.log(re)}
            break;
            case'filters-where':
                $('#filters_where').append(tmp);
                $('#filters_where .row:last [where="p1"]').val(d.p1)
                $('#filters_where .row:last [where="p2"]').val(d.p2)
                $('#filters_where .row:last [where="p3"]').val(d.p3)
            break;
        }
        return tmp;
    }
    $.ccio.pm=function(x,d,z,k){
        var tmp='';if(!d){d={}};
        switch(x){
            case 0:
                d.mon=$.ccio.mon[d.mid];
                d.ev='.glM'+d.mid+'.videos_list ul,.glM'+d.mid+'.videos_monitor_list ul';d.fr=$.ccio.fr.find(d.ev),d.tmp='';
                if(d.fr.length===0){$.ccio.fr.append('<div class="videos_list glM'+d.mid+'"><h3 class="title">'+d.mon.name+'</h3><ul></ul></div>')}
                if(d.videos&&d.videos.length>0){
                $.each(d.videos,function(n,v){
                    if(v.status!==0){
                        tmp+=$.ccio.tm(0,v)
                    }
                })
                }else{
                    $('.glM'+d.mid+'.videos_list,.glM'+d.mid+'.videos_monitor_list').appendTo($.ccio.fr)
                    tmp+='<li class="notice novideos">No videos</li>';
                }
                $(d.ev).html(tmp);
                $.ccio.init('ls');
            break;
            case 3:
                z='#api_list';
                $(z).empty();
                $.each(d,function(n,v){
                    tmp+=$.ccio.tm(3,v);
                })
            break;
            case'option':
                $.each(d,function(n,v){
                    tmp+=$.ccio.tm('option',v);
                })
            break;
            case'user-row':
                $.each(d,function(n,v){
                    tmp+=$.ccio.tm('user-row',v);
                })
                z='#users_online'
            break;
        }
        if(z){
            $(z).prepend(tmp)
        }
        return tmp;
    }
    $.ccio.op=function(r,rr,rrr){
        if(!rrr){rrr={};};if(typeof rrr === 'string'){rrr={n:rrr}};if(!rrr.n){rrr.n='ShinobiOptions_'+location.host}
        ii={o:localStorage.getItem(rrr.n)};try{ii.o=JSON.parse(ii.o)}catch(e){ii.o={}}
        if(!ii.o){ii.o={}}
        if(r&&rr&&!rrr.x){
            ii.o[r]=rr;
        }
        switch(rrr.x){
            case 0:
                delete(ii.o[r])
            break;
            case 1:
                delete(ii.o[r][rr])
            break;
        }
        localStorage.setItem(rrr.n,JSON.stringify(ii.o))
        return ii.o
    }
$.ccio.ws=io(location.origin);
$.ccio.ws.on('connect',function (d){
    $(document).ready(function(e){
        $.ccio.init('id',$user);
        $.ccio.cx({f:'init',ke:$user.ke,auth:$user.auth_token,uid:$user.uid})
    })
})
PNotify.prototype.options.styling = "fontawesome";
$.ccio.ws.on('ping', function(d){
    $.ccio.ws.emit('pong',{beat:1});
});
$.ccio.ws.on('f',function (d){
    if(d.f!=='monitor_frame'&&d.f!=='os'&&d.f!=='video_delete'&&d.f!=='detector_trigger'&&d.f!=='detector_record_timeout_start'&&d.f!=='log'){$.ccio.log(d);}
    if(d.viewers){
        $('#monitor_live_'+d.id+' .viewers').html(d.viewers);
    }
    switch(d.f){
        case'api_key_deleted':
            $.ccio.init('note',{title:'<%-lang['API Key Deleted']%>',text:'<%-lang.APIKeyDeletedText%>',type:'notice'});
            $('[api_key="'+d.form.code+'"]').remove();
        break;
        case'api_key_added':
            $.ccio.init('note',{title:'<%-lang['API Key Added']%>',text:'<%-lang.FiltersUpdatedText%>',type:'success'});
            $.ccio.tm(3,d.form,'#api_list')
        break;
        case'filters_change':
            $.ccio.init('note',{title:'<%-lang['Filters Updated']%>',text:'<%-lang.FiltersUpdatedText%>',type:'success'});
            $user.filters=d.filters;
            $.ccio.init('filters');
        break;
        case'user_settings_change':
            $.ccio.init('note',{title:'<%-lang['Settings Changed']%>',text:'<%-lang.SettingsChangedText%>',type:'success'});
            $.ccio.init('id',d.form);
            $('#custom_css').append(d.form.details.css)
        break;
        case'users_online':
            $.ccio.pm('user-row',d.users);
        break;
        case'user_status_change':
            if(d.status===1){
                $.ccio.tm('user-row',d.user)
            }else{
                $('.user-row[uid="'+d.uid+'"][ke="'+d.ke+'"]').remove()
            }
        break;
        case'ffprobe_stop':
            $.pB.e.find('._loading').hide()
            $.pB.o.append('<div><b>END</b></div>');
            $.pB.e.find('.stop').hide();
            $.pB.e.find('[type="submit"]').show();
        break;
        case'ffprobe_start':
            $.pB.e.find('._loading').show()
            $.pB.o.empty();
            $.pB.e.find('.stop').show();
            $.pB.e.find('[type="submit"]').hide();
        break;
        case'ffprobe_data':
            $.pB.results=JSON.parse(d.data)
            $.pB.o.append($.ccio.init('jsontoblock',$.pB.results))
        break;
        case'detector_trigger':
            d.e=$('.monitor_item[ke="'+d.ke+'"][mid="'+d.id+'"]')
            if($.ccio.mon[d.id]&&d.e.length>0){
                if(d.details.plates&&d.details.plates.length>0){
                    console.log('licensePlateStream',d.id,d)
                }
                if(d.details.matrices&&d.details.matrices.length>0){
                    d.monitorDetails=JSON.parse($.ccio.mon[d.id].details)
                    d.stream=d.e.find('.stream-element')
                    d.streamObjects=d.e.find('.stream-objects')
                    $.ccio.init('drawMatrices',d)
                }
                if(d.details.confidence){
                    d.e.addClass('detector_triggered')
                    clearTimeout($.ccio.mon[d.id].detector_trigger_timeout);
                    $.ccio.mon[d.id].detector_trigger_timeout=setTimeout(function(){
                        $('.monitor_item[ke="'+d.ke+'"][mid="'+d.id+'"]').removeClass('detector_triggered').find('.stream-detected-object').remove()
                    },5000);
                    d.e.find('.indifference .progress-bar').css('width',d.details.confidence).find('span').text(d.details.confidence)
                }
            }
        break;
        case'detector_cascade_list':
            d.tmp=''
            $.each(d.cascades,function(n,v){
                d.tmp+='<li class="mdl-list__item">';
                d.tmp+='<span class="mdl-list__item-primary-content">';
                d.tmp+=v;
                d.tmp+='</span>';
                d.tmp+='<span class="mdl-list__item-secondary-action">';
                d.tmp+='<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect">';
                d.tmp+='<input type="checkbox" value="'+v+'" detailContainer="detector_cascades" detailObject="'+v+'" class="detector_cascade_selection mdl-switch__input"/>';
                d.tmp+='</label>';
                d.tmp+='</span>';
                d.tmp+='</li>';
            })
            $('#detector_cascade_list').html(d.tmp)
            componentHandler.upgradeAllRegistered()
            //add auto select for preferences
            d.currentlyEditing=$.aM.e.attr('mid')
            if(d.currentlyEditing&&d.currentlyEditing!==''){
                d.currentlyEditing=JSON.parse(JSON.parse($.ccio.mon[d.currentlyEditing].details).detector_cascades)
                console.log(d.currentlyEditing)
                $.each(d.currentlyEditing,function(m,b){
                    d.e=$('.detector_cascade_selection[value="'+m+'"]').prop('checked',true)
                    d.p=d.e.parents('.mdl-js-switch')
                    if(d.p.length>0){
                        d.p.addClass('is-checked')
                    }
                })
            }
        break;
        case'detector_plugged':
            if(!d.notice){d.notice=''}
            $('.shinobi-detector').show()
            $('.shinobi-detector-msg').html(d.notice)
            $('.shinobi-detector_name').text(d.plug)
            $('.shinobi-detector-'+d.plug).show()
            $('.shinobi-detector-invert').hide()
        break;
        case'detector_unplugged':
            $('.stream-objects').empty()
            $('.shinobi-detector').hide()
            $('.shinobi-detector-msg').empty()
            $('.shinobi-detector_name').empty()
            $('.shinobi-detector_plug').hide()
            $('.shinobi-detector-invert').show()
        break;
        case'log':
            $.ccio.tm(4,d,'#logs,.monitor_item[mid="'+d.mid+'"][ke="'+d.ke+'"] .logs')
        break;
        case'os'://indicator
            //cpu
            d.cpu=parseFloat(d.cpu).toFixed(0)+'%';
            $('.cpu_load .progress-bar').css('width',d.cpu);
            $('.cpu_load .percent').html(d.cpu);
            //ram
            d.ram=(100-parseFloat(d.ram)).toFixed(0)+'%';
            $('.ram_load .progress-bar').css('width',d.ram);
            $('.ram_load .percent').html(d.ram);
        break;
        case'diskUsed':
            if(!d.limit||d.limit===''){d.limit=10000}
            d.percent=parseInt((d.size/d.limit)*100)+'%';
            d.human=parseFloat(d.size)
            if(d.human>1000){d.human=(d.human/1000).toFixed(2)+' GB'}else{d.human=d.human.toFixed(2)+' MB'}
            $('.diskUsed .value').html(d.human)
            $('.diskUsed .percent').html(d.percent)
            $('.diskUsed .progress-bar').css('width',d.percent)
        break;
        case'init_success':
            $('#monitors_list').empty();
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}};
            $.getJSON('/'+$user.auth_token+'/monitor/'+$user.ke,function(f,g){
                g=function(n,v){
                    $.ccio.mon[v.mid]=v;
                    $.ccio.tm(1,v,'#monitors_list')
                    if(d.o[v.ke]&&d.o[v.ke][v.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})}
                }
                if(f.mid){
                    g(null,f)
                }else{
                    $.each(f,g);
                }
                if($.ccio.op().jpeg_on===true){
                    $.ccio.cx({f:'monitor',ff:'jpeg_on'})
                }
                $.gR.drawList();
                setTimeout(function(){$.ccio.init('monitorOrder')},300)
            })
            $.ccio.pm(3,d.apis);
            $('.os_platform').html(d.os.platform)
            $('.os_cpuCount').html(d.os.cpuCount)
            $('.os_totalmem').html((d.os.totalmem/1000000).toFixed(2))
            if(d.os.cpuCount>1){
                $('.os_cpuCount_trailer').html('s')
            }
        break;
        case'get_videos':
            $.ccio.pm(0,d)
        break;
         case'video_fix_success':case'video_fix_start':
            switch(d.f){
                case'video_fix_success':
                    d.addClass='fa-wrench'
                    d.removeClass='fa-pulse fa-spinner'
                break;
                case'video_fix_start':
                    d.removeClass='fa-wrench'
                    d.addClass='fa-pulse fa-spinner'
                break;
            }
            $('[mid="'+d.mid+'"][ke="'+d.ke+'"][file="'+d.filename+'"] [video="fix"] i,[data-mid="'+d.mid+'"][data-ke="'+d.ke+'"][data-file="'+d.filename+'"] [video="fix"] i').addClass(d.addClass).removeClass(d.removeClass)
        break;
        case'video_edit':case'video_archive':
            $.ccio.init('data-video',d)
            d.e=$('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]');
            d.e.attr('status',d.status),d.e.attr('data-status',d.status);
        break;
        case'video_delete':
            if($('.modal[mid="'+d.mid+'"]').length>0){$('#video_viewer[mid="'+d.mid+'"]').attr('file',null).attr('ke',null).attr('mid',null).modal('hide')}
            $('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]').remove();
            $('[data-file="'+d.filename+'"][data-mid="'+d.mid+'"][data-ke="'+d.ke+'"]').remove();
            if($.pwrvid.currentDataObject&&$.pwrvid.currentDataObject[d.filename]){
                delete($.timelapse.currentVideos[$.pwrvid.currentDataObject[d.filename].position])
                $.pwrvid.drawTimeline(false)
            }
            if($.timelapse.currentVideos&&$.timelapse.currentVideos[d.filename]){
                delete($.timelapse.currentVideosArray.videos[$.timelapse.currentVideos[d.filename].position])
                $.timelapse.drawTimeline(false)
            }
        break;
        case'video_build_success':
            if(!d.mid){d.mid=d.id;};d.status=1;
            d.e='.glM'+d.mid+'.videos_list ul,.glM'+d.mid+'.videos_monitor_list ul';$(d.e).find('.notice.novideos').remove();
            $.ccio.tm(0,d,d.e)
        break;
//        case'monitor_stopping':
//            $.ccio.init('note',{title:'Monitor Stopping',text:'Monitor <b>'+d.mid+'</b> is now off.',type:'notice'});
//        break;
        case'monitor_starting':
//            switch(d.mode){case'start':d.mode='Watch';break;case'record':d.mode='Record';break;}
//            $.ccio.init('note',{title:'Monitor Starting',text:'Monitor <b>'+d.mid+'</b> is now running in mode <b>'+d.mode+'</b>',type:'success'});
            d.e=$('#monitor_live_'+d.mid)
            if(d.e.length>0){$.ccio.cx({f:'monitor',ff:'watch_on',id:d.mid})}
        break;
        case'monitor_snapshot':
            switch(d.snapshot_format){
                case'plc':
                    $('[mid="'+d.mid+'"] .snapshot').attr('src',placeholder.getData(placeholder.plcimg(d.snapshot)))
                break;
                case'ab':
                    d.reader = new FileReader();
                    d.reader.addEventListener("loadend",function(){$('[mid="'+d.mid+'"] .snapshot').attr('src',d.reader.result)});
                    d.reader.readAsDataURL(new Blob([d.snapshot],{type:"image/jpeg"}));
                break;
                case'b64':
                    $('[mid="'+d.mid+'"][ke="'+d.ke+'"] .snapshot').attr('src','data:image/jpeg;base64,'+d.snapshot)
                break;
            }
        break;
        case'monitor_delete':
            $('[mid="'+d.mid+'"][ke="'+d.ke+'"]:not(.modal)').remove();
            $.ccio.init('clearTimers',d)
            delete($.ccio.mon[d.mid]);
        break;
        case'monitor_edit_failed':
            d.pnote={title:'Monitor Not Saved',text:'<b>'+d.mon.name+'</b> <small>'+d.mon.mid+'</small> has not been saved.',type:'error'}
            switch(d.ff){
                case'max_reached':
                    d.pnote.text+=' <%-lang.monitorEditFailedMaxReached%>'
                break;
            }
            $.ccio.init('note',d.pnote);
        break;
        case'monitor_edit':
            $.ccio.init('clearTimers',d)
            d.e=$('[mid="'+d.mon.mid+'"][ke="'+d.mon.ke+'"]');
            d.e=$('#monitor_live_'+d.mid);
            d.e.find('.stream-detected-object').remove()
            if(d.mon.details.control=="1"){d.e.find('[monitor="control_toggle"]').show()}else{d.e.find('.pad').remove();d.e.find('[monitor="control_toggle"]').hide()}
            
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}}
            if(d.mon.details.cords instanceof Object){d.mon.details.cords=JSON.stringify(d.mon.details.cords);}
            d.mon.details=JSON.stringify(d.mon.details);
            if(!$.ccio.mon[d.mid]){$.ccio.mon[d.mid]={}}
            $.ccio.init('jpegModeStop',d);
            $.ccio.mon[d.mid].previousStreamType=d.mon.details.stream_type
            $.each(d.mon,function(n,v){
                $.ccio.mon[d.mid][n]=v;
            });
            if(d.new===true){$.ccio.tm(1,d.mon,'#monitors_list')}
            switch(d.mon.mode){
                case'start':case'record':
                    if(d.o[d.ke]&&d.o[d.ke][d.mid]===1){
                        $.ccio.cx({f:'monitor',ff:'watch_on',id:d.mid})
                    }
                break;
            }
            d.e=$('.glM'+d.mon.mid);
            d.e.find('.monitor_name').text(d.mon.name)
            d.e.find('.monitor_mid').text(d.mon.mid)
            d.e.find('.monitor_ext').text(d.mon.ext);
                switch(d.mon.mode){
                    case'idle':
                        d.mode='Idle'
                    break;
                    case'stop':
                        d.mode='Disabled'
                    break;
                    case'record':
                        d.mode='Record'
                    break;
                    case'start':
                        d.mode='Watch Only'
                    break;
                }
            d.e.find('.monitor_mode').text(d.mode)
            d.e.attr('mode',d.mode)
            d.e.find('.lamp').attr('title',d.mode)
            $.gR.drawList();
            $.ccio.init('note',{title:'Monitor Saved',text:'<b>'+d.mon.name+'</b> <small>'+d.mon.mid+'</small> has been saved.',type:'success'});
        break;
        case'mode_jpeg_off':
            $.ccio.op('jpeg_on',"0");
            $.each($.ccio.mon,function(n,v,x){
                $.ccio.init('jpegModeStop',v);
                if(v.watch===1){
                    $.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})
                }
            });
            $('body').removeClass('jpegMode')
        break;
        case'mode_jpeg_on':
            $.ccio.op('jpeg_on',true);
            $.ccio.init('jpegModeAll');
            $('body').addClass('jpegMode')
        break;
        case'monitor_watch_off':case'monitor_stopping':
            d.o=$.ccio.op().watch_on;if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=0;$.ccio.op('watch_on',d.o);
            if($.ccio.mon[d.id]){
                $.ccio.init('jpegModeStop',{mid:d.id});
                $.ccio.init('clearTimers',d)
                clearInterval($.ccio.mon[d.id].signal);delete($.ccio.mon[d.id].signal);
                $.ccio.mon[d.id].watch=0;
                if($.ccio.mon[d.id].hls){$.ccio.mon[d.id].hls.destroy()}
                $('#monitor_live_'+d.id).remove();
            }
        break;
        case'monitor_watch_on':
            d.o=$.ccio.op().watch_on;if(!d.o){d.o={}};if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=1;$.ccio.op('watch_on',d.o);
            $.ccio.mon[d.id].watch=1;
            d.e=$('#monitor_live_'+d.id);
            d.e.find('.stream-detected-object').remove()
            $.ccio.init('clearTimers',d)
            if(d.e.length==0){
                $.ccio.tm(2,$.ccio.mon[d.id],'#monitors_live');
                $.ccio.init('dragWindows')
            }
            d.d=JSON.parse($.ccio.mon[d.id].details);
            $.ccio.tm('stream-element',$.ccio.mon[d.id]);
            if($.ccio.op().jpeg_on===true){
                $.ccio.init('jpegMode',$.ccio.mon[d.id]);
            }else{
                switch(d.d.stream_type){
                    case'jpeg':
                        $.ccio.init('jpegMode',$.ccio.mon[d.id]);
                    break;
                    case'hls':
                        d.fn=function(){
                            clearTimeout($.ccio.mon[d.id].m3uCheck)
                            d.url=$user.auth_token+'/hls/'+d.ke+'/'+d.id+'/s.m3u8';
                            $.get(d.url,function(m3u){
                                if(m3u=='File Not Found'){
                                    $.ccio.mon[d.id].m3uCheck=setTimeout(function(){
                                        d.fn()
                                    },2000)
                                }else{
                                    var video = $('#monitor_live_'+d.id+' .stream-element')[0];
                                    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)||(navigator.userAgent.match(/(Safari)/)&&!navigator.userAgent.match('Chrome'))) {
                                        video.src=d.url;
                                        if (video.paused) {
                                            video.play();
                                        }
                                    }else{
                                        $.ccio.mon[d.id].hlsGarbageCollector=function(){
                                            if($.ccio.mon[d.id].hls){$.ccio.mon[d.id].hls.destroy();URL.revokeObjectURL(video.src)}
                                            $.ccio.mon[d.id].hls = new Hls();
                                            $.ccio.mon[d.id].hls.loadSource(d.url);
                                            $.ccio.mon[d.id].hls.attachMedia(video);
                                            $.ccio.mon[d.id].hls.on(Hls.Events.MANIFEST_PARSED,function() {
                                                if (video.paused) {
                                                    video.play();
                                                }
                                            });
                                        }
                                        $.ccio.mon[d.id].hlsGarbageCollector()
                                        $.ccio.mon[d.id].hlsGarbageCollectorTimer=setInterval($.ccio.mon[d.id].hlsGarbageCollector,1000*60*20)
                                    }
                                }
                            })
                        }
                        d.fn()
                    break;
                    case'mjpeg':
                        $('#monitor_live_'+d.id+' .stream-element').attr('src',$user.auth_token+'/mjpeg/'+d.ke+'/'+d.id+'/full')
                    break;
                }
            }
            d.signal=parseFloat(d.d.signal_check);
            if(!d.signal||d.signal==NaN){d.signal=10;};d.signal=d.signal*1000*60;
            if(d.signal>0){
                $.ccio.mon[d.id].signal=setInterval(function(){$.ccio.init('signal-check',{id:d.id,ke:d.ke})},d.signal);
            }
            d.e=$('.monitor_item[mid="'+d.id+'"][ke="'+d.ke+'"]').resize()
            if(d.e.find('.videos_monitor_list li').length===0){
                d.dr=$('#videos_viewer_daterange').data('daterangepicker');
                $.getJSON('/'+$user.auth_token+'/videos/'+d.ke+'/'+d.id+'?limit=10',function(f){
                    $.ccio.pm(0,{videos:f.videos,ke:d.ke,mid:d.id})
                })
            }
            $.ccio.init('montage');
        break;
        case'monitor_mjpeg_url':
            $('#monitor_live_'+d.id+' iframe').attr('src',location.protocol+'//'+location.host+d.watch_url);
        break;
        case'monitor_frame':
            try{
                var image = new Image();
                var ctx = $('#monitor_live_'+d.id+' canvas');
                image.onload = function() {
                    ctx[0].getContext("2d").drawImage(image,0,0,ctx.width(),ctx.height());
                };
                image.src='data:image/jpeg;base64,'+d.frame;
                $.ccio.mon[d.id].last_frame='data:image/jpeg;base64,'+d.frame;
            }catch(er){
                $.ccio.log('base64 frame')
            }
            $.ccio.init('signal',d);
        break;
        case'onvif':
            $.oB.e.find('._loading').hide()
            $.oB.e.find('[type="submit"]').prop('disabled',false)
            d.info=$.ccio.init('jsontoblock',d.info)
            if(d.url){
                d.stream=d.url.uri
                d.info+=$.ccio.init('jsontoblock',d.url)
            }else{
                d.stream='URL not Found'
            }
            $('#onvif_probe .output_data').append('<tr><td class="ip">'+d.ip+'</td><td class="port">'+d.port+'</td><td>'+$.ccio.init('jsontoblock',d.info)+'</td><td class="url">'+d.stream+'</td><td class="date">'+d.date+'</td><td><a class="btn btn-sm btn-primary copy">&nbsp;<i class="fa fa-copy"></i>&nbsp;</a></td></tr>')
        break;
    }
    delete(d);
});
$.ccio.cx=function(x){if(!x.ke){x.ke=$user.ke;};if(!x.uid){x.uid=$user.uid;};return $.ccio.ws.emit('f',x)}

$(document).ready(function(e){
console.log("%cWarning!", "font: 2em monospace; color: red;");
console.log('%cLeaving the developer console open is fine if you turn off "Network Recording". This is because it will keep a log of all files, including frames and videos segments.', "font: 1.2em monospace; ");
//global form functions
$.ccio.form={};
$.ccio.form.details=function(e){
    e.ar={},e.f=$(this).parents('form');
    $.each(e.f.find('[detail]'),function(n,v){
        v=$(v);e.ar[v.attr('detail')]=v.val();
    });
    e.f.find('[name="details"]').val(JSON.stringify(e.ar));
};
//onvif probe
$.oB={e:$('#onvif_probe'),v:$('#onvif_video')};$.oB.f=$.oB.e.find('form');$.oB.o=$.oB.e.find('.output_data');
$.oB.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    $.oB.o.empty();
    $.oB.e.find('._loading').show()
    $.oB.e.find('[type="submit"]').prop('disabled',true)
    $.ccio.cx({f:'onvif',ip:e.s.ip,port:e.s.port,user:e.s.user,pass:e.s.pass})
    clearTimeout($.oB.checkTimeout)
    $.oB.checkTimeout=setTimeout(function(){
        if($.oB.o.find('tr').length===0){
            $.oB.e.find('._loading').hide()
            $.oB.e.find('[type="submit"]').prop('disabled',false)
            $.oB.o.append('<td class="text-center">Sorry, nothing was found.</td>')
        }
    },30000)
    return false;
});
$.oB.e.on('click','.copy',function(e){
    e.e=$(this).parents('tr');
    $('.hidden-xs [monitor="edit"]').click();
    e.host=e.e.find('.ip').text();
    e.url=$.ccio.init('getLocation',e.e.find('.url').text().replace('rtsp','http'));
    if($.oB.e.find('[name="user"]').val()!==''){
        e.host=$.oB.e.find('[name="user"]').val()+':'+$.oB.e.find('[name="pass"]').val()+'@'+e.host
    }
    $.aM.e.find('[name="host"]').val(e.host)
    $.aM.e.find('[detail="port_force"]').val('1')
    $.aM.e.find('[detail="rtsp_transport"]').val('tcp')
    $.aM.e.find('[detail="aduration"]').val('100000')
    $.aM.e.find('[name="port"]').val(e.url.port)
    $.aM.e.find('[name="mode"]').val('start')
    $.aM.e.find('[name="type"] [value="h264"]').prop('selected',true).parent().change()
    $.aM.e.find('[name="path"]').val(e.url.pathname)
    $.oB.e.modal('hide')
})
$.oB.e.find('[name="ip"]').change(function(e){
    $.ccio.op('onvif_probe_ip',$(this).val());
})
if($.ccio.op().onvif_probe_ip){
    $.oB.e.find('[name="ip"]').val($.ccio.op().onvif_probe_ip)
}
$.oB.e.find('[name="port"]').change(function(e){
    $.ccio.op('onvif_probe_port',$(this).val());
})
if($.ccio.op().onvif_probe_port){
    $.oB.e.find('[name="port"]').val($.ccio.op().onvif_probe_port)
}
$.oB.e.find('[name="user"]').change(function(e){
    $.ccio.op('onvif_probe_user',$(this).val());
})
if($.ccio.op().onvif_probe_user){
    $.oB.e.find('[name="user"]').val($.ccio.op().onvif_probe_user)
}
//Group Selector
$.gR={e:$('#group_list'),b:$('#group_list_button')};
$.gR.drawList=function(){
  var e={};
    e.tmp='';
    $.each($.ccio.init('monGroup'),function(n,v){
        if($user.mon_groups[n]){
           e.tmp+='<li class="mdl-menu__item" group="'+n+'">'+$user.mon_groups[n].name+'</li>'
        }
    })
    $.gR.e.html(e.tmp)
}
$.gR.e.on('click','[group]',function(){
  var e={};
    e.e=$(this),
    e.a=e.e.attr('group');
    $.each($.ccio.op().watch_on,function(n,v){
        $.each(v,function(m,b){
            $.ccio.cx({f:'monitor',ff:'watch_off',id:m,ke:n})
        })
    })
    $.each($.ccio.mon_groups[e.a],function(n,v){
        $.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid,ke:v.ke})
    })
})
//Region Editor
$.zO={e:$('#region_editor')};
$.zO.f=$.zO.e.find('form');
$.zO.o=function(){return $.zO.e.find('canvas')};
$.zO.c=$.zO.e.find('.canvas_holder');
$.zO.name=$.zO.e.find('[name="name"]');
$.zO.rl=$('#regions_list');
$.zO.rp=$('#regions_points');
$.zO.ca=$('#regions_canvas');
$.zO.saveCoords=function(){
    $.aM.e.find('[detail="cords"]').val(JSON.stringify($.zO.regionViewerDetails.cords)).change()
}
$.zO.initRegionList=function(){
    $('#regions_list,#region_points').empty();
    $.each($.zO.regionViewerDetails.cords,function(n,v){
        if(v&&v.name){
            $.zO.rl.append('<option value="'+n+'">'+v.name+'</option>')
        }
    });
    $.zO.rl.change();
}
$.zO.rl.change(function(e){
    $.zO.initCanvas();
})
$.zO.initLiveStream=function(e){
  var e={}
    e.re=$('#region_editor_live');
    e.re.find('iframe,img').attr('src','about:blank').hide()
    if($('#region_still_image').is(':checked')){
        e.re=e.re.find('img')
        e.choice='jpeg'
    }else{
        e.re=e.re.find('iframe')
        e.choice='embed'
    }
    e.src='/'+$user.auth_token+'/'+e.choice+'/'+$user.ke+'/'+$.aM.selected
    if(e.choice=='embed'){
        e.src+='/fullscreen|jquery|relative'
    }else{
         e.src+='/s.jpg'
    }
    if(e.re.attr('src')!==e.src){
        e.re.attr('src',e.src).show()
    }
    e.re.attr('width',$.zO.regionViewerDetails.detector_scale_x)
    e.re.attr('height',$.zO.regionViewerDetails.detector_scale_y)
}
$('#region_still_image').change(function(e){
    e.o=$.ccio.op().switches
    if(!e.o){e.o={}}
    if($(this).is(':checked')){
        e.o.regionStillImage=1
    }else{
        e.o.regionStillImage="0"
    }
    $.ccio.op('switches',e.o)
    $.zO.initLiveStream()
}).ready(function(e){
    e.switches=$.ccio.op().switches
    if(e.switches&&e.switches.regionStillImage===1){
        $('#region_still_image').prop('checked',true)
    }
})
$.zO.initCanvas=function(){
  var e={};
    e.ar=[];
    e.val=$.zO.rl.val();
    if(!e.val){
        $.zO.f.find('[name="name"]').val('')
        $.zO.f.find('[name="indifference"]').val('')
        $.zO.rp.empty()
    }else{
        e.cord=$.zO.regionViewerDetails.cords[e.val];
        if(!e.cord.points){e.cord.points=[[0,0],[0,100],[100,0]]}
        $.each(e.cord.points,function(n,v){
            e.ar=e.ar.concat(v)
        });
        if(isNaN(e.cord.sensitivity)){
            e.cord.sensitivity=$.zO.regionViewerDetails.detector_sensitivity;
        }
        $.zO.f.find('[name="name"]').val(e.val)
        $.zO.e.find('.cord_name').text(e.val)
        $.zO.f.find('[name="indifference"]').val(e.cord.sensitivity)
        $.zO.e.find('.canvas_holder canvas').remove();
        
        $.zO.initLiveStream()
        e.e=$.zO.ca.val(e.ar.join(','))
        e.e.canvasAreaDraw({
            imageUrl:placeholder.getData(placeholder.plcimg({
                bgcolor:'transparent',
                text:' ',
                size:$.zO.regionViewerDetails.detector_scale_x+'x'+$.zO.regionViewerDetails.detector_scale_y
            }))
        });
        e.e.change();
    }
}
$.zO.e.on('change','[name="indifference"]',function(e){
    e.val=$(this).val();
    $.zO.regionViewerDetails.cords[$.zO.rl.val()].sensitivity=e.val;
    $.zO.saveCoords()
})
$.zO.e.on('change','[name="name"]',function(e){
    e.old=$.zO.rl.val();
    e.new=$.zO.name.val();
    $.zO.regionViewerDetails.cords[e.new]=$.zO.regionViewerDetails.cords[e.old];
    delete($.zO.regionViewerDetails.cords[e.old]);
    $.zO.rl.find('option[value="'+e.old+'"]').attr('value',e.new).text(e.new)
    $.zO.saveCoords()
})
$.zO.e.on('change','[point]',function(e){
    e.points=[];
    $('[points]').each(function(n,v){
        v=$(v);
        n=v.find('[point="x"]').val();
        if(n){
            e.points.push([n,v.find('[point="y"]').val()])
        }
    })
    $.zO.regionViewerDetails.cords[$.zO.name.val()].points=e.points;
    $.zO.initCanvas();
})
$.zO.e.find('.erase').click(function(e){
    e.arr=[]
    $.each($.zO.regionViewerDetails.cords,function(n,v){
        if(v&&v!==$.zO.regionViewerDetails.cords[$.zO.rl.val()]){
            e.arr.push(v)
        }
    })
    $.zO.regionViewerDetails.cords=e.arr.concat([]);
    if(Object.keys($.zO.regionViewerDetails.cords).length>0){
        $.zO.initRegionList();
    }else{
        $.zO.f.find('input').prop('disabled',true)
        $('#regions_points tbody').empty()
        $('#regions_list [value="'+$.zO.rl.val()+'"]').remove()
        $.aM.e.find('[detail="cords"]').val('[]')
    }
});
//$.zO.e.find('.new').click(function(e){
//    $.zO.regionViewerDetails.cords[$.zO.rl.val()]
//    $.zO.initRegionList();
//})
$.zO.e.on('changed','#regions_canvas',function(e){
    e.val=$(this).val().replace(/(,[^,]*),/g, '$1;').split(';');
    e.ar=[];
    $.each(e.val,function(n,v){
        v=v.split(',')
        if(v[1]){
            e.ar.push([v[0],v[1]])
        }
    })
    $.zO.regionViewerDetails.cords[$.zO.rl.val()].points=e.ar;
    e.selected=$.zO.regionViewerDetails.cords[$.zO.rl.val()];
    e.e=$('#regions_points tbody').empty();
    $.each($.zO.regionViewerDetails.cords[$.zO.rl.val()].points,function(n,v){
        if(isNaN(v[0])){v[0]=20}
        if(isNaN(v[1])){v[1]=20}
        e.e.append('<tr points="'+n+'"><td><input class="form-control" placeholder="X" point="x" value="'+v[0]+'"></td><td><input class="form-control" placeholder="Y" point="y" value="'+v[1]+'"></td><td class="text-right"><a class="delete btn btn-danger"><i class="fa fa-trash-o"></i></a></td></tr>')
    });
    $.zO.saveCoords()
})
$.zO.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    
    return false;
});
$('#regions_points')
.on('click','.delete',function(e){
    e.p=$(this).parents('tr'),e.row=e.p.attr('points');
    delete($.zO.regionViewerDetails.cords[$.zO.rl.val()].points[e.row])
    $.zO.saveCoords()
    e.p.remove();
    $.zO.rl.change();
})
$.zO.e.on('click','.add',function(e){
    $.zO.f.find('input').prop('disabled',false)
    e.gid=$.ccio.gid(5);
    e.save={};
    $.each($.zO.regionViewerDetails.cords,function(n,v){
        if(v&&v!==null&&v!=='null'){
            e.save[n]=v;
        }
    })
    $.zO.regionViewerDetails.cords=e.save;
    $.zO.regionViewerDetails.cords[e.gid]={name:e.gid,sensitivity:0.0005,points:[[0,0],[0,100],[100,0]]};
    $.zO.rl.append('<option value="'+e.gid+'">'+e.gid+'</option>');
    $.zO.rl.val(e.gid)
    $.zO.rl.change();
});
//probe
$.pB={e:$('#probe')};$.pB.f=$.pB.e.find('form');$.pB.o=$.pB.e.find('.output_data');
$.pB.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.s.url=e.s.url.trim();
    if(e.s.url.indexOf('{{JSON}}')>-1){
        e.s.url='-v quiet -print_format json -show_format -show_streams '+e.s.url
    }
    $.ccio.cx({f:'ffprobe',query:e.s.url})
    return false;
});
$.pB.e.on('hidden.bs.modal',function(){
    $.pB.o.empty()
})
$.pB.e.find('.stop').click(function(e){
    e.e=$(this);
    $.ccio.cx({f:'ffprobe',ff:'stop'})
});
//log viewer
$.log={e:$('#logs_modal'),lm:$('#log_monitors')};$.log.o=$.log.e.find('table tbody');
$.log.e.on('shown.bs.modal', function () {
    $.each($.ccio.mon,function(n,v){
        v.id=v.mid;
        $.ccio.tm('option',v,'#log_monitors')
    })
    $.log.lm.change()
});
$.log.lm.change(function(e){
    e.v=$(this).val();
    if(e.v==='all'){e.v=''}
    $.get('/'+$user.auth_token+'/logs/'+$user.ke+'/'+e.v,function(d){
        e.tmp='';
        $.each(d,function(n,v){
            e.tmp+='<tr class="search-row"><td title="'+v.time+'" class="livestamp"></td><td>'+v.time+'</td><td>'+$.ccio.mon[v.mid].name+'</td><td>'+v.mid+'</td><td>'+$.ccio.init('jsontoblock',v.info)+'</td></tr>'
        })
        $.log.o.html(e.tmp)
        $.ccio.init('ls')
    })
});
//add Monitor
$.aM={e:$('#add_monitor')};$.aM.f=$.aM.e.find('form')
$.aM.import=function(e){
    $.each(e.values,function(n,v){
        $.aM.e.find('[name="'+n+'"]').val(v).change()
    })
    e.ss=JSON.parse(e.values.details);
    $.aM.e.find('[detail]').each(function(n,v){
        v=$(v).attr('detail');if(!e.ss[v]){e.ss[v]=''}
    })
    $.each(e.ss,function(n,v){
        $.aM.e.find('[detail="'+n+'"]').val(v).change();
    });
    $.each(e.ss,function(n,v){
        try{
            var variable=JSON.parse(v)
        }catch(err){
            var variable=v
        }
        if(variable instanceof Object){
            $('[detailContainer="'+n+'"][detailObject]').prop('checked',false)
            $('[detailContainer="'+n+'"][detailObject]').parents('.mdl-js-switch').removeClass('is-checked')
            if(variable instanceof Array){
                $.each(variable,function(m,b,parentOfObject){
                    $('[detailContainer="'+n+'"][detailObject="'+b+'"]').prop('checked',true)
                    parentOfObject=$('[detailContainer="'+n+'"][detailObject="'+b+'"]').parents('.mdl-js-switch')
                    parentOfObject.addClass('is-checked')
                })
            }else{
                $.each(variable,function(m,b){
                    if(typeof b ==='string'){
                       $('[detailContainer="'+n+'"][detailObject="'+m+'"]').val(b).change()
                    }else{
                        $('[detailContainer="'+n+'"][detailObject="'+m+'"]').prop('checked',true)
                        parentOfObject=$('[detailContainer="'+n+'"][detailObject="'+m+'"]').parents('.mdl-js-switch')
                        parentOfObject.addClass('is-checked')
                    }
                })
            }
        }
    });
}
$.aM.e.find('.refresh_cascades').click(function(e){
    $.ccio.cx({f:'ocv_in',data:{f:'refreshPlugins',ke:$user.ke}})
})
$.aM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    $.each(e.s,function(n,v){e.s[n]=v.trim()});
    e.s.mid=e.s.mid.replace(/[^\w\s]/gi,'').replace(/ /g,'')
    if(e.s.mid.length<3){e.er.push('Monitor ID too short')}
    if(e.s.port==''){e.s.port=80}
    if(e.s.name==''){e.er.push('Monitor Name cannot be blank')}
//    if(e.s.protocol=='rtsp'){e.s.ext='mp4',e.s.type='rtsp'}
    if(e.er.length>0){
        $.sM.e.find('.msg').html(e.er.join('<br>'));
        $.ccio.init('note',{title:'Configuration Invalid',text:e.er.join('<br>'),type:'error'});
        return;
    }
    $.post('/'+$user.auth_token+'/configureMonitor/'+$user.ke+'/'+e.s.mid,{data:JSON.stringify(e.s)},function(d){
        $.ccio.log(d)
    })
    if(!$.ccio.mon[e.s.mid]){$.ccio.mon[e.s.mid]={}}
    $.each(e.s,function(n,v){$.ccio.mon[e.s.mid][n]=v;})
    $.aM.e.modal('hide')
    return false;
});
$.aM.e.on('change','[group]',function(){
  var e={};
    e.e=$.aM.e.find('[group]:checked');
    e.s=[];
    e.e.each(function(n,v){
        e.s.push($(v).val())
    });
    $.aM.e.find('[detail="groups"]').val(JSON.stringify(e.s)).change()
})
$.aM.e.on('change','.detector_cascade_selection',function(){
  var e={};
    e.e=$.aM.e.find('.detector_cascade_selection:checked');
    e.s={};
    e.e.each(function(n,v){
        e.s[$(v).val()]={}
    });
    $.aM.e.find('[detail="detector_cascades"]').val(JSON.stringify(e.s)).change()
})
//$.aM.e.on('change','.detector_cascade_selection',function(){
//  var e={};
//    e.details=$.aM.e.find('[name="details"]')
//    try{
//        e.detailsVal=JSON.parse(e.details.val())
//    }catch(err){
//        e.detailsVal={}
//    }
//    e.detailsVal.detector_cascades=[];
//    e.e=$.aM.e.find('.detector_cascade_selection:checked');
//    e.e.each(function(n,v){
//        e.detailsVal.detector_cascades.push($(v).val())
//    });
//    e.details.val(JSON.stringify(e.detailsVal))
//})
$.aM.e.find('.probe_config').click(function(){
  var e={};
    e.user=$.aM.e.find('[detail="muser"]').val();
    e.pass=$.aM.e.find('[detail="mpass"]').val();
    e.host=$.aM.e.find('[name="host"]').val();
    e.protocol=$.aM.e.find('[name="protocol"]').val();
    e.port=$.aM.e.find('[name="port"]').val();
    e.path=$.aM.e.find('[name="path"]').val();
    if($.aM.e.find('[name="type"]').val()==='local'){
        e.url=e.path;
    }else{
        if(e.host.indexOf('@')===-1&&e.user!==''){
            e.host=e.user+':'+e.pass+'@'+e.host;
        }
        e.url=$.ccio.init('url',e)+e.path;
    }
    $.pB.e.find('[name="url"]').val(e.url);
    $.pB.f.submit();
    $.pB.e.modal('show');
})
$.aM.e.find('.import_config').click(function(e){
  var e={};e.e=$(this);e.mid=e.e.parents('[mid]').attr('mid');
    $.confirm.e.modal('show');
    $.confirm.title.text('<%-lang['Import Monitor Configuration']%>')
    e.html='<%-lang.ImportMonitorConfigurationText%><div style="margin-top:15px"><div class="form-group"><textarea placeholder="<%-lang['Paste JSON here.']%>" class="form-control"></textarea></div><label class="upload_file btn btn-primary btn-block"> Upload File <input class="upload" type=file name="files[]"></label></div>';
    $.confirm.body.html(e.html)
    $.confirm.e.find('.upload').change(function(e){
        var files = e.target.files; // FileList object
        f = files[0];
        var reader = new FileReader();
        reader.onload = function(ee) {
            $.confirm.e.find('textarea').val(ee.target.result);
        }
        reader.readAsText(f);
    });
    $.confirm.click({title:'Import',class:'btn-primary'},function(){
        try{
            e.values=JSON.parse($.confirm.e.find('textarea').val());
            $.aM.import(e)
            $.aM.e.modal('show')
        }catch(err){
            $.ccio.log(err)
            $.ccio.init('note',{title:'<%-lang['Invalid JSON']%>',text:'<%-lang.InvalidJSONText%>',type:'error'})
        }
    });
});
$.aM.e.find('.save_config').click(function(e){
  var e={};e.e=$(this);e.mid=e.e.parents('[mid]').attr('mid');e.s=$.aM.f.serializeObject();
    if(!e.mid||e.mid===''){
        e.mid='NewMonitor'
    }
    e.dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(e.s));
    $('#temp').html('<a></a>')
        .find('a')
        .attr('href',e.dataStr)
        .attr('download','Shinobi_'+e.mid+'_config.json')
        [0].click()
});
$.aM.f.find('[detail="stream_type"]').change(function(e){
    e.e=$(this);
    if(e.e.val()==='jpeg'){$.aM.f.find('[detail="snap"]').val('1').change()}
})
$.aM.f.find('[name="type"]').change(function(e){
    e.e=$(this);
    if(e.e.val()==='h264'){$.aM.f.find('[name="protocol"]').val('rtsp').change()}
})
$.aM.md=$.aM.f.find('[detail]');
$.aM.md.change($.ccio.form.details)
$.aM.f.find('[selector]').change(function(e){
    e.v=$(this).val();e.a=$(this).attr('selector')
    $.aM.f.find('.'+e.a+'_input').hide()
    $.aM.f.find('.'+e.a+'_'+e.v).show();
    $.aM.f.find('.'+e.a+'_text').text($(this).find('option:selected').text())
});
$.aM.f.find('[name="type"]').change(function(e){
    e.e=$(this);
    e.v=e.e.val();
    e.h=$.aM.f.find('[name="path"]');
    e.p=e.e.parents('.form-group');
    switch(e.v){
        case'local':case'socket':
            e.h.attr('placeholder','/dev/video0')
        break;
        default:
            e.h.attr('placeholder','/videostream.cgi?1')
        break;
    }
});
//api window
$.apM={e:$('#apis')};$.apM.f=$.apM.e.find('form');
$.apM.md=$.apM.f.find('[detail]');
$.apM.md.change($.ccio.form.details).first().change();
$.apM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    if(!e.s.ip||e.s.ip.length<7){e.er.push('Enter atleast one IP')}
    if(e.er.length>0){$.apM.e.find('.msg').html(e.er.join('<br>'));return;}
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    $.ccio.cx({f:'api',ff:'add',form:e.s})
});
$.apM.e.on('click','.delete',function(e){
    e.e=$(this);e.p=e.e.parents('[api_key]'),e.code=e.p.attr('api_key');
    $.confirm.e.modal('show');
    $.confirm.title.text('Delete API Key');
    e.html='Do you want to delete this API key? You cannot recover it.';
    $.confirm.body.html(e.html);
    $.confirm.click({title:'Delete',class:'btn-danger'},function(){
        $.ccio.cx({f:'api',ff:'delete',form:{code:e.code}})
    });
})
//filters window
try{$user.filters=JSON.parse($user.details).filters;}catch(er){}
if(!$user.filters)$user.filters={};
$.fI={e:$('#filters')};$.fI.f=$.fI.e.find('form');
$.fI.md=$.fI.f.find('[detail]');
$.ccio.init('filters');
$.ccio.tm('filters-where');
$.fI.e.on('click','.where .add',function(e){
    $.ccio.tm('filters-where');
})
$.fI.e.on('click','.where .remove',function(e){
    e.e=$('#filters_where .row');
    if(e.e.length>1){
        e.e.last().remove();
    }
})
$('#saved_filters').change(function(e){
    e.e=$(this),e.id=e.e.val();
    $('#filters_where').empty()
    if(e.id&&e.id!==''){
        e.name=$user.filters[e.id].name;
        $.each($user.filters[e.id].where,function(n,v){
            $.ccio.tm('filters-where',v)
        });
        $.each($user.filters[e.id],function(n,v){
            if(n==='where'){return}
            $.fI.f.find('[name="'+n+'"]').val(v);
        });
    }else{
        e.name='<%-lang['Add New']%>';
        $.fI.f.find('[name="id"]').val($.ccio.gid(5));
        $.ccio.tm('filters-where');
    }
    $.fI.e.find('.filter_name').text(e.name)
}).change()
$.fI.f.find('.delete').click(function(e){
    e.s=$.fI.f.serializeObject();
    $.confirm.e.modal('show');
    $.confirm.title.text('<%-lang['Delete Filter']%>');
    e.html='<%-lang.confirmDeleteFilter%>';
    $.confirm.body.html(e.html);
    $.confirm.click({title:'<%-lang['Delete Filter']%>',class:'btn-danger'},function(){
        $.ccio.cx({f:'settings',ff:'filters',fff:'delete',form:e.s})
    });
})
$.fI.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    e.s.where=[];
    $('.where-row').each(function(n,v){
        n={};
        $(v).find('[where]').each(function(m,b){
            b=$(b);
            n[b.attr('where')]=b.val();
        })
        e.s.where.push(n)
    })
    $.ccio.cx({f:'settings',ff:'filters',fff:'save',form:e.s})
});
//settings window
$.sM={e:$('#settings')};
$.sM.f=$.sM.e.find('form');
$.sM.g=$('#settings_mon_groups');
$.sM.md=$.sM.f.find('[detail]');
$.sM.md.change($.ccio.form.details);
$.sM.writewMonGroups=function(){
    $.sM.f.find('[detail="mon_groups"]').val(JSON.stringify($user.mon_groups)).change()
}
$.sM.reDrawMonGroups=function(){
    $.sM.g.empty();
    $.ccio.pm('option',$user.mon_groups,'#settings_mon_groups')
    $.sM.g.change();
};
$.sM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    if(e.s.pass!==''&&e.password_again===e.s.pass){e.er.push("<%-lang["Passwords don't match"]%>")};
    if(e.er.length>0){$.sM.e.find('.msg').html(e.er.join('<br>'));return;}
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    $.ccio.cx({f:'settings',ff:'edit',form:e.s})
    $.sM.e.modal('hide')
});
$.sM.e.on('shown.bs.modal',function(){
    $.sM.reDrawMonGroups()
})
$.sM.g.change(function(e){
    e.v=$(this).val();
    e.group=$user.mon_groups[e.v];
    if(!e.group){return}
    $.sM.selectedMonGroup=e.group;
    $.each(e.group,function(n,v){
        $.sM.f.find('[group="'+n+'"]').val(v)
    })
});
$.sM.f.find('[group]').change(function(e){
    e.v=$.sM.g.val();
    if(!e.v||e.v==''){
        e.e=$.sM.f.find('[group="name"]')
        e.name=e.e.val()
        $('.mon_groups .add').click();
        e.v=$.sM.g.val()
        e.e.val(e.name)
    }
    e.group=$user.mon_groups[e.v];
    $.sM.f.find('[group]').each(function(n,v){
        v=$(v)
        e.group[v.attr('group')]=v.val()
    });
    $user.mon_groups[e.v]=e.group;
    $.sM.g.find('option[value="'+$.sM.g.val()+'"]').text(e.group.name)
    $.sM.writewMonGroups()
})
$.sM.f.on('click','.mon_groups .delete',function(e){
    e.v=$.sM.g.val();
    delete($user.mon_groups[e.v]);
    $.sM.reDrawMonGroups()
})
$.sM.f.on('click','.mon_groups .add',function(e){
    e.gid=$.ccio.gid(5);
    $user.mon_groups[e.gid]={id:e.gid,name:e.gid};
    $.sM.g.append($.ccio.tm('option',$user.mon_groups[e.gid]));
    $.sM.g.val(e.gid)
    $.sM.g.change();
});
//videos window
$.vidview={e:$('#videos_viewer'),pages:$('#videos_viewer_pages'),limit:$('#videos_viewer_limit')};
$.vidview.f=$.vidview.e.find('form')
$('#videos_viewer_daterange').daterangepicker({
    startDate:moment().subtract(moment.duration("24:00:00")),
    endDate:moment().add(moment.duration("24:00:00")),
    timePicker: true,
    timePickerIncrement: 30,
    locale: {
        format: 'MM/DD/YYYY h:mm A'
    }
},function(start, end, label){
    $.vidview.launcher.click()
});
$.vidview.e.on('change','#videos_select_all',function(e){
    e.e=$(this);
    e.p=e.e.prop('checked')
    e.a=$.vidview.e.find('input[type=checkbox][name]')
    if(e.p===true){
        e.a.prop('checked',true)
    }else{
        e.a.prop('checked',false)
    }
})
$.vidview.e.find('form').submit(function(e){
    e.preventDefault();
    $.vidview.launcher.click()
    return false;
})
$.vidview.e.find('.delete_selected').click(function(e){
    e.s=$.vidview.f.serializeObject();
    $.confirm.e.modal('show');
    $.confirm.title.text('<%-lang['Delete Selected Videos']%>')
    e.html='<%-lang.DeleteSelectedVideosMsg%><div style="margin-bottom:15px"></div>'
    $.each(e.s,function(n,v){
        e.html+=n+'<br>';
    })
    $.confirm.body.html(e.html)
    $.confirm.click({title:'Delete Video',class:'btn-danger'},function(){
        $.each(e.s,function(n,v){
            n=n.split('.')
            $.ccio.cx({f:'video',ff:'delete',filename:n[0],ext:n[1],mid:v});
        })
    });
})
$.vidview.pages.on('click','[page]',function(e){
    e.limit=$.vidview.limit.val();
    e.page=$(this).attr('page');
    $.vidview.current_page=e.page;
    if(e.limit.replace(/ /g,'')===''){
        e.limit='100';
    }
    if(e.limit.indexOf(',')>-1){
        e.limit=parseInt(e.limit.split(',')[1])
    }else{
        e.limit=parseInt(e.limit)
    }
    $.vidview.limit.val((parseInt(e.page)-1)+'00,'+e.limit)
    $.vidview.launcher.click()
})
//Timelapse Window
$.timelapse={e:$('#timelapse')}
$.timelapse.f=$.timelapse.e.find('form'),
$.timelapse.meter=$.timelapse.e.find('.motion-meter'),
$.timelapse.line=$('#timelapse_video_line'),
$.timelapse.display=$('#timelapse_video_display'),
$.timelapse.seekBar=$('#timelapse_seekBar'),
$.timelapse.seekBarProgess=$.timelapse.seekBar.find('.progress-bar'),
$.timelapse.dr=$('#timelapse_daterange'),
$.timelapse.mL=$.timelapse.e.find('.motion_list'),
$.timelapse.monitors=$.timelapse.e.find('.monitors_list');
$.timelapse.playDirection='videoAfter'
$.timelapse.playRate=15
$.timelapse.placeholder=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}))
$.timelapse.dr.daterangepicker({
    startDate:moment().subtract(moment.duration("24:00:00")),
    endDate:moment().add(moment.duration("24:00:00")),
    timePicker: true,
    timePickerIncrement: 30,
    locale: {
        format: 'MM/DD/YYYY h:mm A'
    }
},function(start, end, label){
    $.timelapse.drawTimeline()
});
$.timelapse.f.find('input,select').change(function(){
    $.timelapse.f.submit()
})
$.timelapse.f.submit(function(e){
    e.preventDefault();
    $.timelapse.drawTimeline()
    return false;
})
$.timelapse.drawTimeline=function(getData){
    var e={};
    if(getData===undefined){getData=true}
    var mid=$.timelapse.monitors.val();
    e.dateRange=$.timelapse.dr.data('daterangepicker');
    e.dateRange={startDate:e.dateRange.startDate,endDate:e.dateRange.endDate}
    e.videoURL='/'+$user.auth_token+'/videos/'+$user.ke+'/'+mid;
    e.videoURL+='?limit=100&start='+$.ccio.init('th',e.dateRange.startDate)+'&end='+$.ccio.init('th',e.dateRange.endDate);
    e.next=function(videos){
        $.timelapse.currentVideos={}
        e.tmp=''
        $.each(videos.videos,function(n,v){
            if(!v||!v.time){return}
            v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
            v.videoBefore=videos.videos[n-1];
            v.videoAfter=videos.videos[n+1];
            v.downloadLink=v.href+'?downloadName='+v.mid+'-'+v.filename
            v.position=n;
            $.timelapse.currentVideos[v.filename]=v;
            e.tmp+='<li class="glM'+v.mid+' list-group-item timelapse_video flex-block" timelapse="video" file="'+v.filename+'" href="'+v.href+'" mid="'+v.mid+'" ke="'+v.ke+'">'
            e.tmp+='<div class="flex-block">'
            e.tmp+='<div class="flex-unit-3"><div class="frame" style="background-image:url('+$.timelapse.placeholder+')"></div></div>'
            e.tmp+='<div class="flex-unit-3"><div><span title="'+v.time+'" class="livestamp"></span></div><div>'+v.filename+'</div></div>'
            e.tmp+='<div class="flex-unit-3 text-right"><a class="btn btn-default" download="'+v.mid+'-'+v.filename+'" href="'+v.href+'?downloadName='+v.mid+'-'+v.filename+'">&nbsp;<i class="fa fa-download"></i>&nbsp;</a> <a class="btn btn-danger" video="delete">&nbsp;<i class="fa fa-trash-o"></i>&nbsp;</a></div>'
            e.tmp+='</div>'
            e.tmp+='<div class="flex-block">'
            e.tmp+='<div class="flex-unit-3"><div class="progress"><div class="progress-bar progress-bar-primary" role="progressbar" style="width:0%"></div></div></div>'
            e.tmp+='</div>'
            e.tmp+='</li>'
        })
        $.timelapse.line.html(e.tmp)
        $.ccio.init('ls')
        if(getData===true){
            e.timeout=50
        }else{
            e.timeout=2000
        }
        setTimeout(function(){
            if($.timelapse.e.find('.timelapse_video.active').length===0){
                $.timelapse.e.find('[timelapse="video"]').first().click()
            }
        },e.timeout)
    }
    if(getData===true){
        $.getJSON(e.videoURL,function(videos){
            videos.videos=videos.videos.reverse()
            $.timelapse.currentVideosArray=videos
            e.next(videos)
        })
    }else{
        e.next($.timelapse.currentVideosArray)
    }
}
$.timelapse.e.on('click','[timelapse]',function(){
    var e={}
    e.e=$(this)
    e.videoCurrentNow=$.timelapse.display.find('.videoNow')
    e.videoCurrentAfter=$.timelapse.display.find('.videoAfter')
    e.videoCurrentBefore=$.timelapse.display.find('.videoBefore')
    if($.timelapse.videoInterval){
        clearInterval($.timelapse.videoInterval);
    }
    switch(e.e.attr('timelapse')){
        case'download':
            $.timelapse.line.find('.active [download]').click()
        break;
        case'mute':
            e.videoCurrentNow[0].muted = !e.videoCurrentNow[0].muted
            $.timelapse.videoNowIsMuted = e.videoCurrentNow[0].muted
            e.e.find('i').toggleClass('fa-volume-off fa-volume-up')
            e.e.toggleClass('btn-danger')
        break;
        case'play':
            $.timelapse.playRate =5
            e.videoCurrentNow[0].playbackRate = $.timelapse.playRate;
            $.timelapse.onPlayPause(1)
        break;
        case'stepFrontFront':
            e.add=e.e.attr('add')
            e.stepFrontFront=parseInt(e.e.attr('stepFrontFront'))
            if(!e.stepFrontFront||isNaN(e.stepFrontFront)){e.stepFrontFront = 5}
            if(e.add==="0"){
                $.timelapse.playRate = e.stepFrontFront
            }else{
                $.timelapse.playRate += e.stepFrontFront
            }
            e.videoCurrentNow[0].playbackRate = $.timelapse.playRate;
            e.videoCurrentNow[0].play()
        break;
        case'stepFront':
            e.videoCurrentNow[0].currentTime += 5;
            e.videoCurrentNow[0].pause()
        break;
        case'stepBackBack':
           $.timelapse.videoInterval = setInterval(function(){
               $.timelapse.playRate = 5
               e.videoCurrentNow[0].playbackRate = $.timelapse.playRate;
               if(e.videoCurrentNow[0].currentTime == 0){
                   clearInterval($.timelapse.videoInterval);
                   e.videoCurrentNow[0].pause();
               }
               else{
                   e.videoCurrentNow[0].currentTime += -.5;
               }
           },30);
        break;
        case'stepBack':
            e.videoCurrentNow[0].currentTime += -5;
            e.videoCurrentNow[0].pause()
        break;
        case'video':
            $.timelapse.e.find('video').each(function(n,v){
                v.pause()
            })
            e.playButtonIcon=$.timelapse.e.find('[timelapse="play"]').find('i')
            e.drawVideoHTML=function(position){
                var video
                var exisitingElement=$.timelapse.display.find('.'+position)
                if(position){
                    video=e.video[position]
                }else{
                    position='videoNow'
                    video=e.video
                }
                if(video){
                   $.timelapse.display.append('<video class="video_video '+position+'" video="'+video.href+'" preload><source src="'+video.href+'" type="video/'+video.ext+'"></video>')
                }
            }
            e.filename=e.e.attr('file')
            e.video=$.timelapse.currentVideos[e.filename]
            e.videoIsSame=(e.video.href==e.videoCurrentNow.attr('video'))
            e.videoIsAfter=(e.video.href==e.videoCurrentAfter.attr('video'))
            e.videoIsBefore=(e.video.href==e.videoCurrentBefore.attr('video'))
            if(e.videoIsSame||e.videoIsAfter||e.videoIsBefore){
                switch(true){
                    case e.videoIsSame:
                        $.ccio.log('$.timelapse','videoIsSame')
                        e.videoNow=$.timelapse.display.find('video.videoNow')
                        if(e.videoNow[0].paused===true){
                            e.videoNow[0].play()
                        }else{
                            e.videoNow[0].pause()
                        }
                        return
                    break;
                    case e.videoIsAfter:
                        $.ccio.log('$.timelapse','videoIsAfter')
                        e.videoCurrentBefore.remove()
                        e.videoCurrentAfter.removeClass('videoAfter').addClass('videoNow')
                        e.videoCurrentNow.removeClass('videoNow').addClass('videoBefore')
                        e.drawVideoHTML('videoAfter')
                    break;
                    case e.videoIsBefore:
                        $.ccio.log('$.timelapse','videoIsBefore')
                        e.videoCurrentAfter.remove()
                        e.videoCurrentBefore.removeClass('videoBefore').addClass('videoNow')
                        e.videoCurrentNow.removeClass('videoNow').addClass('videoAfter')
                        e.drawVideoHTML('videoBefore')
                    break;
                }
            }else{
                $.ccio.log('$.timelapse','newSetOf3')
                $.timelapse.display.empty()
                e.drawVideoHTML()//videoNow
                e.drawVideoHTML('videoBefore')
                e.drawVideoHTML('videoAfter')
            }
            $.timelapse.display.find('video').each(function(n,v){
                v.addEventListener('loadeddata', function() {
                    e.videoCurrentAfterPreview=$('.timelapse_video[href="'+$(v).attr('video')+'"] .frame')
                    if(e.videoCurrentAfterPreview.attr('set')!=='1'){
                        $.ccio.snapshotVideo(v,function(url,buffer){
                            e.videoCurrentAfterPreview.attr('set','1').css('background-image','url('+url+')')
                            if($(v).hasClass('videoAfter')){
                                v.currentTime=0
                                v.pause()
                            }
                        })
                    }
                }, false);
            })
            e.videoNow=$.timelapse.display.find('video.videoNow')[0]
            if($.timelapse.videoNowIsMuted){
                e.videoNow.muted=true
            }
            e.videoNow.playbackRate = $.timelapse.playRate
            e.videoNow.play()
            e.playButtonIcon.removeClass('fa-pause').addClass('fa-play')
            $.timelapse.onended = function() {
                $.timelapse.line.find('[file="'+e.video[$.timelapse.playDirection].filename+'"]').click()
            };
            e.videoNow.onended = $.timelapse.onended
            e.videoNow.onerror = $.timelapse.onended
            $.timelapse.onPlayPause=function(x){
                if(e.videoNow.paused===true){
                    e.playButtonIcon.removeClass('fa-pause').addClass('fa-play')
                    if(x==1)e.videoNow.play();
                }else{
                    e.playButtonIcon.removeClass('fa-play').addClass('fa-pause')
                    if(x==1)e.videoNow.pause();
                }
            }
            $(e.videoNow)
            .off('play').on('play',$.timelapse.onPlayPause)
            .off('pause').on('pause',$.timelapse.onPlayPause)
            .off('timeupdate').on('timeupdate',function(){
                var value= (( e.videoNow.currentTime / e.videoNow.duration ) * 100)+"%"
                $.timelapse.seekBarProgess.css("width",value);
                $.timelapse.e.find('.timelapse_video[file="'+e.filename+'"] .progress-bar').css("width",value);
            })
            $.timelapse.seekBar.off("click").on("click", function(seek){
                var offset = $(this).offset();
                var left = (seek.pageX - offset.left);
                var totalWidth = $.timelapse.seekBar.width();
                var percentage = ( left / totalWidth );
                var vidTime = e.videoNow.duration * percentage;
                e.videoNow.currentTime = vidTime;
            });
            
            $.ccio.log('$.timelapse',e.video)
            $.timelapse.line.find('.timelapse_video').removeClass('active')
            e.videoCurrentNow=$.timelapse.display.find('.videoNow')
            e.e.addClass('active')
            if ($('#timelapse_video_line:hover').length === 0) {
                $.timelapse.line.animate({scrollTop:$.timelapse.line.scrollTop() + e.e.position().top - $.timelapse.line.height()/2 + e.e.height()/2 - 40});
            }
        break;
    }
    $.timelapse.e.find('.timelapse_playRate').text('x'+$.timelapse.playRate)
})
$.timelapse.e.on('hidden.bs.modal',function(e){
    delete($.timelapse.currentVideos)
    delete($.timelapse.currentVideosArray)
})
//POWER videos window
$.pwrvid={e:$('#pvideo_viewer')};
$.pwrvid.f=$.pwrvid.e.find('form'),
$.pwrvid.d=$('#vis_pwrvideo'),
$.pwrvid.mL=$('#motion_list'),
$.pwrvid.m=$('#vis_monitors'),
$.pwrvid.lv=$('#live_view'),
$.pwrvid.dr=$('#pvideo_daterange'),
$.pwrvid.vp=$('#video_preview');
$.pwrvid.dr.daterangepicker({
    startDate:moment().subtract(moment.duration("24:00:00")),
    endDate:moment().add(moment.duration("24:00:00")),
    timePicker: true,
    timePickerIncrement: 30,
    locale: {
        format: 'MM/DD/YYYY h:mm A'
    }
},function(start, end, label){
    $.pwrvid.drawTimeline()
});
$('#pvideo_show_events').change(function(){
    $.pwrvid.drawTimeline()
})
$.pwrvid.e.on('click','[preview]',function(e){
    e.e=$(this);
    e.video=$.pwrvid.vp.find('video')[0];
    if(e.video){
        e.duration=e.video.duration;
        e.now=e.video.currentTime;
    }
    if($.pwrvid.video){
        clearInterval($.pwrvid.video.interval);
    }
    switch(e.e.attr('preview')){
        case'mute':
            e.video.muted = !e.video.muted
            e.e.find('i').toggleClass('fa-volume-off fa-volume-up')
            e.e.toggleClass('btn-danger')
        break;
        case'play':
            e.video.playbackRate = 1;
            $.pwrvid.vpOnPlayPause(1)
        break;
        case'stepFrontFront':
            e.video.playbackRate += 5;
            e.video.play()
        break;
        case'stepFront':
            e.video.currentTime += 1;
            e.video.pause()
        break;
        case'stepBackBack':
           $.pwrvid.video.interval = setInterval(function(){
               e.video.playbackRate = 1.0;
               if(e.video.currentTime == 0){
                   clearInterval($.pwrvid.video.interval);
                   e.video.pause();
               }
               else{
                   e.video.currentTime += -.2;
               }
           },30);
        break;
        case'stepBack':
            e.video.currentTime += -1;
            e.video.pause()
        break;
        case'video':
//            e.preventDefault();
            e.p=e.e.parents('[mid]');
            e.filename=e.p.attr('file');
            $.pwrvid.vp.find('h3').text(e.filename)
            e.href=e.e.attr('href');
            e.status=e.p.attr('status');
            e.mon=$.ccio.mon[e.p.attr('mid')];
            $.pwrvid.vp.find('.holder').html('<video class="video_video" video="'+e.href+'" autoplay loop controls><source src="'+e.href+'" type="video/'+e.mon.ext+'"></video>');
            $.pwrvid.vp
                .attr('mid',e.mon.mid)
                .attr('ke',e.mon.ke)
                .attr('status',e.status)
                .attr('file',e.filename)
                .find('[download],[video="download"]')
                .attr('download',e.filename)
                .attr('href',e.href)
                $.pwrvid.vp.find('video').off('loadeddata').on('loadeddata',function(){
                    $.pwrvid.vp.find('.stream-objects').empty().css('width',$(this).width())
                })
            if(e.status==1){
                $.get(e.href+'/status/2',function(d){
                })
            }
            var labels=[]
            var Dataset1=[]
            var events=$.pwrvid.currentDataObject[e.filename].motion
            var eventsLabeledByTime={}
            $.each(events,function(n,v){
                if(!v.details.confidence){v.details.confidence=0}
                var time=moment(v.time).format('MM/DD/YYYY HH:mm:ss')
                labels.push(time)
                Dataset1.push(v.details.confidence)
                eventsLabeledByTime[time]=v;
            })
            if(events.length>0){
                $.pwrvid.mL.html("<canvas></canvas>")
                var timeFormat = 'MM/DD/YYYY HH:mm:ss';
                var color = Chart.helpers.color;
                Chart.defaults.global.defaultFontColor = '#fff';
                var config = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            type: 'line',
                            label: 'Motion Confidence',
                            backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
                            borderColor: window.chartColors.red,
                            data: Dataset1,
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        title: {
                            fontColor: "white",
                            text:"Events in this video"
                        },
                        scales: {
                            xAxes: [{
                                type: "time",
                                display: true,
                                time: {
                                    format: timeFormat,
                                    // round: 'day'
                                }
                            }],
                        },
                    }
                };
                var ctx = $.pwrvid.mL.find('canvas')[0].getContext("2d");
                $.pwrvid.miniChart = new Chart(ctx, config);
                $.pwrvid.mL.find('canvas').click(function(f) {
                    var target = $.pwrvid.miniChart.getElementsAtEvent(f)[0];
                    if(!target){return false}
                    var video = $.pwrvid.currentDataObject[e.filename];
                    var event = video.motion[target._index];
                    var video1 = $('#video_preview video')[0];
                    video1.currentTime=moment(event.time).diff(moment(video.row.time),'seconds')
                    video1.play()
                });
                var colorNames = Object.keys(window.chartColors);

            }else{
                $.pwrvid.mL.html('<div class="super-center text-center" style="width:auto"><%-lang['No Events found for this video']%></div>')
            }
            $.pwrvid.video={filename:e.filename,href:e.href,mid:e.mon.mid,ke:e.mon.ke}
            $.pwrvid.vpOnPlayPause=function(x,e){
              var e={}
                e.video=$.pwrvid.vp.find('video')[0]
                e.i=$.pwrvid.vp.find('[preview="play"]').find('i')
                if(e.video.paused===true){
                    e.i.removeClass('fa-pause').addClass('fa-play')
                    if(x==1)e.video.play();
                }else{
                    e.i.removeClass('fa-play').addClass('fa-pause')
                    if(x==1)e.video.pause();
                }
            }
            $.pwrvid.vp.find('video')
                .off("pause").on("pause",$.pwrvid.vpOnPlayPause)
                .off("play").on("play",$.pwrvid.vpOnPlayPause)
                .off("timeupdate").on("timeupdate",function(){
                    var video = $.pwrvid.currentDataObject[e.filename];
                    var video1 = $('#video_preview video');
                    var videoTime=moment(video.row.time).add(parseInt(video1[0].currentTime),'seconds').format('MM/DD/YYYY HH:mm:ss');
                    var event = eventsLabeledByTime[videoTime];
                    if(event){
                        if(event.details.plates){
                            console.log('licensePlateVideo',event)
                        }
                        if(event.details.matrices){
                            event.monitorDetails=JSON.parse(e.mon.details)
                            event.stream=video1
                            event.streamObjects=$.pwrvid.vp.find('.stream-objects')
                            $.ccio.init('drawMatrices',event)
                        }
                        if(event.details.confidence){
                            $.pwrvid.vp.find('.motion-meter .progress-bar').css('width',event.details.confidence+'px').find('span').text(event.details.confidence)
                        }
                    }
                })
        break;
    }
})
$.pwrvid.drawTimeline=function(getData){
    var e={};
    if(getData===undefined){getData=true}
    var mid=$.pwrvid.m.val();
    e.live_header=$.pwrvid.lv.find('h3 span');
    e.live=$.pwrvid.lv.find('iframe');
    e.dateRange=$.pwrvid.dr.data('daterangepicker');
    e.eventLimit=$('#pvideo_event_limit').val();
    if(e.eventLimit===''){e.eventLimit=500}
    e.dateRange={startDate:e.dateRange.startDate,endDate:e.dateRange.endDate}
    e.videoURL='/'+$user.auth_token+'/videos/'+$user.ke+'/'+mid;
    e.eventURL='/'+$user.auth_token+'/events/'+$user.ke+'/'+mid;
    e.videoURL+='?limit=100&start='+$.ccio.init('th',e.dateRange.startDate)+'&end='+$.ccio.init('th',e.dateRange.endDate);
    e.eventURL+='/'+e.eventLimit+'/'+$.ccio.init('th',e.dateRange.startDate)+'/'+$.ccio.init('th',e.dateRange.endDate);
    e.live_header.text($.ccio.mon[mid].name)
    e.live.attr('src','/'+$user.auth_token+'/embed/'+$user.ke+'/'+mid+'/fullscreen|jquery|relative')
    
    e.next=function(videos,events){
        if($.pwrvid.t&&$.pwrvid.t.destroy){$.pwrvid.t.destroy()}
        data={};
        $.each(videos.videos,function(n,v){
            if(!v||!v.mid){return}
            v.mon=$.ccio.mon[v.mid];
            v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
            if(v.status>0){
    //                    data.push({src:v,x:v.time,y:moment(v.time).diff(moment(v.end),'minutes')/-1})
                data[v.filename]={filename:v.filename,time:v.time,timeFormatted:moment(v.time).format('MM/DD/YYYY HH:mm'),endTime:v.end,close:moment(v.time).diff(moment(v.end),'minutes')/-1,motion:[],row:v,position:n}
            }
        });
        $.each(events,function(n,v){
            $.each(data,function(m,b){
                if (moment(v.time).isBetween(moment(b.time).format(),moment(b.endTime).format())) {
                    data[m].motion.push(v)
                }
            })
        });
        $.pwrvid.currentDataObject=data;
        e.n=$.pwrvid.e.find('.nodata').hide()
        if($.pwrvid.chart){
            $.pwrvid.d.empty()
            delete($.pwrvid.chart)
        }
        $.pwrvid.currentData=Object.values(data);
        if($.pwrvid.currentData.length>0){
            var labels=[]
            var Dataset1=[]
            var Dataset2=[]
            $.each(data,function(n,v){
                labels.push(v.timeFormatted)
                Dataset1.push(v.close)
                Dataset2.push(v.motion.length)
            })
            $.pwrvid.d.html("<canvas></canvas>")
            var timeFormat = 'MM/DD/YYYY HH:mm';
            var color = Chart.helpers.color;
            Chart.defaults.global.defaultFontColor = '#fff';
            var config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        type: 'line',
                        label: '<%-lang['Video and Time Span (Minutes)']%>',
                        backgroundColor: color(window.chartColors.blue).alpha(0.2).rgbString(),
                        borderColor: window.chartColors.blue,
                        data: Dataset1,
                    }, {
                        type: 'bar',
                        showTooltip: false,
                        label: '<%-lang['Counts of Motion']%>',
                        backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: window.chartColors.red,
                        data:Dataset2,
                    }, ]
                },
                options: {
                     maintainAspectRatio: false,
                    title: {
                        fontColor: "white",
                        text:"<%-lang['Video Length (minutes) and Motion Count per video']%>"
                    },
                    tooltips: {
                        callbacks: {

                        },
                    },
                    scales: {
                        xAxes: [{
                            type: "time",
                            display: true,
                            time: {
                                format: timeFormat,
                                // round: 'day'
                            }
                        }],
                    },
                }
            };

            var ctx = $.pwrvid.d.find('canvas')[0].getContext("2d");
            $.pwrvid.chart = new Chart(ctx, config);
            $.pwrvid.d.find('canvas').click(function(e) {
                var target = $.pwrvid.chart.getElementsAtEvent(e)[0];
                if(!target){return false}
                target = $.pwrvid.currentData[target._index];
                $.pwrvid.e.find('.temp').html('<li class="glM'+target.row.mid+'" mid="'+target.row.mid+'" ke="'+target.row.ke+'" status="'+target.row.status+'" file="'+target.row.filename+'"><a class="btn btn-sm btn-primary" preview="video" href="'+target.row.href+'"><i class="fa fa-play-circle"></i></a></li>').find('a').click()
            });
            var colorNames = Object.keys(window.chartColors);

        }else{
            e.n.show()
        }
    }
    if(getData===true){
        $.getJSON(e.eventURL,function(events){
            $.getJSON(e.videoURL,function(videos){
                $.pwrvid.currentVideos=videos
                $.pwrvid.currentEvents=events
                e.next(videos,events)
            })
        })
    }else{
        e.next($.pwrvid.currentVideos,$.pwrvid.currentEvents)
    }
}
$('#vis_monitors,#pvideo_event_limit').change(function(){
    $.pwrvid.f.submit()
})
$.pwrvid.f.submit(function(e){
    e.preventDefault();
    $.pwrvid.drawTimeline()
    return false;
})
$.pwrvid.e.on('hidden.bs.modal',function(e){
    $(this).find('iframe').attr('src','about:blank')
    $.pwrvid.vp.find('.holder').empty()
    delete($.pwrvid.currentDataObject)
    delete($.pwrvid.currentData)
    $.pwrvid.mL.empty()
    $.pwrvid.d.empty()
})
//dynamic bindings
$('body')
.on('click','.logout',function(e){
    localStorage.removeItem('ShinobiLogin_'+location.host);location.href=location.href;
})
.on('click','[video]',function(e){
    e.e=$(this),
    e.a=e.e.attr('video'),
    e.p=e.e.parents('[mid]'),
    e.ke=e.p.attr('ke'),
    e.mid=e.p.attr('mid'),
    e.file=e.p.attr('file');
    e.status=e.p.attr('status');
    if(!e.ke||!e.mid){
        //for calendar plugin
        e.p=e.e.parents('[data-mid]'),
        e.ke=e.p.data('ke'),
        e.mid=e.p.data('mid'),
        e.file=e.p.data('file');
        e.status=e.p.data('status');
    }
    e.mon=$.ccio.mon[e.mid];
    switch(e.a){
        case'launch':
            e.preventDefault();
            e.href=$(this).attr('href'),e.e=$('#video_viewer');
            e.mon=$.ccio.mon[e.mid];
            e.e.find('.modal-title span').html(e.mon.name+' - '+e.file)
            e.e.find('.modal-body').html('<video class="video_video" video="'+e.href+'" autoplay loop controls><source src="'+e.href+'" type="video/'+e.mon.ext+'"></video>')
            e.e.attr('mid',e.mid);
            e.f=e.e.find('.modal-footer');
            e.f.find('.download_link').attr('href',e.href).attr('download',e.file);
            e.f.find('[monitor="download"][host="dropbox"]').attr('href',e.href);
            e.e.modal('show').attr('ke',e.ke).attr('mid',e.mid).attr('file',e.file);
            if(e.status==1){
                $.get(e.href+'/status/2',function(d){
                })
            }
        break;
        case'fix':
            $.confirm.e.modal('show');
            $.confirm.title.text('<%-lang['Fix Video']%> : '+e.file)
            e.html='<%-lang.FixVideoMsg%>'
            e.html+='<video class="video_video" autoplay loop controls><source src="'+e.p.find('[download]').attr('href')+'" type="video/'+e.mon.ext+'"></video>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Fix Video',class:'btn-warning'},function(){
                e.file=e.file.split('.')
                $.ccio.cx({f:'video',ff:'fix',filename:e.file[0],ext:e.file[1],ke:e.ke,mid:e.mid});
            });
        break;
        case'delete':
            e.href=e.p.find('[download]').attr('href')
            if(!e.href||e.href===''){
                e.href=e.p.attr('href')
            }
            $.confirm.e.modal('show');
            $.confirm.title.text('<%-lang['Delete Video']%> : '+e.file)
            e.html='<%-lang.DeleteVideoMsg%>'
            e.html+='<video class="video_video" autoplay loop controls><source src="'+e.href+'" type="video/'+e.mon.ext+'"></video>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Video',class:'btn-danger'},function(){
                e.file=e.file.split('.')
                $.ccio.cx({f:'video',ff:'delete',filename:e.file[0],ext:e.file[1],ke:e.ke,mid:e.mid});
            });
        break;
        case'download':
            e.preventDefault();
            switch(e.e.attr('host')){
                    <% if(config.DropboxAppKey){ %>
                case'dropbox':
                    Dropbox.save(e.e.attr('href'),e.e.attr('download'),{progress: function (progress) {$.ccio.log(progress)},success: function () {
                        $.ccio.log("<%-lang.dropBoxSuccess%>");
                    }});
                break;
                    <% } %>
            }
        break;
    }
})
.on('change','[localStorage]',function(e){
    e.e=$(this)
    e.localStorage=e.e.attr('localStorage')
    //pre-event
    switch(e.localStorage){
        case'montage':
            if($('#monitors_live').hasClass('montage')){
                e.montageClick=$('[system="montage"]').first();
                e.montageClick.click()
            }
        break;
    }
    e.value=e.e.val()
    $.ccio.op(e.localStorage,e.value)
    //finish event
    switch(e.localStorage){
        case'montage':
            if(e.montageClick){
                $.ccio.init('montage');
                setTimeout(function(){
                    e.montageClick.click()
                },500)
            }
        break;
    }
})
.on('click','[system]',function(e){
  var e={}; 
    e.e=$(this),
    e.a=e.e.attr('system');//the function
    switch(e.a){
        case'montage':
            e.startup=$.ccio.op().startup
            if(!e.startup){e.startup={}}
            e.container=$('#monitors_live').toggleClass('montage')
            if(!e.container.hasClass('montage')){
                e.startup.montage="0"
            }else{
                e.startup.montage=1
            }
            $.ccio.init('montage')
            $.ccio.op('startup',e.startup)
        break;
        case'switch':
            e.switch=e.e.attr('switch');
            e.o=$.ccio.op().switches
            if(!e.o){
                e.o={}
            }
            if(!e.o[e.switch]){
                e.o[e.switch]=0
            }
            if(e.o[e.switch]===1){
                e.o[e.switch]=0
            }else{
                e.o[e.switch]=1
            }
            $.ccio.op('switches',e.o)
            switch(e.switch){
                case'monitorOrder':
                    $.ccio.init('monitorOrder',{no:'#monitors_list'})
                break;
            }
            switch(e.e.attr('type')){
                case'text':
                    if(e.o[e.switch]===1){
                        e.e.addClass('text-success')
                    }else{
                        e.e.removeClass('text-success')
                    }
                break;
            }
        break;
        case'cronStop':
            $.ccio.cx({f:'cron',ff:'stop'})
        break;
        case'cronRestart':
            $.ccio.cx({f:'cron',ff:'restart'})
        break;
        case'jpegToggle':
            e.cx={f:'monitor',ff:'jpeg_on'};
            if($.ccio.op().jpeg_on===true){
                e.cx.ff='jpeg_off';
            }
            $.ccio.cx(e.cx)
        break;
    }
})
.on('click','[class_toggle]',function(e){
    e.e=$(this);
    e.n=e.e.attr('data-target');
    e.v=e.e.attr('class_toggle');
    e.o=$.ccio.op().class_toggle;
    if($(e.n).hasClass(e.v)){e.t=0}else{e.t=1}
    if(!e.o)e.o={};
    e.o[e.n]=[e.v,e.t];
    $.ccio.op('class_toggle',e.o)
    $(e.n).toggleClass(e.v);
})
.on('change','[dropdown_toggle]',function(e){
    e.e=$(this);
    e.n=e.e.attr('dropdown_toggle');
    e.v=e.e.val();
    e.o=$.ccio.op().dropdown_toggle;
    if(!e.o)e.o={};
    e.o[e.n]=e.v;
    $.ccio.op('dropdown_toggle',e.o)
})
//monitor functions
.on('click','[monitor]',function(){
  var e={}; 
    e.e=$(this),
        e.a=e.e.attr('monitor'),//the function
        e.p=e.e.parents('[mid]'),//the parent element for monitor item
        e.ke=e.p.attr('ke'),//group key
        e.mid=e.p.attr('mid'),//monitor id
        e.mon=$.ccio.mon[e.mid];//monitor configuration
    switch(e.a){
        case'mode':
            e.mode=e.e.attr('mode')
            if(e.mode){
                $.getJSON('/'+$user.auth_token+'/monitor/'+e.ke+'/'+e.mid+'/'+e.mode,function(d){
                    $.ccio.log(d)
                })
            }
        break;
        case'timelapse':
            $.timelapse.e.modal('show')
            $.timelapse.monitors.find('.monitor').remove()
            $.each($.ccio.mon,function(n,v){
                $.timelapse.monitors.append('<option class="monitor" value="'+v.mid+'">'+v.name+'</option>')
            })
            e.e=$.timelapse.monitors.find('.monitor').prop('selected',false)
            if(e.mid!==''){
                e.e=$.timelapse.monitors.find('.monitor[value="'+e.mid+'"]')
            }
            e.e.first().prop('selected',true)
            $.timelapse.f.submit()
        break;
        case'powerview':
            $.pwrvid.e.modal('show')
            $.pwrvid.m.find('.monitor').remove()
            $.each($.ccio.mon,function(n,v){
                $.pwrvid.m.append('<option class="monitor" value="'+v.mid+'">'+v.name+'</option>')
            })
            e.e=$.pwrvid.m.find('.monitor').prop('selected',false)
            if(e.mid!==''){
                e.e=$.pwrvid.m.find('.monitor[value="'+e.mid+'"]')
            }
            e.e.first().prop('selected',true)
            $.pwrvid.f.submit()
        break;
        case'region':
            if(!e.mon){
                $.ccio.init('note',{title:'<%-lang['Unable to Launch']%>',text:'<%-lang.UnabletoLaunchText%>',type:'error'});
                return;
            }
            e.d=JSON.parse(e.mon.details);
            e.width=$.aM.e.find('[detail="detector_scale_x"]');
            e.height=$.aM.e.find('[detail="detector_scale_y"]');
            e.d.cords=$.aM.e.find('[detail="cords"]').val();
            if(e.width.val()===''){
                e.d.detector_scale_x=320;
                e.d.detector_scale_y=240;
                $.aM.e.find('[detail="detector_scale_x"]').val(e.d.detector_scale_x);
                $.aM.e.find('[detail="detector_scale_y"]').val(e.d.detector_scale_y);
            }else{
                e.d.detector_scale_x=e.width.val();
                e.d.detector_scale_y=e.height.val();
            }
            
            $.zO.e.modal('show');
            $.zO.o().attr('width',e.d.detector_scale_x).attr('height',e.d.detector_scale_y);
            $.zO.c.css({width:e.d.detector_scale_x,height:e.d.detector_scale_y});
                if(e.d.cords&&(e.d.cords instanceof Object)===false){
                try{e.d.cords=JSON.parse(e.d.cords);}catch(er){}
            }
            if(!e.d.cords||e.d.cords===''){
                e.d.cords={
                    red:{ name:"red",sensitivity:0.0005, points:[[0,0],[0,100],[100,0]] },
                }
            }
            $.zO.regionViewerDetails=e.d;
            $.zO.initRegionList()
        break;
        case'snapshot':
            $.ccio.snapshot(e,function(url){
                $('#temp').html('<a href="'+url+'" download="'+$.ccio.init('tf')+'_'+e.ke+'_'+e.mid+'.jpg">a</a>').find('a')[0].click();
            });
        break;
        case'control':
            e.a=e.e.attr('control'),e.j=JSON.parse(e.mon.details);
            $.ccio.cx({f:'monitor',ff:'control',direction:e.a,mid:e.mid,ke:e.ke})
        break;
        case'videos_table':case'calendar'://call videos table or calendar
            $.vidview.launcher=$(this);
            e.limit=$.vidview.limit.val();
            if(!$.vidview.current_mid||$.vidview.current_mid!==e.mid){
                $.vidview.current_mid=e.mid
                $.vidview.current_page=1;
                if(e.limit.replace(/ /g,'')===''){
                    e.limit='100';
                }
                if(e.limit.indexOf(',')===-1){
                    e.limit='0,'+e.limit
                }else{
                    e.limit='0,'+e.limit.split(',')[1]
                }
                $.vidview.limit.val(e.limit)
            }
            e.dateRange=$('#videos_viewer_daterange').data('daterangepicker');
            e.videoURL='/'+$user.auth_token+'/videos/'+e.ke+'/'+e.mid+'?limit='+e.limit+'&start='+$.ccio.init('th',e.dateRange.startDate)+'&end='+$.ccio.init('th',e.dateRange.endDate);
            $.getJSON(e.videoURL,function(d){
                d.pages=d.total/100;
                $('.video_viewer_total').text(d.total)
                if(d.pages+''.indexOf('.')>-1){++d.pages}
                $.vidview.page_count=d.pages;
                d.count=1
                $.vidview.pages.empty()
                d.fn=function(drawOne){
                    if(d.count<=$.vidview.page_count){
                        $.vidview.pages.append('<a class="btn btn-primary" page="'+d.count+'">'+d.count+'</a> ')
                        ++d.count;
                        d.fn()
                    }
                }
                d.fn()
                $.vidview.pages.find('[page="'+$.vidview.current_page+'"]').addClass('active')
                e.v=$.vidview.e;
                e.b=e.v.modal('show').find('.modal-body .contents');
                e.t=e.v.find('.modal-title i');
                switch(e.a){
                    case'calendar':
                       e.t.attr('class','fa fa-calendar')
                       e.ar=[];
                        if(d.videos[0]){
                            $.each(d.videos,function(n,v){
                                if(v.status!==0){
                                    var n=$.ccio.mon[v.mid];
                                    if(n){v.title=n.name+' - '+(parseInt(v.size)/1000000).toFixed(2)+'mb';}
                                    v.start=v.time;
                                    v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
                                    e.ar.push(v);
                                }
                            })
                            e.b.html('')
                            try{e.b.fullCalendar('destroy')}catch(er){}
                            e.b.fullCalendar({
                                header: {
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'month,agendaWeek,agendaDay,listWeek'
                                },
                                defaultDate: moment(d.videos[0].time).format('YYYY-MM-DD'),
                                navLinks: true,
                                eventLimit: true,
                                events:e.ar,
                                eventClick:function(f){
                                    $('#temp').html('<div mid="'+f.mid+'" ke="'+f.ke+'" file="'+f.filename+'"><div video="launch" href="'+f.href+'"></div></div>').find('[video="launch"]').click();
                                    $(this).css('border-color', 'red');
                                }
                            });
                            setTimeout(function(){e.b.fullCalendar('changeView','month');e.b.find('.fc-scroller').css('height','auto')},500)
                        }else{
                            e.b.html('<div class="text-center"><%-lang.NoVideosFoundForDateRange%></div>')
                        }
                    break;
                    case'videos_table':
                        e.t.attr('class','fa fa-film')
                        e.tmp='<table class="table table-striped" style="max-height:500px">';
                        e.tmp+='<thead>';
                        e.tmp+='<tr>';
                        e.tmp+='<th><div class="checkbox"><input id="videos_select_all" type="checkbox"><label for="videos_select_all"></label></div></th>';
                        e.tmp+='<th data-field="Closed" data-sortable="true"><%-lang.Closed%></th>';
                        e.tmp+='<th data-field="Ended" data-sortable="true"><%-lang.Ended%></th>';
                        e.tmp+='<th data-field="Started" data-sortable="true"><%-lang.Started%></th>';
                        e.tmp+='<th data-field="Monitor" data-sortable="true"><%-lang.Monitor%></th>';
                        e.tmp+='<th data-field="Filename" data-sortable="true"><%-lang.Filename%></th>';
                        e.tmp+='<th data-field="Size" data-sortable="true"><%-lang['Size (mb)']%></th>';
                        e.tmp+='<th data-field="Watch" data-sortable="true"><%-lang.Watch%></th>';
                        e.tmp+='<th data-field="Download" data-sortable="true"><%-lang.Download%></th>';
                        e.tmp+='<th class="permission_video_delete" data-field="Delete" data-sortable="true"><%-lang.Delete%></th>';
                        e.tmp+='<th class="permission_video_delete" data-field="Fix" data-sortable="true"><%-lang.Fix%></th>';
                        e.tmp+='</tr>';
                        e.tmp+='</thead>';
                        e.tmp+='<tbody>';
                        $.each(d.videos,function(n,v){
                            if(v.status!==0){
                                v.mon=$.ccio.mon[v.mid];
                                v.start=v.time;
                                v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
                                e.tmp+='<tr data-ke="'+v.ke+'" data-status="'+v.status+'" data-mid="'+v.mid+'" data-file="'+v.filename+'">';
                                e.tmp+='<td><div class="checkbox"><input id="'+v.ke+'_'+v.filename+'" name="'+v.filename+'" value="'+v.mid+'" type="checkbox"><label for="'+v.ke+'_'+v.filename+'"></label></div></td>';
                                e.tmp+='<td><span class="livestamp" title="'+v.end+'"></span></td>';
                                e.tmp+='<td title="'+v.end+'">'+moment(v.end).format('h:mm:ss A, MMMM Do YYYY')+'</td>';
                                e.tmp+='<td title="'+v.time+'">'+moment(v.time).format('h:mm:ss A, MMMM Do YYYY')+'</td>';
                                e.tmp+='<td>'+v.mon.name+'</td>';
                                e.tmp+='<td>'+v.filename+'</td>';
                                e.tmp+='<td>'+(parseInt(v.size)/1000000).toFixed(2)+'</td>';
                                e.tmp+='<td><a class="btn btn-sm btn-primary" video="launch" href="'+v.href+'">&nbsp;<i class="fa fa-play-circle"></i>&nbsp;</a></td>';
                                e.tmp+='<td><a class="btn btn-sm btn-success" download="'+v.mid+'-'+v.filename+'" href="'+v.href+'?downloadName='+v.mid+'-'+v.filename+'">&nbsp;<i class="fa fa-download"></i>&nbsp;</a></td>';
                                e.tmp+='<td class="permission_video_delete"><a class="btn btn-sm btn-danger" video="delete">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td>';
                                e.tmp+='<td class="permission_video_delete"><a class="btn btn-sm btn-warning" video="fix">&nbsp;<i class="fa fa-wrench"></i>&nbsp;</a></td>';
                                e.tmp+='</tr>';
                            }
                        })
                        e.tmp+='</tbody>';
                        e.tmp+='</table>';
                        e.b.html(e.tmp);delete(e.tmp)
                        $.ccio.init('ls');
                        $.vidview.e.find('table').bootstrapTable();
                    break;
                }
            })
        break;
        case'fullscreen':
            e.e=e.e.parents('.monitor_item');
            e.e.addClass('fullscreen')
            e.vid=e.e.find('.stream-element')
            if(e.vid.is('canvas')){
                e.doc=$('body')
               e.vid.attr('height',e.doc.height())
               e.vid.attr('width',e.doc.width())
            }
            e.vid=e.vid[0]
            if (e.vid.requestFullscreen) {
              e.vid.requestFullscreen();
            } else if (e.vid.mozRequestFullScreen) {
              e.vid.mozRequestFullScreen();
            } else if (e.vid.webkitRequestFullscreen) {
              e.vid.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        break;
        case'bigify':
            e.m=$('#monitors_live')
            if(e.p.hasClass('selected')){e.m.find('.monitor_item').resize();return}
            $('.monitor_item .videos_list').remove();
            e.e=e.e.parents('.monitor_item');
            if(!e.e.is(':first')){
                e.f=e.m.find('.monitor_item').first().insertAfter(e.e.prev())
                e.e.prependTo('#monitors_live');
                $('#main_canvas .scrollable').animate({scrollTop: $("#monitor_live_"+e.mid).position().top},1000);
//                $.ccio.cx({f:'monitor',ff:'watch_on',id:e.f.attr('mid')})
            }
            e.m.find('.monitor_item').resize();
            e.e=$('#files_recent .videos_list.glM'+e.mid);
            if(e.e.length>1){
                e.e.eq(2).remove();
            }
            $('video').each(function(n,v){if(v.paused){v.play()}})
        break;
        case'watch_on':
            $.ccio.cx({f:'monitor',ff:'watch_on',id:e.mid})
        break;
        case'control_toggle':
            e.e=e.p.find('.PTZ_controls');
            if(e.e.length>0){e.e.remove()}else{e.p.append('<div class="PTZ_controls"><div class="pad"><div class="control top" monitor="control" control="up"></div><div class="control left" monitor="control" control="left"></div><div class="control right" monitor="control" control="right"></div><div class="control bottom" monitor="control" control="down"></div><div class="control middle" monitor="control" control="center"></div></div><div class="btn-group btn-group-sm btn-group-justified"><a title="<%-lang['Zoom In']%>" class="zoom_in btn btn-default" monitor="control" control="zoom_in"><i class="fa fa-search-plus"></i></a><a title="<%-lang['Zoom Out']%>" class="zoom_out btn btn-default" monitor="control" control="zoom_out"><i class="fa fa-search-minus"></i></a></div><div class="btn-group btn-group-sm btn-group-justified"><a title="<%-lang['Enable Nightvision']%>" class="nv_enable btn btn-default" monitor="control" control="enable_nv"><i class="fa fa-moon-o"></i></a><a title="<%-lang['Disable Nightvision']%>" class="nv_disable btn btn-default" monitor="control" control="disable_nv"><i class="fa fa-sun-o"></i></a></div></div>')}
        break;
        case'watch':
            if($("#monitor_live_"+e.mid).length===0||$.ccio.mon[e.mid].watch!==1){
                $.ccio.cx({f:'monitor',ff:'watch_on',id:e.mid})
            }else{
                $("#main_canvas").animate({scrollTop:$("#monitor_live_"+e.mid).offset().top-($('#main_header').height()+10)},500);
            }
        break;
        case'watch_off':
            $.ccio.cx({f:'monitor',ff:'watch_off',id:e.mid})
        break;
        case'delete':
            e.m=$('#confirm_window').modal('show');e.f=e.e.attr('file');
            $.confirm.title.text('<%-lang['Delete Monitor']%> : '+e.mon.name)
            e.html='<%-lang.DeleteMonitorText%>'
            e.html+='<table class="info-table"><tr>';
            $.each(e.mon,function(n,v,g){
                if(n==='host'&&v.indexOf('@')>-1){g=v.split('@')[1]}else{g=v};
                try{JSON.parse(g);return}catch(err){}
                e.html+='<tr><td>'+n+'</td><td>'+g+'</td></tr>';
            })
            e.html+='</tr></table>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Monitor',class:'btn-danger'},function(){
                $.get('/'+$user.auth_token+'/configureMonitor/'+$user.ke+'/'+e.mon.mid+'/delete',function(d){
                    $.ccio.log(d)
                })
            });
        break;
        case'edit':
            e.p=$('#add_monitor'),e.mt=e.p.attr('mid',e.mid).attr('ke',e.ke).find('.modal-title')
            e.p.find('.am_notice').hide()
            e.p.find('[detailcontainer="detector_cascades"]').prop('checked',false).parents('.mdl-js-switch').removeClass('is-checked')
            if(!$.ccio.mon[e.mid]){
                e.p.find('.am_notice_new').show()
                //new monitor
                e.p.find('[monitor="delete"]').hide()
                e.mt.find('span').text('Add'),e.mt.find('i').attr('class','fa fa-plus');
                //default values
                e.values={
                    "mode":"stop",
                    "mid":$.ccio.gid(),
                    "name":"",
                    "protocol":"http",
                    "ext":"mp4",
                    "type":"jpeg",
                    "host":"",
                    "path":"",
                    "port":"",
                    "fps":"1",
                    "width":"640",
                    "height":"480",
                    "details":JSON.stringify({
                            "timestamp_x":"(w-tw)/2",
                            "timestamp_y":"0",
                            "timestamp_color":"white",
                            "timestamp_font_size":"10",
                            "timestamp_box_color":"0x00000000@1",
                            "rtsp_transport":"tcp",
                            "detector_frame":"1",
                            "detector_mail":"0",
                            "fatal_max":"",
                            "groups":"[]",
                            "muser":"",
                            "mpass":"",
                            "sfps":"1",
                            "aduration":"",
                            "snap":"1",
                            "detector":"0",
                            "detector_trigger":null,
                            "detector_save":null,
                            "detector_face":null,
                            "detector_fullbody":null,
                            "detector_car":null,
                            "detector_timeout":"",
                            "detector_fps":"",
                            "detector_scale_x":"640",
                            "detector_scale_y":"480",
                            "detector_send_frames":"1",
                            "detector_record_method":"del",
                            "stream_type":"b64",
                            "stream_vcodec":"libx264",
                            "stream_acodec":"no",
                            "hls_time":"2",
                            "preset_stream":"ultrafast",
                            "hls_list_size":"3",
                            "signal_check":"10",
                            "signal_check_log":"0",
                            "stream_quality":"15",
                            "stream_fps":"2",
                            "stream_scale_x":"",
                            "stream_scale_y":"",
                            "svf":"",
                            "vcodec":"libx264",
                            "crf":"1",
                            "preset_record":"",
                            "acodec":"none",
                            "timestamp":"0",
                            "dqf":"0",
                            "cutoff":"15",
                            "vf":"",
                            "control":"0",
                            "control_stop":"0",
                            "control_url_stop_timeout":"",
                            "control_url_center":"",
                            "control_url_left":"",
                            "control_url_left_stop":"",
                            "control_url_right":"",
                            "control_url_right_stop":"",
                            "control_url_up":"",
                            "control_url_up_stop":"",
                            "control_url_down":"",
                            "control_url_down_stop":"",
                            "cust_input":"",
                            "cust_detect":"",
                            "cust_stream":"",
                            "cust_record":"",
                            "custom_output":"",
                            "loglevel":"warning",
                            "sqllog":"0"
                        }),
                    "shto":"[]",
                    "shfr":"[]"
                }
                e.mt.find('.edit_id').text(e.values.mid);
            }else{
                e.p.find('.am_notice_edit').show()
                //edit monitor
                e.p.find('[monitor="delete"]').show()
                e.mt.find('.edit_id').text(e.mid);
                e.mt.find('span').text('Edit');
                e.mt.find('i').attr('class','fa fa-wrench');
                e.values=$.ccio.mon[e.mid];
            }
            $.aM.selected=e.mid;
            $.aM.import(e)
            try{
                e.tmp='';
                $.each($user.mon_groups,function(n,v){
                    e.tmp+='<li class="mdl-list__item">';
                    e.tmp+='<span class="mdl-list__item-primary-content">';
                    e.tmp+=v.name;
                    e.tmp+='</span>';
                    e.tmp+='<span class="mdl-list__item-secondary-action">';
                    e.tmp+='<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect">';
                    e.tmp+='<input type="checkbox" group value="'+v.id+'" class="mdl-switch__input"';
                    if(e.ss.groups.indexOf(v.id)>-1){e.tmp+=' checked';}
                    e.tmp+=' />';
                    e.tmp+='</label>';
                    e.tmp+='</span>';
                    e.tmp+='</li>';
                })
                $('#monitor_group').html(e.tmp)
            }catch(er){
                //no group, this 'try' will be removed in future.
            };
            componentHandler.upgradeAllRegistered()
            $('#add_monitor').modal('show')
        break;
    }
})

$('.modal').on('hidden.bs.modal',function(){
    $(this).find('video').remove();
    $(this).find('iframe').attr('src','about:blank');
});
$('body')
.on('resize','#monitors_live .monitor_item',function(e){
    e.e=$(this).find('.mdl-card__media');
    e.c=e.e.find('canvas');
    e.c.attr('height',e.e.height());
    e.c.attr('width',e.e.width());
})
.on('keyup','.search-parent .search-controller',function(){
    _this = this;
    $.each($(".search-parent .search-body .search-row"), function() {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
           $(this).hide();
        else
           $(this).show();
    });
})
.on('dblclick','.stream-hud',function(){
    $(this).parents('[mid]').find('[monitor="fullscreen"]').click();
}); 
    //check switch UI
    e.o=$.ccio.op().switches;
    if(e.o){
        $.each(e.o,function(n,v){
            $('[system="switch"][switch="'+n+'"]').each(function(m,b){
                b=$(b);
                switch(b.attr('type')){
                    case'text':
                    if(v===1){
                        b.addClass('text-success')
                    }else{
                        b.removeClass('text-success')
                    }
                    break;
                 }
            })
        })
    }
    //set class toggle preferences
    e.o=$.ccio.op().class_toggle;
    if(e.o){
        $.each(e.o,function(n,v){
            if(v[1]===1){
                $(n).addClass(v[0])
            }else{
                $(n).removeClass(v[0])
            }
        })
    }
    //set dropdown toggle preferences
    e.o=$.ccio.op().dropdown_toggle;
    if(e.o){
        $.each(e.o,function(n,v){
            $('[dropdown_toggle="'+n+'"]').val(v).change()
        })
    }
    //set startup preferences
    e.o=$.ccio.op().startup;
    if(e.o){
        $.each(e.o,function(n,v){
            switch(n){
                case'montage':
                    if(v===1){
                        $('#monitors_live').addClass('montage')
                        $.ccio.init('montage')
                    }
                break;
            }
        })
    }
    //set localStorage input values
    e.o=$.ccio.op();
    if(e.o){
        $.each(e.o,function(n,v){
            if(typeof v==='string'){
                $('[localStorage="'+n+'"]').val(v)
            }
        })
    }
    $("#monitors_list").sortable({
        handle:'.title',
        update: function(event, ui) {
            var arr=[]
            var details=JSON.parse($user.details)
            $("#monitors_list .monitor_block").each(function(n,v){
                arr.push($(this).attr('mid'))
            })
            details.monitorOrder=arr;
            $user.details=JSON.stringify(details)
            $.ccio.cx({f:'monitorOrder',monitorOrder:arr})
            event.o=$.ccio.op().switches;
            if(event.o&&event.o.monitorOrder===1){
                $.ccio.init('monitorOrder',{no:['#monitors_list']})
            }
        }
    });
})
document.addEventListener("fullscreenchange", onFullScreenChange, false);
document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
document.addEventListener("mozfullscreenchange", onFullScreenChange, false);
function onFullScreenChange() {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    if(!fullscreenElement){
        $('.fullscreen').removeClass('fullscreen')
        setTimeout(function(){
            $('canvas.stream-element').resize()
        },2000)
    }
}