$.ccio={fr:$('#files_recent'),mon:{}};
    
    $.ccio.gid=function(x){
        if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < x; i++ )
            t += p.charAt(Math.floor(Math.random() * p.length));
        return t;
    };
    $.ccio.init=function(x,d,z,k){
        if(!k){k={}};k.tmp='';
        switch(x){
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
            case'jpegMode':
                $.each($.ccio.mon,function(n,v,x){
                    if(v.watch===1){
                        x=JSON.parse(v.details);
                        x.jpegInterval=parseFloat(x.jpegInterval);
                        if(!x.jpegInterval||x.jpegInterval===''||isNaN(x.jpegInterval)){x.jpegInterval=1}
                        if(!$.ccio.mon[n].jpegInterval){
                            $.ccio.tm('stream-element',$.ccio.mon[v.mid]);
                            clearInterval($.ccio.mon[n].jpegInterval);
                            $.ccio.mon[n].jpegInterval=setInterval(function(){
                                $('#monitor_live_'+v.mid+' .stream-element').attr('src',$user.auth_token+'/jpeg/'+v.ke+'/'+v.mid+'/s.jpg?time='+(new Date()).getTime())
                            },1000/x.jpegInterval);
                        }
                    };
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
            case'filters':
                k.tmp='<option value="" selected>Add New</option>';
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
                                    d.log={type:'Stream Check',msg:'Client side ctream check failed, attempting reconnect.'}
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
                            console.log('signal-check',er)
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
    $.ccio.tm=function(x,d,z,k){
        var tmp='';if(!d){d={}};if(!k){k={}};
        if(d.id&&!d.mid){d.mid=d.id;}
        switch(x){
            case 0://video
                if(!d.filename){d.filename=moment(d.time).format('YYYY-MM-DDTHH-mm-ss')+'.'+d.ext;}
                k=[d.mid+'-'+d.filename,'href="/'+$user.auth_token+'/videos/'+d.ke+'/'+d.mid+'/'+d.filename+'"'];
                d.mom=moment(d.time),d.hr=parseInt(d.mom.format('HH')),d.per=parseInt(d.hr/24*100);
                tmp+='<li class="glM'+d.mid+'" mid="'+d.mid+'" ke="'+d.ke+'" status="'+d.status+'" file="'+d.filename+'"><div title="at '+d.hr+' hours of '+d.mom.format('MMMM DD')+'" '+k[1]+' video="launch" class="progress-circle progress-'+d.per+'"><span>'+d.hr+'</span></div><div><span title="'+d.end+'" class="livestamp"></span></div><div class="small"><b>Start</b> : '+d.time+'</div><div class="small"><b>End</b> : '+d.end+'</div><div><span class="pull-right">'+(parseInt(d.size)/1000000).toFixed(2)+'mb</span><div class="controls"><a class="btn btn-sm btn-primary" video="launch" '+k[1]+'><i class="fa fa-play-circle"></i></a> <a download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-download"></i></a> <a video="download" host="dropbox" download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-dropbox"></i></a> <a title="Delete Video" video="delete" class="btn btn-sm btn-danger permission_video_delete"><i class="fa fa-trash"></i></a></div></div></li>';
            break;
            case 1://monitor icon
                d.src=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}));
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" title="'+d.mid+' : '+d.name+'" class="monitor_block glM'+d.mid+' col-md-4"><img monitor="watch" class="snapshot" src="'+d.src+'"><div class="box"><div class="title monitor_name truncate">'+d.name+'</div><div class="list-data"><div class="monitor_mid">'+d.mid+'</div><div><b>Save as :</b> <span class="monitor_ext">'+d.ext+'</span></div><div><b>Mode :</b> <span class="monitor_mode">'+d.mode+'</span></div></div><div class="icons btn-group"><a class="btn btn-xs btn-default permission_monitor_edit" monitor="edit"><i class="fa fa-wrench"></i></a> <a monitor="calendar" class="btn btn-xs btn-default"><i class="fa fa-calendar"></i></a> <a monitor="videos_table" class="btn btn-xs btn-default"><i class="fa fa-film"></i></a></div></div></div>';
                delete(d.src);
            break;
            case 2://monitor stream
                try{k.d=JSON.parse(d.details);}catch(er){k.d=d.details;}
//                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" id="monitor_live_'+d.mid+'" class="monitor_item glM'+d.mid+' col-md-4">';
                switch(d.mode){
                    case'stop':
                        k.mode='Disabled'
                    break;
                    case'record':
                        k.mode='Record'
                    break;
                    case'start':
                        k.mode='Watch Only'
                    break;
                }
//                tmp+='<div class="hud super-center"><div class="top_bar"><span class="badge badge-sm badge-danger"><i class="fa fa-eye"></i> <span class="viewers"></span></span></div><div class="bottom_bar"></div></div></div></div>';
                
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" id="monitor_live_'+d.mid+'" class="monitor_item glM'+d.mid+' mdl-grid col-md-6">';
                tmp+='<div class="mdl-card mdl-cell mdl-cell--8-col">';
                tmp+='<div class="stream-block no-padding mdl-card__media mdl-color-text--grey-50">';
                tmp+='</div>';
                tmp+='<div class="mdl-card__supporting-text text-center">';
                tmp+='<div class="indifference"><div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar"><span>70%</span></div></div></div>';
                tmp+='<div class="monitor_name">'+d.name+'</div>';
                tmp+='<div class="btn-group btn-group-lg"><a title="Snapshot" monitor="snapshot" class="btn btn-primary"><i class="fa fa-camera"></i></a> <a title="Show Logs" class_toggle="show_logs" data-target=".monitor_item[mid=\''+d.mid+'\'][ke=\''+d.ke+'\']" class="btn btn-warning"><i class="fa fa-exclamation-triangle"></i></a> <a title="Timline" class="btn btn-default" monitor="powerview"><i class="fa fa-map-marker"></i></a> <a title="Enlarge" monitor="control_toggle" class="btn btn-default"><i class="fa fa-arrows"></i></a> <a title="Status Indicator, Click to Recconnect" class="btn btn-danger signal" monitor="watch_on"><i class="fa fa-circle"></i></a> <a title="Calendar" monitor="calendar" class="btn btn-default"><i class="fa fa-calendar"></i></a> <a title="Videos List" monitor="videos_table" class="btn btn-default"><i class="fa fa-film"></i></a> <a class="btn btn-default permission_monitor_edit" monitor="edit"><i class="fa fa-wrench"></i></a> <a title="Enlarge" monitor="bigify" class="hidden btn btn-default"><i class="fa fa-expand"></i></a> <a title="Fullscreen" monitor="fullscreen" class="btn btn-default"><i class="fa fa-arrows-alt"></i></a> <a title="Close Stream" monitor="watch_off" class="btn btn-danger"><i class="fa fa-times"></i></a></div>';
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
                tmp+='<tr api_key="'+d.code+'"><td class="code">'+d.code+'</td><td class="ip">'+d.ip+'</td><td class="time">'+d.time+'</td><td><a class="delete btn btn-xs btn-danger">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td></tr>';
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
                k.e=$('#monitor_live_'+d.mid+' .stream-block');
                k.e.find('.stream-element');
                if($.ccio.op().jpeg_on===true){
                    tmp+='<img class="stream-element">';
                }else{
                    try{k.d=JSON.parse(d.details);}catch(er){k.d=d.details}
                    switch(k.d.stream_type){
                        case'hls':
                            tmp+='<video class="stream-element" controls autoplay></video>';
                        break;
                        case'mjpeg':
                            tmp+='<iframe class="stream-element"></iframe>';
                        break;
                        default://base64
                            tmp+='<canvas class="stream-element"></canvas>';
                        break;
                    }
                }
                k.e.html(tmp).find('.stream-element').resize();
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
                tmp+='               <option value="mid" selected>Monitor ID</option>';
                tmp+='               <option value="ke">Group Key</option>';
                tmp+='               <option value="ext">File Type</option>';
                tmp+='               <option value="time">Start Time</option>';
                tmp+='               <option value="end">End Time</option>';
                tmp+='               <option value="size">Filesize</option>';
                tmp+='               <option value="status">Video Status</option>';
                tmp+='           </select>';
                tmp+='       </label>';
                tmp+='   </div>';
                tmp+='   <div class="form-group col-md-4">';
                tmp+='       <label>';
                tmp+='           <select class="form-control" where="p2">';
                tmp+='               <option value="=" selected>Equal to</option>';
                tmp+='               <option value="!=">Not Equal to</option>';
                tmp+='               <option value=">=">Greater Than or Equal to</option>';
                tmp+='               <option value=">">Greater Than</option>';
                tmp+='               <option value="<">Less Than</option>';
                tmp+='               <option value="<=">Less Than or Equal to</option>';
                tmp+='               <option value="LIKE">Like</option>';
                tmp+='               <option value="=~">Matches</option>';
                tmp+='               <option value="!~">Not Matches</option>';
                tmp+='               <option value="=[]">In</option>';
                tmp+='               <option value="![]">Not In</option>';
                tmp+='           </select>';
                tmp+='       </label>';
                tmp+='   </div>';
                tmp+='   <div class="form-group col-md-4">';
                tmp+='       <label>';
                tmp+='           <input class="form-control" placeholder="Value" title="Value" where="p3">';
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
                try{
                    k.e=$('#monitor_live_'+d.mid);
                    if(JSON.parse(d.details).control=="1"){
                        k.e.find('[monitor="control_toggle"]').show()
                    }else{
                        k.e.find('.pad').remove();
                        k.e.find('[monitor="control_toggle"]').hide()
                    }
                    $.ccio.tm('stream-element',d)
                }catch(re){console.log(re)}
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
    $.ccio.init('id',$user);
    $.ccio.cx({f:'init',ke:$user.ke,auth:$user.auth_token,uid:$user.uid})
})
PNotify.prototype.options.styling = "fontawesome";
$.ccio.ws.on('ping', function(d){
    $.ccio.ws.emit('pong',{beat:1});
});
$.ccio.ws.on('f',function (d){
    if(d.f!=='monitor_frame'&&d.f!=='os'&&d.f!=='video_delete'&&d.f!=='detector_trigger'&&d.f!=='detector_record_timeout_start'&&d.f!=='log'){console.log(d);}
    if(d.viewers){
        $('#monitor_live_'+d.id+' .viewers').html(d.viewers);
    }
    switch(d.f){
        case'api_key_deleted':
            new PNotify({title:'API Key Deleted',text:'Key has been deleted. It will no longer work.',type:'notice'});
            $('[api_key="'+d.form.code+'"]').remove();
        break;
        case'api_key_added':
            new PNotify({title:'API Key Added',text:'You may use this key now.',type:'success'});
            $.ccio.tm(3,d.form,'#api_list')
        break;
        case'filters_change':
            new PNotify({title:'Filters Updated',text:'Your changes have been saved and applied.',type:'success'});
            $user.filters=d.filters;
            $.ccio.init('filters');
        break;
        case'user_settings_change':
            new PNotify({title:'Settings Changed',text:'Your settings have been saved and applied.',type:'success'});
            $.ccio.init('id',d.form);
            $('#custom_css').append(d.form.details.css)
        break;
        case'ffprobe_stop':
            $.pB.o.append('<div><b>END</b></div>');
            $.pB.e.find('.stop').hide();
            $.pB.e.find('[type="submit"]').show();
        break;
        case'ffprobe_start':
            $.pB.o.empty();
            $.pB.e.find('.stop').show();
            $.pB.e.find('[type="submit"]').hide();
        break;
        case'ffprobe_data':
            $.pB.o.append(d.data+'<br>')
        break;
        case'detector_record_timeout_start':
            d.note={type:'Detector',msg:'Record Timeout Start',class:'detector_record_timeout_start'}
            d.e=$('#notifications .note-item.detector_record_timeout_start[ke="'+d.ke+'"][mid="'+d.id+'"]')
            $.ccio.tm(6,d,'#notifications')
        break;
        case'detector_trigger':
            d.e=$('.monitor_item[ke="'+d.ke+'"][mid="'+d.id+'"]')
            if($.ccio.mon[d.id]&&d.e.length>0){
                d.details.confidence=d.details.confidence/10
                d.e.addClass('detector_triggered')
                clearTimeout($.ccio.mon[d.id].detector_trigger_timeout);
                $.ccio.mon[d.id].detector_trigger_timeout=setTimeout(function(){
                    $('.monitor_item[ke="'+d.ke+'"][mid="'+d.id+'"]').removeClass('detector_triggered')
                },5000);
                d.e.find('.indifference .progress-bar').css('width',d.details.confidence).find('span').text(d.details.confidence)
            }
        break;
        case'detector_plugged':
            $('.shinobi-detector').show()
            $('.shinobi-detector_name').text(d.plug)
            $('.shinobi-detector-'+d.plug).show()
            $('.shinobi-detector-invert').hide()
        break;
        case'detector_unplugged':
            $('.shinobi-detector').hide()
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
            d.diskUsed=d.size/1000000;
            d.percent=parseInt((d.diskUsed/d.limit)*100)+'%';
            d.human=parseFloat(d.diskUsed)
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
        case'video_edit':case'video_archive':
            $.ccio.init('data-video',d)
            d.e=$('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]');
            d.e.attr('status',d.status),d.e.attr('data-status',d.status);
        break;
        case'video_delete':
            if($('.modal[mid="'+d.mid+'"]').length>0){$('#video_viewer[mid="'+d.mid+'"]').attr('file',null).attr('ke',null).attr('mid',null).modal('hide')}
            $('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]').remove();
            $('[data-file="'+d.filename+'"][data-mid="'+d.mid+'"][data-ke="'+d.ke+'"]').remove();
        break;
        case'video_build_success':
            if(!d.mid){d.mid=d.id;};d.status=1;
            d.e='.glM'+d.mid+'.videos_list ul,.glM'+d.mid+'.videos_monitor_list ul';$(d.e).find('.notice.novideos').remove();
            $.ccio.tm(0,d,d.e)
        break;
//        case'monitor_stopping':
//            new PNotify({title:'Monitor Stopping',text:'Monitor <b>'+d.mid+'</b> is now off.',type:'notice'});
//        break;
        case'monitor_starting':
//            switch(d.mode){case'start':d.mode='Watch';break;case'record':d.mode='Record';break;}
//            new PNotify({title:'Monitor Starting',text:'Monitor <b>'+d.mid+'</b> is now running in mode <b>'+d.mode+'</b>',type:'success'});
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
            delete($.ccio.mon[d.mid]);
        break;
        case'monitor_edit':
            d.e=$('[mid="'+d.mon.mid+'"][ke="'+d.mon.ke+'"]');
            $.ccio.tm('stream-element',d.mon)
            d.e=$('#monitor_live_'+d.mid);
            if(d.mon.details.control=="1"){d.e.find('[monitor="control_toggle"]').show()}else{d.e.find('.pad').remove();d.e.find('[monitor="control_toggle"]').hide()}
            
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}}
            if(d.mon.details.cords instanceof Object){d.mon.details.cords=JSON.stringify(d.mon.details.cords);}
            d.mon.details=JSON.stringify(d.mon.details);
            if(!$.ccio.mon[d.mid]){$.ccio.mon[d.mid]={}}
            clearInterval($.ccio.mon[d.mid].jpegInterval);
            delete($.ccio.mon[d.mid].jpegInterval);
            $.each(d.mon,function(n,v){
                $.ccio.mon[d.mid][n]=v;
            });
            if(d.new===true){$.ccio.tm(1,d.mon,'#monitors_list')}
            switch(d.mon.mode){
//                case'stop':d.e.remove();break;
                case'start':case'record':
                    if(d.o[d.ke]&&d.o[d.ke][d.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:d.mid})}
                break;
            }
            
            d.e=$('.glM'+d.mon.mid);
            d.e.find('.monitor_name').text(d.mon.name)
            d.e.find('.monitor_mid').text(d.mon.mid)
            d.e.find('.monitor_ext').text(d.mon.ext);
                switch(d.mon.mode){
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
            $.gR.drawList();
            new PNotify({title:'Monitor Saved',text:'Your monitor has been saved.',type:'success'});
        break;
        case'mode_jpeg_off':
            $.ccio.op('jpeg_on',"0");
            $.each($.ccio.mon,function(n,v,x){
                clearInterval($.ccio.mon[n].jpegInterval);
                delete($.ccio.mon[n].jpegInterval);
                if(v.watch===1){
                    $.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})
                }
            });
            $('body').removeClass('jpegMode')
        break;
        case'mode_jpeg_on':
            $.ccio.op('jpeg_on',true);
            $.ccio.init('jpegMode');
            $('body').addClass('jpegMode')
        break;
        case'monitor_watch_off':case'monitor_stopping':
            d.o=$.ccio.op().watch_on;if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=0;$.ccio.op('watch_on',d.o);
            if($.ccio.mon[d.id]){
                clearInterval($.ccio.mon[d.id].jpegInterval);
                delete($.ccio.mon[d.id].jpegInterval);
                clearTimeout($.ccio.mon[d.id].sk)
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
            if(d.e.length==0){
                $.ccio.tm(2,$.ccio.mon[d.id],'#monitors_live');
                $.ccio.init('dragWindows')
            }
            d.d=JSON.parse($.ccio.mon[d.id].details);
            $.ccio.tm('stream-element',$.ccio.mon[d.id]);
            if($.ccio.op().jpeg_on===true){
                $.ccio.init('jpegMode');
            }else{
                switch(d.d.stream_type){
                    case'hls':
                        d.url=$user.auth_token+'/hls/'+d.ke+'/'+d.id+'/s.m3u8';
                        var video = $('#monitor_live_'+d.id+' .stream-element')[0];
                        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)||(navigator.userAgent.match(/(Safari)/)&&!navigator.userAgent.match('Chrome'))) {
                            video.src=d.url;
                            if (video.paused) {
                                video.play();
                            }
                        }else{
                            if($.ccio.mon[d.id].hls){$.ccio.mon[d.id].hls.destroy()}
                            $.ccio.mon[d.id].hls = new Hls();
                            $.ccio.mon[d.id].hls.loadSource(d.url);
                            $.ccio.mon[d.id].hls.attachMedia(video);
                            $.ccio.mon[d.id].hls.on(Hls.Events.MANIFEST_PARSED,function() {
                                if (video.paused) {
                                    video.play();
                                }
                            });
                        }
                        clearTimeout($.ccio.mon[d.id].sk);
                        if(d.d.signal_check!=='0'){
                            $.ccio.mon[d.id].sk=setTimeout(function(){
                                $.ccio.init('signal-check',d)
                            },15000)
                        }
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
                $.getJSON('/'+$user.auth_token+'/videos/'+d.ke+'/'+d.id+'?limit=10',function(f){
                    $.ccio.pm(0,{videos:f,ke:d.ke,mid:d.id})
                })
            }
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
                console.log('base64 frame')
            }
            $.ccio.init('signal',d);
        break;
        case'onvif':
            if(d.url){d.url=$.ccio.init('jsontoblock',d.url)}else{d.url='URL not Found'}
            $('#onvif_probe .output_data').append('<tr><td class="ip">'+d.ip+'</td><td class="port">'+d.port+'</td><td>'+$.ccio.init('jsontoblock',d.info)+'</td><td class="url">'+d.url+'</td><td class="date">'+d.date+'</td><td><a class="btn btn-sm btn-primary copy">&nbsp;<i class="fa fa-copy"></i>&nbsp;</a></td></tr>')
        break;
    }
    delete(d);
});
$.ccio.cx=function(x){if(!x.ke){x.ke=$user.ke;};if(!x.uid){x.uid=$user.uid;};return $.ccio.ws.emit('f',x)}

$(document).ready(function(e){
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
$.oB={e:$('#onvif_probe')};$.oB.f=$.oB.e.find('form');$.oB.o=$.oB.e.find('.output_data');
$.oB.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    $.oB.o.empty();
    $.ccio.cx({f:'onvif',ip:e.s.ip,port:e.s.port,user:e.s.user,pass:e.s.pass})
    setTimeout(function(){
        if($.oB.o.find('tr').length===0){
            $.oB.o.append('<td class="text-center">Sorry, nothing was found.</td>')
        }
    },5000)
    return false;
});
$.oB.e.on('click','.copy',function(e){
    e.e=$(this).parents('tr');
    $('.hidden-xs [monitor="edit"]').click();
    e.host=e.e.find('.ip').text();
    if($.oB.e.find('[name="user"]').val()!==''){
        e.host=$.oB.e.find('[name="user"]').val()+':'+$.oB.e.find('[name="pass"]').val()+'@'+e.host
    }
    $.aM.e.find('[name="host"]').val(e.host)
    $.aM.e.find('[name="port"]').val(e.e.find('.port').text())
    $.aM.e.find('[name="type"] [value="h264"]').prop('selected',true).parent().change()
    $.aM.e.find('[name="path"]').val($.ccio.init('getLocation',e.e.find('.url b:contains("uri")').next().text().trim().replace('rtsp','http')).pathname)
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
    e={};
    e.tmp='';
    $.each($.ccio.init('monGroup'),function(n,v){
        e.tmp+='<li class="mdl-menu__item" group="'+n+'">'+$user.mon_groups[n].name+'</li>'
    })
    $.gR.e.html(e.tmp)
}
$.gR.e.on('click','[group]',function(){
    e={};
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
$.zO.initCanvas=function(){
    e={};
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
        e.re=$('#region_editor_live').find('iframe');
        e.src='/'+$user.auth_token+'/embed/'+$user.ke+'/'+$.aM.selected+'/fullscreen|jquery'
        if(e.re.attr('src')!==e.src){
           e.re.attr('src',e.src)
        }
        e.re.attr('width',$.zO.regionViewerDetails.detector_scale_x)
        e.re.attr('height',$.zO.regionViewerDetails.detector_scale_y)
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
    $.zO.initCanvas();
})
$.zO.e.find('.erase').click(function(e){
    if(Object.keys($.zO.regionViewerDetails.cords).length>1){
        delete($.zO.regionViewerDetails.cords[$.zO.rl.val()]);
    }
    $.zO.initRegionList();
    //$.zO.rl.append('<option value="'+e.gid+'">'+e.gid+'</option>');
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
    e.gid=$.ccio.gid(5);
    e.save={};
    $.each($.zO.regionViewerDetails.cords,function(n,v){
        if(v&&v!==null&&v!=='null'){
            e.save[n]=v;
        }
    })
    $.zO.regionViewerDetails.cords=e.save;
    $.zO.regionViewerDetails.cords[e.gid]={name:e.gid,sensitivity:0.0005,points:[[0,0],[0,100],[100,0]]};
    console.log($.zO.regionViewerDetails.cords)
    $.zO.rl.append('<option value="'+e.gid+'">'+e.gid+'</option>');
    $.zO.rl.val(e.gid)
    $.zO.rl.change();
});
//probe
$.pB={e:$('#probe')};$.pB.f=$.pB.e.find('form');$.pB.o=$.pB.e.find('.output_data');
$.pB.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.s.url=e.s.url.trim();
    if(e.s.url.indexOf('-i ')===-1){
        e.s.url='-i '+e.s.url
    }
    $.ccio.cx({f:'ffprobe',query:e.s.url})
    return false;
});
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
        new PNotify({title:'Configuration Invalid',text:e.er.join('<br>'),type:'error'});
        return;
    }
        $.ccio.cx({f:'monitor',ff:'add',mon:e.s})
        if(!$.ccio.mon[e.s.mid]){$.ccio.mon[e.s.mid]={}}
        $.each(e.s,function(n,v){$.ccio.mon[e.s.mid][n]=v;})
        $.aM.e.modal('hide')
    return false;
});
$.aM.e.on('change','[group]',function(){
    e={};
    e.e=$.aM.e.find('[group]:checked');
    e.s=[];
    e.e.each(function(n,v){
        e.s.push($(v).val())
    });
    $.aM.e.find('[detail="groups"]').val(JSON.stringify(e.s)).change()
})
$.aM.e.find('.probe_config').click(function(){
    e={};
    e.host=$.aM.e.find('[name="host"]').val();
    e.protocol=$.aM.e.find('[name="protocol"]').val();
    e.port=$.aM.e.find('[name="port"]').val();
    e.path=$.aM.e.find('[name="path"]').val();
    if($.aM.e.find('[name="type"]').val()==='local'){
        e.url=e.path;
    }else{
        e.url=$.ccio.init('url',e)+e.path;
    }
    $.pB.e.find('[name="url"]').val(e.url);
    $.pB.f.submit();
    $.pB.e.modal('show');
})
$.aM.e.find('.import_config').click(function(e){
    e={};e.e=$(this);e.mid=e.e.parents('[mid]').attr('mid');
    $.confirm.e.modal('show');
    $.confirm.title.text('Import Monitor Configuration')
    e.html='Doing this will overrwrite any changes currently not saved. Imported changes will only be applied when you press <b>Save</b>.<div style="margin-top:15px"><div class="form-group"><textarea placeholder="Paste JSON here." class="form-control"></textarea></div><label class="upload_file btn btn-primary btn-block"> Upload File <input class="upload" type=file name="files[]"></label></div>';
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
            $.each(e.values,function(n,v){
                $.aM.e.find('[name="'+n+'"]').val(v).change()
            })
            e.ss=JSON.parse(e.values.details);
            $.aM.f.find('[detail]').each(function(n,v){
                v=$(v).attr('detail');if(!e.ss[v]){e.ss[v]=''}
            })
            $.each(e.ss,function(n,v){
                $.aM.e.find('[detail="'+n+'"]').val(v).change();
            })
            $.aM.e.modal('show')
        }catch(err){
            console.log(err)
            new PNotify({title:'Invalid JSON',text:'Please ensure this is a valid JSON string for Shinobi monitor configuration.',type:'error'})
        }
    });
});
$.aM.e.find('.save_config').click(function(e){
    e={};e.e=$(this);e.mid=e.e.parents('[mid]').attr('mid');e.s=$.aM.f.serializeObject();
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
});
$.aM.f.find('[name="type"]').change(function(e){
    e.e=$(this);
    e.v=e.e.val();
    $.aM.f.find('.h_t_input').hide()
    $.aM.f.find('.h_t_'+e.v).show();
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
$.aM.e.on('dblclick','.edit_id',function(e){
    $.aM.e.find('[name="mid"]').parents('.form-group').toggle('show')
})
//api window
$.apM={e:$('#apis')};$.apM.f=$.apM.e.find('form');
$.apM.md=$.apM.f.find('[detail]');
$.apM.md.change($.ccio.form.details);
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
    $.ccio.cx({f:'api',ff:'delete',form:{code:e.code}})
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
        e.name='Add New';
        $.fI.f.find('[name="id"]').val($.ccio.gid(5));
        $.ccio.tm('filters-where');
    }
    $.fI.e.find('.filter_name').text(e.name)
}).change()
$.fI.f.find('.delete').click(function(e){
    $.confirm.title.text('Delete Filter : '+e.mon.name)
    e.html='Do you want to delete this filter? You cannot recover it.'
    e.html+='<table class="info-table"><tr>';
    $.each(e.mon,function(n,v,g){
        if(n==='host'&&v.indexOf('@')>-1){g=v.split('@')[1]}else{g=v};
        try{JSON.parse(g);return}catch(err){}
        e.html+='<tr><td>'+n+'</td><td>'+g+'</td></tr>';
    })
    e.html+='</tr></table>';
    $.confirm.body.html(e.html)
    $.confirm.click({title:'Delete Filter',class:'btn-danger'},function(){
        $.ccio.cx({f:'settings',ff:'filters',fff:'delete',form:e.s})
    });
})
$.fI.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    console.log(e.s)
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    e.s.where={};
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
    if(e.s.pass!==''&&e.password_again===e.s.pass){e.er.push('Passwords don\'t match')};
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
$.vidview={e:$('#videos_viewer')};
$.vidview.f=$.vidview.e.find('form')
$('#videos_viewer_daterange').daterangepicker({
    startDate:moment().subtract(moment.duration("5:00:00")),
    endDate:moment(),
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
$.vidview.e.find('.delete_selected').click(function(e){
    e.s=$.vidview.f.serializeObject();
    $.confirm.e.modal('show');
    $.confirm.title.text('Delete Selected Videos')
    e.html='Do you want to delete these videos? You cannot recover them.<div style="margin-bottom:15px"></div>'
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
//POWER videos window
$.pwrvid={e:$('#pvideo_viewer')};
$.pwrvid.d=$('#vis_pwrvideo'),
$.pwrvid.m=$('#vis_monitors'),
$.pwrvid.lv=$('#live_view'),
$.pwrvid.dr=$('#pvideo_daterange'),
$.pwrvid.vp=$('#video_preview');
$.pwrvid.dr.daterangepicker({
    startDate:moment().subtract(moment.duration("5:00:00")),
    endDate:moment(),
    timePicker: true,
    timePickerIncrement: 30,
    locale: {
        format: 'MM/DD/YYYY h:mm A'
    }
},function(start, end, label){
    $.pwrvid.drawTimeline($.pwrvid.m.find('.active').attr('timeline'))
});
$('#pvideo_show_events').change(function(){
    $.pwrvid.drawTimeline($.pwrvid.m.find('.active').attr('timeline'))
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
            e.e.find('i').toggleClass('fa-play fa-pause')
            
            if(e.e.find('i').hasClass('fa-play')){
                e.video.play()
            }else{
                e.video.pause()
            }
        break;
        case'stepFrontFront':
            e.video.playbackRate = 5;
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
                   e.video.currentTime += -.1;
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
            if(e.status==1){
                $.get(e.href+'/status/2',function(d){
                })
            }
            $.pwrvid.video={filename:e.filename,href:e.href,mid:e.mon.mid,ke:e.mon.ke}
        break;
    }
})
$.pwrvid.drawTimeline=function(mid){
    e={};
    e.live_header=$.pwrvid.lv.find('h3 span');
    e.live=$.pwrvid.lv.find('iframe');
    e.dateRange=$.pwrvid.dr.data('daterangepicker');
    e.dateRange={startDate:e.dateRange.startDate,endDate:e.dateRange.endDate}
    e.videoURL='/'+$user.auth_token+'/videos/'+$user.ke+'/'+mid;
    e.eventURL='/'+$user.auth_token+'/events/'+$user.ke+'/'+mid;
    e.videoURL+='?limit=100&start='+$.ccio.init('th',e.dateRange.startDate)+'&end='+$.ccio.init('th',e.dateRange.endDate);
    e.eventURL+='/500/'+$.ccio.init('th',e.dateRange.startDate)+'/'+$.ccio.init('th',e.dateRange.endDate);
    e.live_header.text($.ccio.mon[mid].name)
    e.live.attr('src','/'+$user.auth_token+'/embed/'+$user.ke+'/'+mid+'/fullscreen|jquery')
    
    $.getJSON(e.eventURL,function(events){
        $.getJSON(e.videoURL,function(videos){
            if($.pwrvid.t&&$.pwrvid.t.destroy){$.pwrvid.t.destroy()}
            var items=[];
            if($('#pvideo_show_events').is(':checked')){
                $.each(events,function(n,v){
                    v.mon=$.ccio.mon[v.mid];
                    items.push({src:v,x:v.time,yy:v.details.confidence})
                });
            }
            $.each(videos,function(n,v){
                v.mon=$.ccio.mon[v.mid];
                v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
                if(v.status>0){
                    items.push({src:v,x:v.time,y:moment(v.time).diff(moment(v.end),'minutes')/-1})

//                    var ts = new Date(v.time);
//                    ts.setSeconds(ts.getSeconds() + 10)
//                    var te = new Date(v.end);
//                    te.setSeconds(te.getSeconds() - 10)
//                    items.push({id:n,content:'<div mid="'+v.mid+'" ke="'+v.ke+'" status="'+v.status+'" file="'+v.filename+'"><a preview="video" href="'+v.href+'" class="btn btn-xs btn-primary">&nbsp;<i class="fa fa-play-circle"></i>&nbsp;</a> '+v.mon.name+' - '+v.filename,start:ts,end:te})
                }
            });
            e.n=$.pwrvid.e.find('.nodata').hide()
            if($.pwrvid.chart){
               $.pwrvid.chart.setData(items)
            }
            if(items.length>0){
                if(!$.pwrvid.chart){
                    $.pwrvid.chart=Morris.Line({
                      element: 'vis_pwrvideo',
                      resize: true,
                      data: items,
                      xkey: 'x',
                      ykeys: ['y','yy'],
                      labels: ['Minutes','Motion']
                    })
                    $.pwrvid.chart.on('click', function(i,r){
                        if(!r||r.yy){return}
                        $.pwrvid.e.find('.temp').html('<li class="glM'+r.src.mid+'" mid="'+r.src.mid+'" ke="'+r.src.ke+'" status="'+r.src.status+'" file="'+r.src.filename+'"><a class="btn btn-sm btn-primary" preview="video" href="'+r.src.href+'"><i class="fa fa-play-circle"></i></a></li>').find('a').click()
                    });
                }
                $.pwrvid.d.resize()
            }else{
                e.n.show()
            }
        })
    })
}
$.pwrvid.e.on('click','[timeline]',function(){
    e={e:$(this)};
    $.pwrvid.e.find('[timeline]').removeClass('active');
    e.e.addClass('active');
    $.pwrvid.drawTimeline(e.e.attr('timeline'))
})
$.pwrvid.e.on('hidden.bs.modal',function(e){
    $(this).find('iframe').attr('src','')
    $.pwrvid.vp.find('.holder').empty()
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
        case'delete':
            $.confirm.e.modal('show');
            $.confirm.title.text('Delete Video : '+e.file)
            e.html='Do you want to delete this video? You cannot recover it.'
            e.html+='<video class="video_video" autoplay loop controls><source src="'+e.p.find('[download]').attr('href')+'" type="video/'+e.mon.ext+'"></video>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Video',class:'btn-danger'},function(){
                e.file=e.file.split('.')
                $.ccio.cx({f:'video',ff:'delete',filename:e.file[0],ext:e.file[1],ke:e.ke,mid:e.mid});
            });
        break;
        case'download':
            e.preventDefault();
            switch(e.e.attr('host')){
                case'dropbox':
                    Dropbox.save(e.e.attr('href'),e.e.attr('download'),{progress: function (progress) {console.log(progress)},success: function () {
                        console.log("Success! Files saved to your Dropbox.");
                    }});
                break;
            }
        break;
    }
})
.on('click','[system]',function(e){
    e={}; 
    e.e=$(this),
    e.a=e.e.attr('system');//the function
    switch(e.a){
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
//monitor functions
.on('click','[monitor]',function(){
    e={}; 
    e.e=$(this),
        e.a=e.e.attr('monitor'),//the function
        e.p=e.e.parents('[mid]'),//the parent element for monitor item
        e.ke=e.p.attr('ke'),//group key
        e.mid=e.p.attr('mid'),//monitor id
        e.mon=$.ccio.mon[e.mid];//monitor configuration
    switch(e.a){
        case'powerview':
            $.pwrvid.e.modal('show')
            e.e=$.pwrvid.m.find('ul').empty()
            e.fn=function(x){return e.e.append('<a timeline="'+x.mid+'" class="btn btn-primary">'+x.name+'</a>')}
                $.each($.ccio.mon,function(n,v){
                    e.fn(v);
                })
            if(e.mid===''){
                e.e=$.pwrvid.e.find('[timeline]')
            }else{
                e.e=$.pwrvid.e.find('[timeline="'+e.mid+'"]')
            }
            e.e.first().click()
        break;
        case'region':
            if(!e.mon){
                new PNotify({title:'Unable to Launch',text:'Please save new monitor first. Then attempt to launch the region editor.',type:'error'});
                return;
            }
            e.d=JSON.parse(e.mon.details);
            e.width=$.aM.e.find('[detail="detector_scale_x"]');
            e.height=$.aM.e.find('[detail="detector_scale_y"]');
            e.d.cords=$.aM.e.find('[detail="cords"]').val();
            if(e.width.val()===''){
                e.d.detector_scale_x=640;
                e.d.detector_scale_y=480;
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
            console.log(e.d.cords)
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
            e.dateRange=$('#videos_viewer_daterange').data('daterangepicker');
            e.videoURL='/'+$user.auth_token+'/videos/'+e.ke+'/'+e.mid+'?limit=100&start='+$.ccio.init('th',e.dateRange.startDate)+'&end='+$.ccio.init('th',e.dateRange.endDate);
            $.getJSON(e.videoURL,function(d){
                e.v=$.vidview.e;e.o=e.v.find('.options').hide()
                e.b=e.v.modal('show').find('.modal-body .contents');
                e.t=e.v.find('.modal-title i');
                switch(e.a){
                    case'calendar':
                       e.t.attr('class','fa fa-calendar')
                       e.ar=[];
                        $.each(d,function(n,v){
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
                                right: 'month,agendaWeek,agendaDay,listWeek,listDay'
                            },
                            defaultDate: moment().format('YYYY-MM-DD'),
                            navLinks: true,
                            eventLimit: true,
                            events:e.ar,
                            eventClick:function(f){
                                $('#temp').html('<div mid="'+f.mid+'" ke="'+f.ke+'" file="'+f.filename+'"><div video="launch" href="'+f.href+'"></div></div>').find('[video="launch"]').click();
                                $(this).css('border-color', 'red');
                            }
                        });
                        setTimeout(function(){e.b.fullCalendar('changeView','listDay');},500)
                    break;
                    case'videos_table':
                        e.t.attr('class','fa fa-film')
                        e.o.show();
                        e.tmp='<table class="table table-striped" style="max-height:500px">';
                        e.tmp+='<thead>';
                        e.tmp+='<tr>';
                        e.tmp+='<th><div class="checkbox"><input id="videos_select_all" type="checkbox"><label for="videos_select_all"></label></div></th>';
                        e.tmp+='<th data-field="Closed" data-sortable="true">Closed</th>';
                        e.tmp+='<th data-field="Ended" data-sortable="true">Ended</th>';
                        e.tmp+='<th data-field="Started" data-sortable="true">Started</th>';
                        e.tmp+='<th data-field="Monitor" data-sortable="true">Monitor</th>';
                        e.tmp+='<th data-field="Filename" data-sortable="true">Filename</th>';
                        e.tmp+='<th data-field="Size" data-sortable="true">Size (mb)</th>';
                        e.tmp+='<th data-field="Watch" data-sortable="true">Watch</th>';
                        e.tmp+='<th data-field="Download" data-sortable="true">Download</th>';
                        e.tmp+='<th class="permission_video_delete" data-field="Delete" data-sortable="true">Delete</th>';
                        e.tmp+='</tr>';
                        e.tmp+='</thead>';
                        e.tmp+='<tbody>';
                        $.each(d,function(n,v){
                            if(v.status!==0){
                                v.start=v.time;
                                v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
                                e.tmp+='<tr data-ke="'+v.ke+'" data-status="'+v.status+'" data-mid="'+v.mid+'" data-file="'+v.filename+'">';
                                e.tmp+='<td><div class="checkbox"><input id="'+v.ke+'_'+v.filename+'" name="'+v.filename+'" value="'+v.mid+'" type="checkbox"><label for="'+v.ke+'_'+v.filename+'"></label></div></td>';
                                e.tmp+='<td><span class="livestamp" title="'+v.end+'"></span></td>';
                                e.tmp+='<td>'+v.end+'</td>';
                                e.tmp+='<td>'+v.time+'</td>';
                                e.tmp+='<td>'+v.mid+'</td>';
                                e.tmp+='<td>'+v.filename+'</td>';
                                e.tmp+='<td>'+(parseInt(v.size)/1000000).toFixed(2)+'</td>';
                                e.tmp+='<td><a class="btn btn-sm btn-primary" video="launch" href="'+v.href+'">&nbsp;<i class="fa fa-play-circle"></i>&nbsp;</a></td>';
                                e.tmp+='<td><a class="btn btn-sm btn-success" download="'+v.mid+'-'+v.filename+'" href="'+v.href+'">&nbsp;<i class="fa fa-download"></i>&nbsp;</a></td>';
                                e.tmp+='<td class="permission_video_delete"><a class="btn btn-sm btn-danger" video="delete">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td>';
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
            e.vid=e.e.find('.stream-element')[0]
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
            $('.videos_list.glM'+e.mid).clone().appendTo(e.e.find('.hud .videos_monitor_list')).find('h3').remove()
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
            e.e=e.p.find('.pad');
            if(e.e.length>0){e.e.remove()}else{e.p.append('<div class="pad"><div class="control top" monitor="control" control="up"></div><div class="control left" monitor="control" control="left"></div><div class="control right" monitor="control" control="right"></div><div class="control bottom" monitor="control" control="down"></div><div class="control middle" monitor="control" control="center"></div></div>')}
        break;
        case'watch':
            if($("#monitor_live_"+e.mid).length===0||$.ccio.mon[e.mid].watch!==1){
                $.ccio.cx({f:'monitor',ff:'watch_on',id:e.mid})
            }else{
//                $("#monitor_live_"+e.mid+' [monitor="bigify"]').click()
            }
        break;
        case'watch_off':
            $.ccio.cx({f:'monitor',ff:'watch_off',id:e.mid})
        break;
        case'delete':
            e.m=$('#confirm_window').modal('show');e.f=e.e.attr('file');
            $.confirm.title.text('Delete Monitor : '+e.mon.name)
            e.html='Do you want to delete this monitor? You cannot recover it. The files for this ID will remain in the filesystem. If you choose to recreate a monitor with the same ID the videos and events will become visible in the dashboard.'
            e.html+='<table class="info-table"><tr>';
            $.each(e.mon,function(n,v,g){
                if(n==='host'&&v.indexOf('@')>-1){g=v.split('@')[1]}else{g=v};
                try{JSON.parse(g);return}catch(err){}
                e.html+='<tr><td>'+n+'</td><td>'+g+'</td></tr>';
            })
            e.html+='</tr></table>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Monitor',class:'btn-danger'},function(){
                $.ccio.cx({f:'monitor',ff:'delete',mid:e.mid,ke:e.ke});
            });
        break;
        case'edit':
            e.p=$('#add_monitor'),e.mt=e.p.attr('mid',e.mid).attr('ke',e.ke).find('.modal-title')
            if(!$.ccio.mon[e.mid]){
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
                            "rtsp_transport":"no",
                            "detector_frame":"1",
                            "detector_mail":"0",
                            "fatal_max":"",
                            "groups":"[]",
                            "muser":"",
                            "mpass":"",
                            "sfps":"1",
                            "aduration":"",
                            "detector":"0",
                            "detector_trigger":null,
                            "detector_save":null,
                            "detector_face":null,
                            "detector_fullbody":null,
                            "detector_car":null,
                            "detector_timeout":"",
                            "detector_fps":"",
                            "detector_scale_x":"",
                            "detector_scale_y":"",
                            "stream_type":"b64",
                            "stream_vcodec":"libx264",
                            "stream_acodec":"no",
                            "hls_time":"2",
                            "preset_stream":"ultrafast",
                            "hls_list_size":"3",
                            "signal_check":"10",
                            "signal_check_log":"0",
                            "stream_quality":"15",
                            "stream_fps":"",
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
                //edit monitor
                e.p.find('[monitor="delete"]').show()
                e.mt.find('.edit_id').text(e.mid);
                e.mt.find('span').text('Edit');
                e.mt.find('i').attr('class','fa fa-wrench');
                e.values=$.ccio.mon[e.mid];
            }
            $.aM.selected=e.mid;
            $.each(e.values,function(n,v){
                $.aM.e.find('[name="'+n+'"]').val(v).change()
            })
            e.ss=JSON.parse(e.values.details);
            e.p.find('[detail]').each(function(n,v){
                v=$(v).attr('detail');if(!e.ss[v]){e.ss[v]=''}
            })
            $.each(e.ss,function(n,v){
                $.aM.e.find('[detail="'+n+'"]').val(v).change();
            });
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

$('#video_viewer,#confirm_window').on('hidden.bs.modal',function(){
    $(this).find('video').remove();
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
}); 

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
})