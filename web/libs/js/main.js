$.ccio={fr:$('#files_recent'),mon:{}};
    
    $.ccio.init=function(x,d,z,k){
        if(!k){k={}};k.tmp='';
        switch(x){
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
            case'tf'://time to filename
                if(!d){d=new Date();}
                return moment(d).format('YYYY-MM-DDTHH-mm-ss')
            break;
            case'id':
                $('.usermail').html(d.mail)
                k.d=JSON.parse(d.details);
                $.sM.e.find('[name="details"]').val(d.details)
                $.sM.e.find('[detail="days"]').val(k.d.days)
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
        }
        return k.tmp;
    }
    $.ccio.tm=function(x,d,z,k){
        var tmp='';if(!d){d={}};if(!k){k={}};
        switch(x){
            case 0://event
                if(!d.filename){d.filename=moment(d.time).format('YYYY-MM-DDTHH-mm-ss')+'.'+d.ext;}
                k=[d.mid+'-'+d.filename,'href="/events/'+d.ke+'/'+d.mid+'/'+d.filename+'"'];
                d.mom=moment(d.time),d.hr=parseInt(d.mom.format('HH'))+1,d.per=parseInt(d.hr/24*100);
                tmp+='<li mid="'+d.mid+'" ke="'+d.ke+'" file="'+d.filename+'"><div title="at '+d.hr+' hours of '+d.mom.format('MMMM DD')+'" '+k[1]+' event="launch" class="progress-circle progress-'+d.per+'"><span>'+d.hr+'</span></div><div><span title="'+d.end+'" class="livestamp"></span></div><div class="small"><b>Start</b> : '+d.time+'</div><div class="small"><b>End</b> : '+d.end+'</div><div><span class="pull-right">'+(parseInt(d.size)/1000000).toFixed(2)+'mb</span><div class="controls"><a class="btn btn-sm btn-primary" event="launch" '+k[1]+'><i class="fa fa-play-circle"></i></a> <a download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-download"></i></a> <a event="download" host="dropbox" download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-dropbox"></i></a> <a title="Delete Event" event="delete" class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></a></div></div></li>';
            break;
            case 1://monitor
                d.src=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}));
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" title="'+d.mid+' : '+d.name+'" class="monitor_block col-md-4"><img monitor="watch" class="snapshot" src="'+d.src+'"><div class="box"><div class="title truncate">'+d.name+'</div><div class="list-data"><div>'+d.mid+'</div><div><b>Save as :</b> '+d.ext+'</div><div><b>Mode :</b> '+d.mode+'</div></div><div class="icons"><a class="btn btn-xs btn-default" monitor="edit"><i class="fa fa-wrench"></i></a> <a monitor="calendar" class="btn btn-xs btn-default"><i class="fa fa-film"></i></a></div></div></div>';
                delete(d.src);
            break;
            case 2:
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" id="monitor_live_'+d.mid+'" class="monitor_item col-md-4"><img>';
//                switch(d.type){
//                    case'jpeg':case'mjpeg':case'h264':
//                        tmp+='<img>';
//                    break;
//                }
                tmp+='<div class="hud super-center"><div class="side-menu scrollable"></div><div class="top_bar"><span class="badge badge-sm badge-danger"><i class="fa fa-eye"></i> <span class="viewers"></span></span></div><div class="bottom_bar"><span class="monitor_name">'+d.name+'</span><div class="pull-right"><a title="Enlarge" monitor="control_toggle" class="btn btn-sm btn-default"><i class="fa fa-arrows"></i></a> <a title="Status" class="btn btn-sm btn-danger signal" monitor="watch_on"><i class="fa fa-circle"></i></a> <div class="btn-group"><a monitor="calendar" class="btn btn-sm btn-default"><i class="fa fa-film"></i></a> <a class="btn btn-sm btn-default" monitor="edit"><i class="fa fa-wrench"></i></a> <a title="Enlarge" monitor="bigify" class="btn btn-sm btn-default"><i class="fa fa-expand"></i></a> <a title="Close Stream" monitor="watch_off" class="btn btn-sm btn-danger"><i class="fa fa-times"></i></a></div></div></div></div></div>';
            break;
        }
        if(z){
            $(z).prepend(tmp)
        }
        switch(x){
            case 0:
                $.ccio.init('ls');
            break;
            case 2:
                try{
            k.e=$('#monitor_live_'+d.mid);
            if(JSON.parse(d.details).control=="1"){k.e.find('[monitor="control_toggle"]').show()}else{k.e.find('.pad').remove();k.e.find('[monitor="control_toggle"]').hide()}
                }catch(re){console.log(re)}
            break;
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
                    if(v.status!==0){
                        tmp+=$.ccio.tm(0,v)
                    }
                })
                }else{
                    $('.glM'+d.mid+'.events_list').appendTo($.ccio.fr)
                    tmp+='<li class="notice noevents">No Events for This Monitor</li>';
                }
                $(d.ev).html(tmp);
                $.ccio.init('ls');
            break;
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
$.ccio.ws.on('f',function (d){
    if(d.f!=='monitor_frame'&&d.f!=='cpu'&&d.f!=='event_delete'){console.log(d);}
    switch(d.f){
        case'log':
            d.l=$('#logs')
            d.tmp='';
            d.tmp+='<li class="log-item">'
            d.tmp+='<span>'
            d.tmp+='<div>'+d.ke+' : <b>'+d.mid+'</b></div>'
            d.tmp+='<span>'+d.log.type+'</span>'
            d.tmp+='<span class="time livestamp" titel="'+d.time+'"></span>'
            d.tmp+='</span>'
            d.tmp+='<span class="message">'
            d.tmp+=$.ccio.init('jsontoblock',d.log.msg);
            d.tmp+='</span>'
            d.tmp+='</li>';
            if(d.l.find('.log-item').length>4){d.l.find('.log-item:last').remove()}
            $('#logs').prepend(d.tmp);$.ccio.init('ls');
        break;
        case'cpu':
            d.data=(d.data*100).toFixed(0)
            $('.cpu_load .progress-bar').css('width',d.data+'%')
        break;
        case'disk':
            d.tmp='';
            $.each(d.data,function(n,v){
                if(v.capacity!==0){
                    d.tmp+='<li class="log-item">'
                    d.tmp+=$.ccio.init('jsontoblock',v);
                    d.tmp+='<div class="progress"><div class="progress-bar progress-bar-primary" role="progressbar" style="width:'+v.capacity*100+'%;"></div></div>'
                    d.tmp+='</li>'
                }
            })
            $('#disk').html(d.tmp)
        break;
        case'init_success':
            $('#monitors_list').empty();
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}};
            $.each(d.monitors,function(n,v){
                $.ccio.mon[v.mid]=v;
                $.ccio.tm(1,v,'#monitors_list')
                $.ccio.cx({f:'get',ff:'events',limit:10,mid:v.mid})
                if(d.o[v.ke]&&d.o[v.ke][v.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})}
            })
        break;
        case'get_events':
            $.ccio.pm(0,d)
        break;
        case'event_delete':
            if($('.modal[mid="'+d.mid+'"]').length>0){$('.modal[mid="'+d.mid+'"]').attr('file',null).attr('ke',null).attr('mid',null).modal('hide')}
            $('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]').remove();
        break;
        case'event_build_success':
            if(!d.mid){d.mid=d.id;}
            d.e='.glM'+d.mid+'.events_list ul';$(d.e).find('.notice.noevents').remove();
            $.ccio.tm(0,d,d.e)
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
            d.e=$('#monitor_live_'+d.mid);
            if(d.mon.details.control=="1"){d.e.find('[monitor="control_toggle"]').show()}else{d.e.find('.pad').remove();d.e.find('[monitor="control_toggle"]').hide()}
            
            d.o=$.ccio.op().watch_on;
            if(!d.o){d.o={}}
            d.mon.details=JSON.stringify(d.mon.details);
            if(!$.ccio.mon[d.mid]){$.ccio.mon[d.mid]={}}
            $.each(d.mon,function(n,v){
                $.ccio.mon[d.mid][n]=v;
            });
            if(d.new===true){$.ccio.tm(1,d.mon,'#monitors_list')}
            switch(d.mon.mode){
                case'stop':d.e.remove();break;
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
                d.tmp=$.ccio.tm(2,$.ccio.mon[d.id],'#monitors_live');
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
                    reader.addEventListener("loadend",function(){$('[mid="'+d.id+'"][ke="'+d.ke+'"] .snapshot,#monitor_live_'+d.id+' img').attr('src',reader.result);delete(reader);});
                    reader.readAsDataURL(new Blob([d.frame],{type:"image/jpeg"}));
                break;
                case'b64':
                    $('[mid="'+d.id+'"][ke="'+d.ke+'"] .snapshot,#monitor_live_'+d.id+' img').attr('src','data:image/jpeg;base64,'+d.frame);
                break;
            }
            delete(d.frame);
            d.e=$('#monitor_live_'+d.id+' .signal').addClass('btn-success').removeClass('btn-danger');
            clearTimeout($.ccio.mon[d.id]._signal);$.ccio.mon[d.id]._signal=setTimeout(function(){d.e.addClass('btn-danger').removeClass('btn-success');},10000)
        break;
    }
    delete(d);
});
$.ccio.cx=function(x){if(!x.ke){x.ke=$user.ke;};if(!x.uid){x.uid=$user.uid;};return $.ccio.ws.emit('f',x)}

//global form functions
$.ccio.form={};
$.ccio.form.details=function(e){
    e.ar={};
    $.each($.aM.md,function(n,v){
        v=$(v);e.ar[v.attr('detail')]=v.val();
    });
    $.aM.f.find('[name="details"]').val(JSON.stringify(e.ar));
};
//add Monitor
$.aM={e:$('#add_monitor')};$.aM.f=$.aM.e.find('form')
$.aM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    if(e.s.mid.length<3){e.er.push('Monitor ID too short')}
    if(e.s.port==''){e.s.port=80}
//    if(e.s.protocol=='rtsp'){e.s.ext='mp4',e.s.type='rtsp'}
    if(e.er.length>0){return}
        $.ccio.cx({f:'monitor',ff:'add',mon:e.s})
        if(!$.ccio.mon[e.s.mid]){$.ccio.mon[e.s.mid]={}}
        $.each(e.s,function(n,v){$.ccio.mon[e.s.mid][n]=v;})
        $.aM.e.modal('hide')
    return false;
});
$.aM.f.find('[name="type"]').change(function(e){
    e.e=$(this);
    if(e.e.val()==='h264'){$.aM.f.find('[name="protocol"]').val('rtsp').change()}
})
$.aM.md=$.aM.f.find('[detail]');
$.aM.md.change($.ccio.form.details)
$.aM.f.find('[name="mode"]').change(function(e){
    e.v=$(this).val();
    $.aM.f.find('.h_m_input').hide()
    $.aM.f.find('.h_m_'+e.v).show();
});
$.aM.f.find('[detail="control"]').change(function(e){
    e.v=$(this).val();
    $.aM.f.find('.h_c_input').hide()
    $.aM.f.find('.h_c_'+e.v).show();
});
$.aM.f.find('[detail="control_stop"]').change(function(e){
    e.v=$(this).val();
    $.aM.f.find('.h_cs_input').hide()
    $.aM.f.find('.h_cs_'+e.v).show();
});
$.aM.f.find('[name="ext"]').change(function(e){
    e.v=$(this).val();
    $.aM.f.find('.h_f_input').hide()
    $.aM.f.find('.h_f_'+e.v).show();
});
$.aM.f.find('[name="type"]').change(function(e){
    e.v=$(this).val();
    $.aM.f.find('.h_t_input').hide()
    $.aM.f.find('.h_t_'+e.v).show();
    e.h=$.aM.f.find('[name="path"]');
    switch(e.v){
        case'local':
            e.h.attr('placeholder','/dev/video0')
        break;
        default:
            e.h.attr('placeholder','/videostream.cgi?1')
        break;
    }
});
$.aM.f.find('[name="protocol"]').change(function(e){
    e.e=$(this);e.v=e.e.val(),e.t=$.aM.f.find('[name="type"]');
//    $.aM.f.find('[name="ext"],[name="type"]').prop('disabled',false)
    switch(e.v){
        case'rtsp':
//            e.t.val('h264').prop('disabled',true)
        break;
        case'http':case'https':
            if(e.t.val()==='h264'){e.t.val('jpeg')}
        break;
    }
})
//settings window
$.sM={e:$('#settings')};$.sM.f=$.sM.e.find('form');
$.sM.md=$.sM.f.find('[detail]');
$.sM.md.change($.ccio.form.details);
$.sM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    $.each(e.s,function(n,v){e.s[n]=v.trim()})
    $.ccio.cx({f:'settings',ff:'edit',form:e.s})
    $.sM.e.modal('hide')
});
//confirm windows
$.confirm={e:$('#confirm_window')};
$.confirm.title=$.confirm.e.find('.modal-title span')
$.confirm.body=$.confirm.e.find('.modal-body')
$.confirm.click=function(x,e){
    if(!x.class){x.class='btn-success'}
    if(!x.title){x.title='Save changes'}
    x.e=$.confirm.e.find('.confirmaction').removeClass('btn-danger btn-warning btn-primary btn-success').addClass(x.class).text(x.title);
    x.e.click(function(){
        x.e.unbind('click');$.confirm.e.modal('hide');e();
    })
}
//dynamic bindings
$('body')
.on('click','.logout',function(e){
    localStorage.removeItem('ShinobiLogin_'+location.host);location.reload();
})
.on('click','[event]',function(e){
    e.e=$(this),e.a=e.e.attr('event'),e.p=e.e.parents('[mid]'),e.ke=e.p.attr('ke'),e.mid=e.p.attr('mid'),e.file=e.p.attr('file'),e.mon=$.ccio.mon[e.mid];
    switch(e.a){
        case'launch':
            e.preventDefault();
            e.href=$(this).attr('href'),e.e=$('#event_viewer');
            e.mon=$.ccio.mon[e.mid];
            e.e.find('.modal-title span').html(e.mon.name+' - '+e.file)
            e.e.find('.modal-body').html('<video class="event_video" video="'+e.href+'" autoplay loop controls><source src="'+e.href+'" type="video/'+e.mon.ext+'"></video>')
            e.e.attr('mid',e.mid);
            e.f=e.e.find('.modal-footer');
            e.f.find('.download_link').attr('href',e.href).attr('download',e.file);
            e.f.find('[monitor="download"][host="dropbox"]').attr('href',e.href);
            e.e.modal('show').attr('ke',e.ke).attr('mid',e.mid).attr('file',e.file);
        break;
        case'delete':
            e.m=$('#confirm_window').modal('show');
            $.confirm.title.text('Delete Event : '+e.file)
            e.html='Do you want to delete this event? You cannot recover it.'
            e.html+='<video class="event_video" autoplay loop controls><source src="'+e.p.find('[download]').attr('href')+'" type="video/'+e.mon.ext+'"></video>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Event',class:'btn-danger'},function(){
                e.file=e.file.split('.')
                $.ccio.cx({f:'event',ff:'delete',status:1,filename:e.file[0],ext:e.file[1],ke:e.ke,mid:e.mid});
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
.on('click','[class_toggle]',function(e){
    e.e=$(this);$(e.e.attr('data-target')).toggleClass(e.e.attr('class_toggle'))
})
.on('click','[monitor]',function(e){
    e.e=$(this),e.a=e.e.attr('monitor'),e.p=e.e.parents('[mid]'),e.ke=e.p.attr('ke'),e.mid=e.p.attr('mid'),e.mon=$.ccio.mon[e.mid]
    switch(e.a){
        case'control':
    e.a=e.e.attr('control'),e.j=JSON.parse(e.mon.details);
//            if(e.j.control='0'){return false;}
            $.ccio.cx({f:'monitor',ff:'control',direction:e.a,mid:e.mid,ke:e.ke})
        break;
        case'calendar':
    $.getJSON('/events/'+e.ke+'/'+e.mid,function(d){
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
    e.v=$('#events_viewer').modal('show').find('.modal-body')
        e.v.fullCalendar('destroy'),e.v.fullCalendar({
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
            $('#temp').html('<div mid="'+f.mid+'" ke="'+f.ke+'" file="'+f.filename+'"><div event="launch" href="'+f.href+'"></div></div>').find('[event="launch"]').click();
            $(this).css('border-color', 'red');
        }
    });
        setTimeout(function(){e.v.fullCalendar( 'changeView','listDay');},500)
    });
         break;
        case'bigify':
            e.classes='col-md-4 col-md-8 selected';
            if(e.p.hasClass('selected')){e.p.toggleClass(e.classes);return}
            e.m=$('#monitors_live')
            $('.monitor_item .events_list').remove();
            e.e=e.e.parents('.monitor_item');
            $('.events_list.glM'+e.mid).clone().appendTo(e.e.find('.hud .side-menu')).find('h3').remove()
            if(!e.e.is(':first')){
                e.m.find('.monitor_item').first().insertAfter(e.e.prev())
                e.e.prependTo('#monitors_live');
                $('#main_canvas .scrollable').animate({scrollTop: $("#monitor_live_"+e.mid).position().top},1000);
            }
            e.m.find('.selected').toggleClass(e.classes);
            if(!e.e.hasClass('selected')){e.e.toggleClass(e.classes)}
        break;
        case'watch_on':
            $.ccio.cx({f:'monitor',ff:'watch_on',id:e.mid})
        break;
        case'control_toggle':
            e.e=e.p.find('.pad');
            if(e.e.length>0){e.e.remove()}else{e.p.append('<div class="pad"><div class="control top" monitor="control" control="up"></div><div class="control left" monitor="control" control="left"></div><div class="control right" monitor="control" control="right"></div><div class="control bottom" monitor="control" control="down"></div><div class="control middle" monitor="control" control="center"></div></div>')}
        break;
        case'watch':
            if($.ccio.mon[e.mid].watch!==1){
                $.ccio.cx({f:'monitor',ff:'watch_on',id:e.mid})
            }else{
                $("#monitor_live_"+e.mid+' [monitor="bigify"]').click()
            }
        break;
        case'watch_off':
            $.ccio.cx({f:'monitor',ff:'watch_off',id:e.mid})
        break;
        case'delete':
            e.m=$('#confirm_window').modal('show');e.f=e.e.attr('file');
            $.confirm.title.text('Delete Monitor : '+e.mon.name)
            e.html='Do you want to delete this monitor? You cannot recover it.'
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
                e.p.find('[monitor="delete"]').hide()
                e.mt.find('span').text('Add'),e.mt.find('i').attr('class','fa fa-plus');
                e.values={"mode":"stop","mid":"","name":"","protocol":"http","ext":"webm","type":"jpeg","host":"","path":"","port":"","fps":"1","width":"640","height":"480","details":JSON.stringify({"control":"0","control_stop":"0","vf":"","svf":"fps=1","sfps":"1000","cutoff":"15","vcodec":"copy","acodec":"copy","motion":"0","timestamp":"1"}),"shto":"[]","shfr":"[]"}
            }else{
                e.p.find('[monitor="delete"]').show()
                e.mt.find('span').text('Edit'),e.mt.find('i').attr('class','fa fa-wrench'),e.values=$.ccio.mon[e.mid];
            }
            $.each(e.values,function(n,v){
                $.aM.e.find('[name="'+n+'"]').val(v).change()
            })
            e.ss=JSON.parse(e.values.details);
            e.p.find('[detail]').each(function(n,v){
                v=$(v).attr('detail');if(!e.ss[v]){e.ss[v]=''}
            })
            $.each(e.ss,function(n,v){
                $.aM.e.find('[detail="'+n+'"]').val(v).change();
            })
            $('#add_monitor').modal('show')
        break;
    }
    e.e=$(this);$(e.e.attr('data-target')).toggleClass(e.e.attr('class_toggle'))
})

$('#event_viewer,#confirm_window').on('hidden.bs.modal',function(){
    $(this).find('video').remove();
});
