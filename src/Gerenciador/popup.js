(function(window,document) {
  'use strict';
   
   //const URL = 'http://192.168.50.231:3125/';
   var URL = '';
   var PDF = '';
   var NOT = '';
   var IP  = '';
   var PL  = '';
   var Ip = "";

   var response     = document.getElementById('response');
   var searchButton = document.getElementById('buttonSearch');

   getIPs(function(ip){
      Ip = ip;
   });

   if (Ip != "" && IP != Ip) {
      IP = Ip;
   }

   AtualizaGet();

   window.onfocus = function() {         
      //document.write('Hello world');
      
      $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
      });
      
      if (URL != "" && URL != null) {
         if (PL == "") {
            PL = "siarewebpy.pl";
         }

         var url = URL
                 + '/cgi-bin/' + PL + '/wsgimp'
                 + '?tipo='
                 + '&ip=' + IP
                 + '&modo='
                 + '&rand=' + Math.floor((Math.random() * 1000000000) + 1);
         //console.log('01=>URL->', URL, IP);
         ajaxGetRequest(url, getList);
      }
   }

   function AtualizaGet() {
      chrome.storage.sync.get({
         alerts: NOT,
         pdf: PDF,
         url: URL,
		   ip: IP,
		   pl: PL
      }, function(items) {
         //console.log("items", typeof(items.pdf));

         if (items.alerts != undefined && items.alerts != null) {
            NOT = items.alerts;
         } else {
            NOT = true;
         }

         if (items.pdf != undefined && items.pdf != null) {
            PDF = items.pdf;
            //console.log("PDF", PDF, items.pdf);
         } else {
            PDF = true;
         }

         if (items.ip != undefined && items.ip != null) {
            IP = items.ip;
         } else {
            IP =  Ip;
         }
         
         if (Ip != "" && IP != Ip) {
            IP = Ip;
         }
         
         //console.log("01=>IP", IP, Ip);
         
         if (items.pl != undefined && items.pl != null) {
            PL = items.pl;
         } else {
            PL = "";
         }

         if (items.url != undefined && items.url != null) {
            URL = items.url;
         } else {
            URL = 'http://192.168.25.110:3125/';
         }

      });
   }
   
   chrome.alarms.onAlarm.addListener(function( alarm ) {
	  chrome.tabs.getAllInWindow(null, function(tabs) {
         var tabTitle = "";
         var tabId    = 0;
         var tabUrl   = "";
         for(var i=0;i<tabs.length;i++){
            if (tabs[i].title == tabTitle && 
                tabs[i].title != "SiareWeb - Procyon Sistemas" &&
                tabs[i].url == tabUrl) {
               chrome.tabs.remove(tabId);
            }
            tabTitle = tabs[i].title;
            tabId = tabs[i].id;
            tabUrl = tabs[i].url;
            //console.log(tabs[i]);
         }
      });
      
      //console.log("02=>",IP, PL);
      if (URL != "" && URL != null) {
         if (PL == "") {
            PL = "siareweb.pl"
         }
         
         var url = URL
                 + '/cgi-bin/' + PL + '/wsgimp'
                 + '?tipo='
                 + '&ip=' + IP
                 + '&modo=';
         ajaxGetRequest(url, createList);
      }
   });

   createAlarm();

   // cria a lista com o resultado da busca
   function createList(json) {
      if (json != null) {
         if (json.dtbimp !== undefined) {
            AtualizaGet();

            //console.log('01.01=>URL->',URL,'PDF->',PDF,'NOT->',NOT);
            var ttbimp = json.dtbimp.ttbimp;

            if (ttbimp != null) {
               
               for (var i=0; i < ttbimp.length; i++) {
                  var aArqPDF = ttbimp[i].ArqPDF.split("/");
                  var ArqPDF;
                  for (var x=0; x < aArqPDF.length; x++){
                     ArqPDF = aArqPDF[x];
                  }
                  
                  if (ttbimp[i].StaImp == '') {
                     var URLArqui = ttbimp[i].URLArq+ArqPDF;

                     var DataGer = ttbimp[i].DataGer;
                     var HoraGer = ttbimp[i].HoraGer;
                     var IP      = ttbimp[i].IP;
                  
                     var req = new XMLHttpRequest();
                     req.open("GET", URLArqui, true);
                     req.onreadystatechange  = function(data) {
                        
                        if(req.readyState == 4 && req.status == 200) {
                           
                           if (NOT == true) {
                              notifyMe(ArqPDF, URLArqui);
                           }
                           
                           if (PDF == true) {
                              window.open(URLArqui);
                           }

                           // Marca como ja impresso
                           var url = URL
                                   + '/cgi-bin/' + PL + '/wsgimp'
                                   + '?tipo=M'
                                   + '&ip='   + IP
                                   + '&data=' + DataGer
                                   + '&hora=' + HoraGer
                                   + '&modo=';

                           var mImp = new XMLHttpRequest();
                           mImp.open("GET", url, true);
                           mImp.onreadystatechange  = function(data)
                           {
                              if(mImp.readyState == 4 && mImp.status == 200) {
                                 //notifyMe(ArqPDF, ttbimp[i].URLArq+ArqPDF);
                                 //console.log(ArqPDF, "Marcado com o Impresso!");
                              } else {
                                 //notifyMe(ArqPDF + '\nNao esta acessivel!', null);
                                 //console.log(ArqPDF, "Erro ao Marcar com o Impresso!");
                              }
                           }
                           mImp.send(null);

                        } else {
                           //notifyMe(ArqPDF + '\nNao esta acessivel!', null);
                        }
                     }
                     req.send(null);
                     
                  }
               } 
            } 

         }
      }
      
   }

   // cria a lista com o resultado da busca
   function getList(json) {

      if (Ip != "" && IP != Ip) {
         IP = Ip;
      }
      
      //console.log("02=>IP", IP);

      document.getElementById("TitTab").innerHTML = "Relat&oacute;rios Gerados ("+IP+")";

      if (json != null) {
         if (json.dtbimp !== undefined) {
            AtualizaGet();
            //console.log('02=> getList');

            var ttbimp = json.dtbimp.ttbimp;
            
            // JQuery
            $("#Tabela").empty();
           
            //var tb = $('<table></table>').attr({ id:"listaDados", height:"400px", class: ["commands-table"].join(' ') });
            var tr = [];
            
            //var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo(tb);
            var lin = $('<tr></tr>').appendTo("#Tabela");
            $('<td></td>').text("Arquivo").attr({width:"50%", style: ["font-weight: bold"]}).appendTo(lin);
            $('<td></td>').text("Data").attr({width:"10%", style: ["font-weight: bold"]}).appendTo(lin);
            $('<td></td>').text("Hora").attr({width:"10%", style: ["font-weight: bold"]}).appendTo(lin);
            $('<td></td>').text("IP").attr({width:"20%", style: ["font-weight: bold"]}).appendTo(lin);
            $('<td></td>').text("Status").attr({width:"10%", style: ["font-weight: bold"]}).appendTo(lin);
            
            var x = 0;
            var lmax = 15;

            //console.log("03=>", lmax);

            if (ttbimp != null) {
               for (var i=0; i < ttbimp.length; i++) {
                  var aArqPDF = ttbimp[i].ArqPDF.split("/");
                  var ArqPDF;
                  for (var x=0; x < aArqPDF.length; x++){
                     ArqPDF = aArqPDF[x];
                  }
                  
                  //var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo(tb);
                  var lin = $('<tr></tr>').appendTo("#Tabela");
                  var td = $('<td></td>').text('').appendTo(lin);
                  
                  var link = $('<a />', {href: ttbimp[i].URLArq+ArqPDF}).text(ArqPDF);

                  td.append(link);
                  
                  $('<td></td>').text(ttbimp[i].DataGer).appendTo(lin);
                  $('<td></td>').text(ttbimp[i].HoraGer).appendTo(lin);
                  $('<td></td>').text(ttbimp[i].IP).appendTo(lin);
                  
                  var Status = '';
                  
                  switch (ttbimp[i].StaImp) {
                     case "I":
                        Status = 'Impresso';
                        break;
                     case "E":
                        Status = 'Enviado';
                        break;
                     default:
                        Status = '';
                  }
                  
                  $('<td></td>').text(Status).appendTo(lin);
                  
                  if (ttbimp[i].StaImp == '') {
                     var URLArqui = ttbimp[i].URLArq+ArqPDF;

                     var DataGer = ttbimp[i].DataGer;
                     var HoraGer = ttbimp[i].HoraGer;
                     var IP      = ttbimp[i].IP;
                  
                     var req = new XMLHttpRequest();
                     req.open("GET", URLArqui, true);
                     req.onreadystatechange  = function(data) {
                        
                        if(req.readyState == 4 && req.status == 200) {
                           // Marca como ja impresso
                           var url = URL
                                   + '/cgi-bin/' + PL + '/wsgimp'
                                   + '?tipo=M'
                                   + '&ip='   + IP
                                   + '&data=' + DataGer
                                   + '&hora=' + HoraGer
                                   + '&modo=';

                           var mImp = new XMLHttpRequest();
                           mImp.open("GET", url, true);
                           mImp.onreadystatechange  = function(data)
                           {
                              if(mImp.readyState == 4 && mImp.status == 200) {
                                 //notifyMe(ArqPDF, ttbimp[i].URLArq+ArqPDF);
                                 //console.log(ArqPDF, "Marcado com o Impresso!");
                              } else {
                                 //notifyMe(ArqPDF + '\nNao esta acessivel!', null);
                                 //console.log(ArqPDF, "Erro ao Marcar com o Impresso!");
                              }
                           }
                           mImp.send(null);

                        } else {
                           //notifyMe(ArqPDF + '\nNao esta acessivel!', null);
                        }
                     }
                     req.send(null);
                     
                  }
                  x = i;
               } // final do for ttbimp.length
               
            } 
            
            if (ttbimp != null) {
               if (ttbimp.length < lmax) {
                  x = lmax - ttbimp.length;
               } else {
                  x = 0;
               }
            }
            
            //console.log("04=>", lmax, x);
            for (var y=0;y<=x;y++){
               var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo("#Tabela");
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
            }
               
            $("#loader-container").hide();
         }
      }
      
   }

   // funcao para a execucao do ajax
   function ajaxGetRequest(url, callback) {
      var req = new XMLHttpRequest();
      
      //console.log("03=>", url);
      
      req.open("GET",url,true);
      req.onreadystatechange  = function(data)
      {
         if(req.readyState == 4 && req.status == 200)
            callback(JSON.parse(req.responseText))
         else
            callback(null)
      }
      req.send(null);
   }
   
   function notifyMe(texto, url) {
      if (Notification.permission !== "granted")
         Notification.requestPermission();
      else {
         var notification = new Notification('PDF Gerado', {
            icon: 'icon128.png',
            body: texto,
         });
         if (url !== null) {
            notification.onclick = function () {
               window.open(url);      
            };
         }
      }
   }

   var alarmName = 'remindme';
   
   function checkAlarm(callback) {
     chrome.alarms.getAll(function(alarms) {
       var hasAlarm = alarms.some(function(a) {
         return a.name == alarmName;
       });
       var newLabel;
       if (hasAlarm) {
         newLabel = 'Notificacoes OFF';
       } else {
         newLabel = 'Notificacoes ON';
       }

       if (callback) callback(hasAlarm);
     })
   }
   
   function createAlarm() {
     chrome.alarms.create(alarmName, {
       delayInMinutes: 0.1, periodInMinutes: 0.1});
   }
   
   function cancelAlarm() {
     chrome.alarms.clear(alarmName);
   }
   
   function doToggleAlarm() {
     checkAlarm( function(hasAlarm) {
       if (hasAlarm) {
         cancelAlarm();
       } else {
         createAlarm();
       }
       checkAlarm();
     });
   }
  
   //get the IP addresses associated with an account
   function getIPs(callback){

       //console.log("03=>IP", Ip, callback);

       var ip_dups = {};

       //compatibility for firefox and chrome
       var RTCPeerConnection = window.RTCPeerConnection
           || window.mozRTCPeerConnection
           || window.webkitRTCPeerConnection;
       var useWebKit = !!window.webkitRTCPeerConnection;

       //bypass naive webrtc blocking using an iframe
       if(!RTCPeerConnection){
           //NOTE: you need to have an iframe in the page right above the script tag
           //
           //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
           //<script>...getIPs called in here...
           //
           var win = iframe.contentWindow;
           RTCPeerConnection = win.RTCPeerConnection
               || win.mozRTCPeerConnection
               || win.webkitRTCPeerConnection;
           useWebKit = !!win.webkitRTCPeerConnection;
       }

       //minimal requirements for data connection
       var mediaConstraints = {
           optional: [{RtpDataChannels: true}]
       };

       var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

       //construct a new RTCPeerConnection
       var pc = new RTCPeerConnection(servers, mediaConstraints);

       function handleCandidate(candidate){
           //match just the IP address
           var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
           //var ip_addr = ip_regex.exec(candidate)[1];
           var ip_addr;
           if (ip_regex.exec(candidate) != null || ip_regex.exec(candidate) != undefined) {
              ip_addr = ip_regex.exec(candidate)[1];

              //remove duplicates
              if(ip_dups[ip_addr] === undefined)
                  callback(ip_addr);

              ip_dups[ip_addr] = true;
            }
       }

       //listen for candidate events
       pc.onicecandidate = function(ice){

           //skip non-candidate events
           if(ice.candidate)
               handleCandidate(ice.candidate.candidate);
       };

       //create a bogus data channel
       pc.createDataChannel("");

       //create an offer sdp
       pc.createOffer(function(result){

           //trigger the stun server request
           pc.setLocalDescription(result, function(){}, function(){});

       }, function(){});

       //wait for a while to let everything done
       setTimeout(function(){
           //read candidate info from local description
           var lines = pc.localDescription.sdp.split('\n');

           lines.forEach(function(line){
               if(line.indexOf('a=candidate:') === 0)
                   handleCandidate(line);
           });
       }, 1000);
   }

   checkAlarm();

})(window,document);
