(function(window,document) {
  'use strict';
   
   //const URL = 'http://192.168.50.231:3125/';
   var URL = '';
   var PDF = '';
   var NOT = '';
   var IP  = '';
   var PL  = '';

   var response     = document.getElementById('response');
   var searchButton = document.getElementById('buttonSearch');

   AtualizaGet();

   window.onfocus = function() {         
      //document.write('Hello world');
      
      $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
      });
      
      if (URL != "" && URL != null) {
         if (PL == "") {
            PL = "siareweb.pl";
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
            IP = findIP(addIP);
         }

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
            console.log(tabs[i]);
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
  
   function findIP(onNewIP) { //  onNewIp - your listener function for new IPs
      var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
      var pc = new myPeerConnection({iceServers: []}),
          noop = function() {},
          localIPs = {},
          ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
          key;

      function ipIterate(ip) {
         if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
         }
         pc.createDataChannel(""); //create a bogus data channel
         pc.createOffer(function(sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(ipIterate);
         });
         
         pc.setLocalDescription(sdp, noop, noop);
      }, noop); // create offer and set local description
      
      pc.onicecandidate = function(ice) { //listen for candidate events
         if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
         ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
      };
   }  

   function addIP(Ip) {
      ip = Ip;
   }

   checkAlarm();

})(window,document);
