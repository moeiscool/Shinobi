$.ccio={fr:$('#files_recent'),mon:{}};
    
    $.ccio.init=function(x,d,z,k){
        if(!k){k={}}
        switch(x){
            case'ArrayBuffertoB64':
                var reader = new FileReader();
                reader.addEventListener("loadend",function(d){console.log(d.target.result);return z(reader.result)});
                reader.readAsDataURL(new Blob([d], {                     
                    type: "image/jpeg"
                }));
            break;
            case 'ls':
                g={e:jQuery('.livestamp')};
                g.e.each(function(){g.v=jQuery(this),g.t=g.v.attr('title');if(!g.t){return};g.v.toggleClass('livestamp livestamped').attr('title',$.ccio.init('t',g.t)).livestamp(g.t);})
                return g.e
            break;
            case't':
                if(!g){g=new Date();}
                return moment(g).format('YYYY-MM-DD HH:mm:ss')
            break;
        }
    }
    $.ccio.tm=function(x,d,z,k){
        var tmp='';if(!d){d={}};
        switch(x){
            case 0://event
                if(!d.filename){d.filename=moment(d.time).format('YYYY-MM-DDTHH-mm-ss')+'.webm';}
                k=[d.mid+'-'+d.filename,'href="/events/'+d.ke+'/'+d.mid+'/'+d.filename+'"'];
                d.mom=moment(d.time),d.hr=parseInt(d.mom.format('HH')),d.per=parseInt(d.hr/24*100);
                tmp+='<li eid="'+d.mid+'" file="'+d.filename+'" title="at '+d.hr+' hours of '+d.mom.format('MMMM DD')+'"><div '+k[1]+' class="event_launch progress-circle progress-'+d.per+'"><span>'+d.hr+'</span></div><div><span title="'+d.time+'" class="livestamp"></span></div><div class="small"><b>Start</b> : '+d.time+'</div><div class="small"><b>End</b> : '+d.end+'</div><div><a class="btn btn-sm btn-danger event_launch" '+k[1]+'><i class="fa fa-play-circle"></i></a> <a download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-download"></i></a> <a monitor="download" host="dropbox" download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-dropbox"></i></a><span class="pull-right">'+(d.mid/100000).toFixed(2)+'mb</span></div></li>';
            break;
            case 1://monitor
                d.src=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}));
                tmp+='<div mid="'+d.mid+'" title="'+d.mid+' : '+d.name+'" class="monitor_block col-md-4"><img monitor="watch" class="snapshot" src="'+d.src+'"><div class="title truncate">'+d.name+'</div><div class="icons"><a class="btn btn-xs btn-default" monitor="edit"><i class="fa fa-wrench"></i></a></div></div>';
                delete(d.src);
            break;
            case 2:
                tmp+='<div mid="'+d.mid+'" id="monitor_live_'+d.mid+'" class="monitor_item col-md-4">';
                switch(d.type){
                    case'jpeg':case'mjpeg':
                        tmp+='<img>';
                    break;
                    case'rtsp':
                        tmp+='<video><source type="video/webm"></video>';
                    break;
                }
                tmp+='<div class="hud super-center"><div class="side-menu scrollable"></div><div class="top_bar"><span class="badge badge-sm badge-danger"><i class="fa fa-eye"></i> <span class="viewers"></span></span></div><div class="bottom_bar"><span class="monitor_name">'+d.name+'</span><div class="pull-right"><a title="Status" class="btn btn-sm btn-danger signal" monitor="watch_on"><i class="fa fa-circle"></i></a> <a title="Enlarge" monitor="bigify" class="btn btn-sm btn-default"><i class="fa fa-expand"></i></a> <a title="Close Stream" monitor="watch_off" class="btn btn-sm btn-danger"><i class="fa fa-times"></i></a></div></div></div></div>';
            break;
        }
        if(z){
            $(z).prepend(tmp)
        }
        return tmp;
    }
    $.ccio.pm=function(x,d,z,k){
        var tmp='';if(!d){d={}};
        switch(x){
            case 0:
                d.mon=$.ccio.mon[d.mid];
                d.ev='.glM'+d.mid+'.events_list ul';d.fr=$.ccio.fr.find(d.ev),d.tmp='';
                if(d.fr.length===0){$.ccio.fr.append('<div class="events_list glM'+d.mid+'"><h3 class="title">'+d.mon.name+'</h3><ul></ul></div>')}
                if(d.events&&d.events.length>0){
                $.each(d.events,function(n,v){
                    tmp+=$.ccio.tm(0,v)
                })
                }else{
                    $('.glM'+d.mid+'.events_list').appendTo($.ccio.fr)
                    tmp+='<li class="notice noevents">No Events for This Monitor</li>';
                }
                $(d.ev).html(tmp);
                $.ccio.init('ls')
            break;
        }
        return tmp;
    }
    $.ccio.op=function(r,rr,rrr){
        if(!rrr){rrr={};};if(typeof rrr === 'string'){rrr={n:rrr}};if(!rrr.n){rrr.n='CloudChat_'+$user.ke+'_'+$user.id}
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
    $.ccio.cx({f:'init',ke:$user.ke,auth:$user.auth,uid:$user.uid})
})
$.ccio.ws.on('f',function (d){
    if(d.f!=='monitor_frame'&&d.f!=='cpu'&&d.f!=='monitor_snapshot'){console.log(d);}
    switch(d.f){
        case'cpu':
            $('.cpu_load .progress-bar').css('width',d.data+'%')
        break;
        case'init_success':
            $('#monitors_list').empty();
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}}
            $.each(d.monitors,function(n,v){
                $.ccio.mon[v.mid]=v;
                $.ccio.tm(1,v,'#monitors_list')
                $.ccio.cx({f:'get',ff:'events',mid:v.mid})
                if(d.o[v.ke]&&d.o[v.ke][v.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})}
            })
        break;
        case'get_events':
            $.ccio.pm(0,d)
        break;
        case'event_build_success':
            if(!d.mid){d.mid=d.id;}
            d.e='.glM'+d.mid+'.events_list ul';$(d.e).find('.notice.noevents').remove();
            $.ccio.tm(0,d,d.e)
        break;
        case'monitor_snapshot':
            switch(d.snapshot_format){
                case'plc':
                    $('[mid="'+d.mid+'"].snapshot').attr('src',placeholder.getData(placeholder.plcimg(d.snapshot)))
                break;
                case'ab':
                    d.reader = new FileReader();
                    d.reader.addEventListener("loadend",function(){$('[mid="'+d.mid+'"].snapshot').attr('src',d.reader.result)});
                    d.reader.readAsDataURL(new Blob([d.snapshot],{type:"image/jpeg"}));
                break;
                case'b64':
                    $('[mid="'+d.mid+'"].snapshot').attr('src','data:image/jpeg;base64,'+d.snapshot)
                break;
            }
        break;
        case'monitor_edit':
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}}
            $.each(d.mon,function(n,v){
                $.ccio.mon[d.mid][n]=v;
            });
            if(d.new===true){$.ccio.tm(1,d.mon,'#monitors_list')}
            switch(d.mon.mode){
                case'stop':$('#monitor_live_'+d.mid).remove();break;
                case'start':case'record':
                    if(d.o[d.ke]&&d.o[d.ke][d.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:d.mid})}
                break;
            }
        break;
        case'monitor_watch_off':case'monitor_stopping':
            d.o=$.ccio.op().watch_on;if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=0;$.ccio.op('watch_on',d.o);
            $.ccio.mon[d.id].watch=0;
            if(d.cnid===$.ccio.ws.id){
                $('#monitor_live_'+d.id).remove();
            }
            $('#monitor_live_'+d.id+' .viewers').html(d.viewers)
        break;
        case'monitor_watch_on':
            d.o=$.ccio.op().watch_on;if(!d.o){d.o={}};if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=1;$.ccio.op('watch_on',d.o);
            $.ccio.mon[d.id].watch=1;
            d.e=$('#monitor_live_'+d.id);
            if(d.e.length==0){
                d.tmp=$.ccio.tm(2,$.ccio.mon[d.id]);
                $('#monitors_live').append(d.tmp)
            }
            $('#monitor_live_'+d.id+' .viewers').html(d.viewers)
        break;
        case'monitor_mjpeg_url':
            $('#monitor_live_'+d.id+' iframe').attr('src',location.protocol+'//'+location.host+d.watch_url);
        break;
        case'monitor_frame':
            switch(d.frame_format){
                case'ab':
                    var reader = new FileReader();
                    reader.addEventListener("loadend",function(){$('[mid="'+d.id+'"] .snapshot,#monitor_live_'+d.id+' img').attr('src',reader.result);});
                    reader.readAsDataURL(new Blob([d.frame],{type:"image/jpeg"}));
                break;
                case'b64':
                    $('[mid="'+d.id+'"] .snapshot,#monitor_live_'+d.id+' img').attr('src','data:image/jpeg;base64,'+d.frame)
                break;
            }
            d.e=$('#monitor_live_'+d.id+' .signal').addClass('btn-success').removeClass('btn-danger');
            clearTimeout($.ccio.mon[d.id]._signal);$.ccio.mon[d.id]._signal=setTimeout(function(){d.e.addClass('btn-danger').removeClass('btn-success');},10000)
        break;
    }
});
$.ccio.cx=function(x){if(!x.ke){x.ke=$user.ke;};if(!x.uid){x.uid=$user.uid;};return $.ccio.ws.emit('f',x)}

//add Monitor
$.AddMon={e:$('#add_monitor')};$.AddMon.f=$.AddMon.e.find('form')
$.AddMon.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    if(e.s.mid.length>3){
        $.ccio.cx({f:'monitor',ff:'add',mon:e.s})
        $.each(e.s,function(n,v){$.ccio.mon[e.s.mid][n]=v;})
        $.AddMon.e.modal('hide')
    }
    return false;
});
//dynamic bindings
$('body')
.on('click','.list_toggle',function(e){
    
})
.on('click','.event_launch',function(e){
    e.preventDefault();e.href=$(this).attr('href'),e.e=$('#event_viewer');
    e.e.find('.modal-body').html('<video class="event_video" video="'+e.href+'" autoplay loop controls><source src="'+e.href+'" type="video/webm"></video>')
    e.e.modal('show');
})
.on('click','[class_toggle]',function(e){
    e.e=$(this);$(e.e.attr('data-target')).toggleClass(e.e.attr('class_toggle'))
})
.on('click','[monitor]',function(e){
    e.e=$(this),e.a=e.e.attr('monitor'),e.id=e.e.parents('[mid]').attr('mid')
    switch(e.a){
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
        case'bigify':
            e.classes='col-md-4 col-md-8 selected';
            e.m=$('#monitors_live')
            $('.monitor_item .events_list').remove();
            e.e=e.e.parents('.monitor_item');
            $('.events_list.glM'+e.id).clone().appendTo(e.e.find('.hud .side-menu')).find('h3').remove()
            if(!e.e.is(':first')){
                e.m.find('.monitor_item').first().insertAfter(e.e.prev())
                e.e.prependTo('#monitors_live');
                $('#main_canvas .scrollable').animate({scrollTop: $("#monitor_live_"+e.id).position().top},1000);
            }
            e.m.find('.selected').toggleClass(e.classes);
            if(!e.e.hasClass('selected')){e.e.toggleClass(e.classes)}
        break;
        case'watch_on':
            $.ccio.cx({f:'monitor',ff:'watch_on',id:e.id})
        break;
        case'watch':
            if($.ccio.mon[e.id].watch!==1){
                $.ccio.cx({f:'monitor',ff:'watch_on',id:e.id})
            }else{
                $("#monitor_live_"+e.id+' [monitor="bigify"]').click()
            }
        break;
        case'watch_off':
            $.ccio.cx({f:'monitor',ff:'watch_off',id:e.id})
        break;
        case'edit':
            $.each($.ccio.mon[e.id],function(n,v){
                $.AddMon.e.find('[name="'+n+'"]').val(v).change()
            })
            $('#add_monitor').modal('show')
        break;
    }
    e.e=$(this);$(e.e.attr('data-target')).toggleClass(e.e.attr('class_toggle'))
})