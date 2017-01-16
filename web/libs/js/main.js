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
                $.each($user,function(n,v){$.sM.e.find('[name="'+n+'"]').val(v).change()})
                $.each(k.d,function(n,v){$.sM.e.find('[detail="'+n+'"]').val(v).change()})
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
            case 0://video
                if(!d.filename){d.filename=moment(d.time).format('YYYY-MM-DDTHH-mm-ss')+'.'+d.ext;}
                k=[d.mid+'-'+d.filename,'href="/'+$user.auth_token+'/videos/'+d.ke+'/'+d.mid+'/'+d.filename+'"'];
                d.mom=moment(d.time),d.hr=parseInt(d.mom.format('HH'))+1,d.per=parseInt(d.hr/24*100);
                tmp+='<li class="glM'+d.mid+'" mid="'+d.mid+'" ke="'+d.ke+'" file="'+d.filename+'"><div title="at '+d.hr+' hours of '+d.mom.format('MMMM DD')+'" '+k[1]+' video="launch" class="progress-circle progress-'+d.per+'"><span>'+d.hr+'</span></div><div><span title="'+d.end+'" class="livestamp"></span></div><div class="small"><b>Start</b> : '+d.time+'</div><div class="small"><b>End</b> : '+d.end+'</div><div><span class="pull-right">'+(parseInt(d.size)/1000000).toFixed(2)+'mb</span><div class="controls"><a class="btn btn-sm btn-primary" video="launch" '+k[1]+'><i class="fa fa-play-circle"></i></a> <a download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-download"></i></a> <a video="download" host="dropbox" download="'+k[0]+'" '+k[1]+' class="btn btn-sm btn-default"><i class="fa fa-dropbox"></i></a> <a title="Delete Video" video="delete" class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></a></div></div></li>';
            break;
            case 1://monitor icon
                d.src=placeholder.getData(placeholder.plcimg({bgcolor:'#b57d00',text:'...'}));
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" title="'+d.mid+' : '+d.name+'" class="monitor_block glM'+d.mid+' col-md-4"><img monitor="watch" class="snapshot" src="'+d.src+'"><div class="box"><div class="title monitor_name truncate">'+d.name+'</div><div class="list-data"><div class="monitor_mid">'+d.mid+'</div><div><b>Save as :</b> <span class="monitor_ext">'+d.ext+'</span></div><div><b>Mode :</b> <span class="monitor_mode">'+d.mode+'</span></div></div><div class="icons"><a class="btn btn-xs btn-default" monitor="edit"><i class="fa fa-wrench"></i></a> <a monitor="calendar" class="btn btn-xs btn-default"><i class="fa fa-calendar"></i></a> <a monitor="videos_table" class="btn btn-xs btn-default"><i class="fa fa-film"></i></a></div></div></div>';
                delete(d.src);
            break;
            case 2://monitor stream
                tmp+='<div mid="'+d.mid+'" ke="'+d.ke+'" id="monitor_live_'+d.mid+'" class="monitor_item glM'+d.mid+' col-md-4"><img>';
//                switch(d.type){
//                    case'jpeg':case'mjpeg':case'h264':
//                        tmp+='<img>';
//                    break;
//                }
                tmp+='<div class="hud super-center"><div class="side-menu logs scrollable"></div><div class="side-menu videos_monitor_list glM'+d.mid+' scrollable"><ul></ul></div><div class="top_bar"><span class="badge badge-sm badge-danger"><i class="fa fa-eye"></i> <span class="viewers"></span></span></div><div class="bottom_bar"><span class="monitor_name">'+d.name+'</span><div class="pull-right btn-group"><a title="Snapshot" monitor="snapshot" class="btn btn-sm btn-primary"><i class="fa fa-camera"></i></a> <a title="Show Logs" class_toggle="show_logs" data-target=".monitor_item[mid=\''+d.mid+'\'][ke=\''+d.ke+'\']" class="btn btn-sm btn-warning"><i class="fa fa-exclamation-triangle"></i></a> <a title="Enlarge" monitor="control_toggle" class="btn btn-sm btn-default"><i class="fa fa-arrows"></i></a> <a title="Status" class="btn btn-sm btn-danger signal" monitor="watch_on"><i class="fa fa-circle"></i></a> <a title="Calendar" monitor="calendar" class="btn btn-sm btn-default"><i class="fa fa-calendar"></i></a> <a title="Videos List" monitor="videos_table" class="btn btn-sm btn-default"><i class="fa fa-film"></i></a> <a class="btn btn-sm btn-default" monitor="edit"><i class="fa fa-wrench"></i></a> <a title="Enlarge" monitor="bigify" class="btn btn-sm btn-default"><i class="fa fa-expand"></i></a> <a title="Close Stream" monitor="watch_off" class="btn btn-sm btn-danger"><i class="fa fa-times"></i></a></div></div></div></div></div>';
            break;
            case 3:
                tmp+='<tr api_key="'+d.code+'"><td class="code">'+d.code+'</td><td class="ip">'+d.ip+'</td><td class="time">'+d.time+'</td><td><a class="delete btn btn-xs btn-danger">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td></tr>';
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
                k.e.find('[monitor="bigify"]').click()
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
                    tmp+='<li class="notice novideos">No videos for This Monitor</li>';
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
$.ccio.ws.on('f',function (d){
    if(d.f!=='monitor_frame'&&d.f!=='os'&&d.f!=='video_delete'){console.log(d);}
    switch(d.f){
        case'api_key_deleted':
            new PNotify({title:'API Key Deleted',text:'Key has been deleted. It will no longer work.',type:'notice'});
            $('[api_key="'+d.form.code+'"]').remove();
        break;
        case'api_key_added':
            new PNotify({title:'API Key Added',text:'You may use this key now.',type:'success'});
            $.ccio.tm(3,d.form,'#api_list')
        break;
        case'user_settings_change':
            new PNotify({title:'Settings Changed',text:'Your settings have been saved and applied.',type:'success'});
            $.ccio.init('id',d.form);
        break;
        case'log':
            d.l=$('#logs,.monitor_item[mid="'+d.mid+'"][ke="'+d.ke+'"] .logs')
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
            $.each(d.l,function(n,v){
                v=$(v);
                if(v.find('.log-item').length>10){v.find('.log-item:last').remove()}
            })
            d.l.prepend(d.tmp);$.ccio.init('ls');
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
                $.ccio.cx({f:'get',ff:'videos',limit:10,mid:v.mid})
                if(d.o[v.ke]&&d.o[v.ke][v.mid]===1){$.ccio.cx({f:'monitor',ff:'watch_on',id:v.mid})}
            });
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
        case'video_delete':
            if($('.modal[mid="'+d.mid+'"]').length>0){$('#video_viewer[mid="'+d.mid+'"]').attr('file',null).attr('ke',null).attr('mid',null).modal('hide')}
            $('[file="'+d.filename+'"][mid="'+d.mid+'"][ke="'+d.ke+'"]').remove();
        break;
        case'video_build_success':
            if(!d.mid){d.mid=d.id;}
            d.e='.glM'+d.mid+'.videos_list ul,.glM'+d.mid+'.videos_monitor_list ul';$(d.e).find('.notice.novideos').remove();
            $.ccio.tm(0,d,d.e)
        break;
//        case'monitor_stopping':
//            new PNotify({title:'Monitor Stopping',text:'Monitor <b>'+d.mid+'</b> is now off.',type:'notice'});
//        break;
//        case'monitor_starting':
//            switch(d.mode){case'start':d.mode='Watch';break;case'record':d.mode='Record';break;}
//            new PNotify({title:'Monitor Starting',text:'Monitor <b>'+d.mid+'</b> is now running in mode <b>'+d.mode+'</b>',type:'success'});
//        break;
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
            
            d.e=$('.glM'+d.mon.mid);
            d.e.find('.monitor_name').text(d.mon.name)
            d.e.find('.monitor_mid').text(d.mon.mid)
            d.e.find('.monitor_ext').text(d.mon.ext)
            d.e.find('.monitor_mode').text(d.mon.mode)
        break;
        case'monitor_watch_off':case'monitor_stopping':
            d.o=$.ccio.op().watch_on;if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=0;$.ccio.op('watch_on',d.o);
            if($.ccio.mon[d.id]){
                $.ccio.mon[d.id].watch=0;
                if(d.cnid===$.ccio.ws.id){
                    $('#monitor_live_'+d.id).remove();
                }
                $('#monitor_live_'+d.id+' .viewers').html(d.viewers)
            }
        break;
        case'monitor_watch_on':
            d.o=$.ccio.op().watch_on;if(!d.o){d.o={}};if(!d.o[d.ke]){d.o[d.ke]={}};d.o[d.ke][d.id]=1;$.ccio.op('watch_on',d.o);
            $.ccio.mon[d.id].watch=1;
            d.e=$('#monitor_live_'+d.id);
            if(d.e.length==0){
                $.ccio.tm(2,$.ccio.mon[d.id],'#monitors_live');
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
    e.ar={},e.f=$(this).parents('form');
    $.each(e.f.find('[detail]'),function(n,v){
        v=$(v);e.ar[v.attr('detail')]=v.val();
    });
    e.f.find('[name="details"]').val(JSON.stringify(e.ar));
};
//add Monitor
$.aM={e:$('#add_monitor')};$.aM.f=$.aM.e.find('form')
$.aM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    $.each(e.s,function(n,v){e.s[n]=v.trim()});
    e.s.mid=e.s.mid.replace(/[^\w\s]/gi,'').replace(/ /g,'')
    if(e.s.mid.length<3){e.er.push('Monitor ID too short')}
    if(e.s.port==''){e.s.port=80}
//    if(e.s.protocol=='rtsp'){e.s.ext='mp4',e.s.type='rtsp'}
    if(e.er.length>0){$.sM.e.find('.msg').html(e.er.join('<br>'));return;}
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
    console.log(e.code)
    $.ccio.cx({f:'api',ff:'delete',form:{code:e.code}})
})
//settings window
$.sM={e:$('#settings')};$.sM.f=$.sM.e.find('form');
$.sM.md=$.sM.f.find('[detail]');
$.sM.md.change($.ccio.form.details);
$.sM.f.submit(function(e){
    e.preventDefault();e.e=$(this),e.s=e.e.serializeObject();
    e.er=[];
    if(e.s.pass!==''&&e.password_again===e.s.pass){e.er.push('Passwords don\'t match')};
    if(e.er.length>0){$.sM.e.find('.msg').html(e.er.join('<br>'));return;}
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
//videos window
$.vidview={e:$('#videos_viewer')};$.vidview.f=$.vidview.e.find('form')
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
            $.ccio.cx({f:'video',ff:'delete',status:1,filename:n[0],ext:n[1],mid:v});
        })
    });
})
//dynamic bindings
$('body')
.on('click','.logout',function(e){
    localStorage.removeItem('ShinobiLogin_'+location.host);location.reload();
})
.on('click','[video]',function(e){
    e.e=$(this),
    e.a=e.e.attr('video'),
    e.p=e.e.parents('[mid]'),
    e.ke=e.p.attr('ke'),
    e.mid=e.p.attr('mid'),
    e.file=e.p.attr('file');
    if(!e.ke||!e.mid){
        //for calendar plugin
        e.p=e.e.parents('[data-mid]'),
        e.ke=e.p.data('ke'),
        e.mid=e.p.data('mid'),
        e.file=e.p.data('file');
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
        break;
        case'delete':
            $.confirm.e.modal('show');
            $.confirm.title.text('Delete Video : '+e.file)
            e.html='Do you want to delete this video? You cannot recover it.'
            e.html+='<video class="video_video" autoplay loop controls><source src="'+e.p.find('[download]').attr('href')+'" type="video/'+e.mon.ext+'"></video>';
            $.confirm.body.html(e.html)
            $.confirm.click({title:'Delete Video',class:'btn-danger'},function(){
                e.file=e.file.split('.')
                $.ccio.cx({f:'video',ff:'delete',status:1,filename:e.file[0],ext:e.file[1],ke:e.ke,mid:e.mid});
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
        case'snapshot':
            var img =e.p.find('img')[0]
            var image_data = atob(img.src.split(',')[1]);
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
            var url = (window.webkitURL || window.URL).createObjectURL(blob);
            $('#temp').html('<a href="'+url+'" download="'+$.ccio.init('tf')+'_'+e.ke+'_'+e.mid+'.jpg">a</a>').find('a')[0].click();
            URL.revokeObjectURL(url)
        break;
        case'control':
            e.a=e.e.attr('control'),e.j=JSON.parse(e.mon.details);
            $.ccio.cx({f:'monitor',ff:'control',direction:e.a,mid:e.mid,ke:e.ke})
        break;
        case'videos_table':case'calendar'://call videos table or calendar
            $.getJSON('/'+$user.auth_token+'/videos/'+e.ke+'/'+e.mid,function(d){
                e.v=$.vidview.e;e.o=e.v.find('.options').hide()
                e.b=e.v.modal('show').find('.modal-body');
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
                            e.b.html('').fullCalendar('destroy').fullCalendar({
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
                        setTimeout(function(){e.b.fullCalendar('changeView','listDay');},1000)
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
                        e.tmp+='<th data-field="Delete" data-sortable="true">Delete</th>';
                        e.tmp+='</tr>';
                        e.tmp+='</thead>';
                        e.tmp+='<tbody>';
                        $.each(d,function(n,v){
                            if(v.status!==0){
                                v.start=v.time;
                                v.filename=$.ccio.init('tf',v.time)+'.'+v.ext;
                                e.tmp+='<tr data-ke="'+v.ke+'" data-mid="'+v.mid+'" data-file="'+v.filename+'">';
                                e.tmp+='<td><div class="checkbox"><input id="'+v.ke+'_'+v.filename+'" name="'+v.filename+'" value="'+v.mid+'" type="checkbox"><label for="'+v.ke+'_'+v.filename+'"></label></div></td>';
                                e.tmp+='<td><span class="livestamp" title="'+v.end+'"></span></td>';
                                e.tmp+='<td>'+v.end+'</td>';
                                e.tmp+='<td>'+v.time+'</td>';
                                e.tmp+='<td>'+v.mid+'</td>';
                                e.tmp+='<td>'+v.filename+'</td>';
                                e.tmp+='<td>'+(parseInt(v.size)/1000000).toFixed(2)+'</td>';
                                e.tmp+='<td><a class="btn btn-sm btn-primary" video="launch" href="'+v.href+'">&nbsp;<i class="fa fa-play-circle"></i>&nbsp;</a></td>';
                                e.tmp+='<td><a class="btn btn-sm btn-success" download="'+v.mid+'-'+v.filename+'" href="'+v.href+'">&nbsp;<i class="fa fa-download"></i>&nbsp;</a></td>';
                                e.tmp+='<td><a class="btn btn-sm btn-danger" video="delete">&nbsp;<i class="fa fa-trash"></i>&nbsp;</a></td>';
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
        case'bigify':
            e.classes='col-md-4 col-md-8 selected';
            if(e.p.hasClass('selected')){e.p.toggleClass(e.classes);return}
            e.m=$('#monitors_live')
            $('.monitor_item .videos_list').remove();
            e.e=e.e.parents('.monitor_item');
            $('.videos_list.glM'+e.mid).clone().appendTo(e.e.find('.hud .videos_monitor_list')).find('h3').remove()
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
                e.values={"mode":"stop","mid":"","name":"","protocol":"http","ext":"webm","type":"jpeg","host":"","path":"","port":"","fps":"1","width":"640","height":"480","details":JSON.stringify({"control":"0","control_stop":"0","vf":"","svf":"fps=1","sfps":"1000","cutoff":"15","vcodec":"copy","acodec":"libvorbis","motion":"0","timestamp":"0"}),"shto":"[]","shfr":"[]"}
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
                //temp
//                .find('[detail="timestamp"]').val('0').change()
        break;
    }
    e.e=$(this);$(e.e.attr('data-target')).toggleClass(e.e.attr('class_toggle'))
})

$('#video_viewer,#confirm_window').on('hidden.bs.modal',function(){
    $(this).find('video').remove();
});
