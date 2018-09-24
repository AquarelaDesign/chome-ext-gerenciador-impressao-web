(function(window,document) {
  'use strict';
   
   //const URL = 'http://192.168.50.231:3125/';
   var URL = '';
   var PDF = '';
   var NOT = '';

   var response     = document.getElementById('response');
   var searchButton = document.getElementById('buttonSearch');
   var ip           = findIP(addIP);

   AtualizaGet();
   
   (document).ready(function(){
   	++data.nPopupClicked;
   	start();
   });

   function start() {
      $("#loader-container").show();

      var URL = '';
      var PDF = '';
      var NOT = '';

      chrome.storage.sync.get({
         alerts: NOT,
         pdf: PDF,
         url: URL
      }, function(items) {
         //console.log("items", typeof(items.pdf));

         if (items.alerts != undefined && items.alerts != null) {
            NOT = items.alerts;
         }

         if (items.pdf != undefined && items.pdf != null) {
            PDF = items.pdf;
            //console.log("PDF", PDF, items.pdf);
         }

         if (items.url != undefined && items.url != null) {
            URL = items.url;
         }
      });

      if (URL != "" && URL != null) {
         var url = URL
                 + 'cgi-bin/siareweb.pl/wsgimp'
                 + '?tipo='
                 + '&ip=' + ip
                 + '&modo=';
         console.log('URL->',URL,'PDF->',PDF,'NOT->',NOT);
         buscaDados(url, createList);
      }

   }

   // funcao para a execucao do ajax
   function buscaDados(url, callback) {
      var req = new XMLHttpRequest();
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


   // cria a lista com o resultado da busca
   function createList(json) {
      if (json != null) {
         if (json.dtbimp !== undefined) {
            AtualizaGet();
            var ttbimp = json.dtbimp.ttbimp;
            
            // JQuery
            $("#loader-container1").empty();
           
            var tb = $('<table></table>').attr({ id:"listaDados", class: ["commands-table"].join(' ') });
            var tr = [];
            
            var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo(tb);
            $('<td></td>').text("Arquivo").appendTo(lin);
            $('<td></td>').text("Data").appendTo(lin);
            $('<td></td>').text("Hora").appendTo(lin);
            $('<td></td>').text("IP").appendTo(lin);
            $('<td></td>').text("Status").appendTo(lin);
            
            if (ttbimp != null) {
               
               for (var i=0; i < ttbimp.length; i++) {
                  var aArqPDF = ttbimp[i].ArqPDF.split("/");
                  var ArqPDF;
                  for (var x=0; x < aArqPDF.length; x++){
                     ArqPDF = aArqPDF[x];
                  }
                  
                  var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo(tb);
                  var td = $('<td></td>').text('').appendTo(lin);
                  var link = $('<a />', {href: ttbimp[i].URLArq+ArqPDF}).text(ArqPDF)
                                 .on('click', 'a', function(e){ 
                                       e.preventDefault(); 
                                       var url = $(this).attr('href'); 
                                       window.open(url, '_blank');
                                 }).appendTo(lin);
                  td.append(link);
                  
                  $('<td></td>').text(ttbimp[i].DataGer).appendTo(lin);
                  $('<td></td>').text(ttbimp[i].HoraGer).appendTo(lin);
                  $('<td></td>').text(ttbimp[i].IP).appendTo(lin);
                  $('<td></td>').text(ttbimp[i].StaImp).appendTo(lin);
                  
                  //console.log('ttbimp[i]', i, ttbimp[i])
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
                                   + 'cgi-bin/siareweb.pl/wsgimp'
                                   + '?tipo=M'
                                   + '&ip='   + IP
                                   + '&data=' + DataGer
                                   + '&hora=' + HoraGer
                                   + '&modo=';

                           //console.log("url", url);
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
            tb.appendTo("#loader-container1");
            $("#loader-container").hide();
         }
      }
      
   }

   //$("#loader-container").show();
   
   function AtualizaGet() {
      chrome.storage.sync.get({
         alerts: NOT,
         pdf: PDF,
         url: URL
      }, function(items) {
         //console.log("items", typeof(items.pdf));

         if (items.alerts != undefined && items.alerts != null) {
            NOT = items.alerts;
         }

         if (items.pdf != undefined && items.pdf != null) {
            PDF = items.pdf;
            //console.log("PDF", PDF, items.pdf);
         }

         if (items.url != undefined && items.url != null) {
            URL = items.url;
         }
      });

   }
   
   chrome.alarms.onAlarm.addListener(function( alarm ) {
      //console.log("URL", URL);
      
      if (URL != "" && URL != null) {
         var url = URL
                 + 'cgi-bin/siareweb.pl/wsgimp'
                 + '?tipo='
                 + '&ip=' + ip
                 + '&modo=';
         console.log('URL->',URL,'PDF->',PDF,'NOT->',NOT);
         ajaxGetRequest(url, buscaLista);
      }
   });

   createAlarm();

   // cria a lista com o resultado da busca
   function buscaLista(json) {
      if (json != null) {
         if (json.dtbimp !== undefined) {
            AtualizaGet();
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
                           
                           //console.log(NOT, PDF);
                           
                           //console.log("NOT", NOT);
                           if (NOT == true) {
                              notifyMe(ArqPDF, URLArqui);
                           }
                           
                           //console.log("PDF", PDF);
                           if (PDF == true) {
                              window.open(URLArqui);
                           }

                           // Marca como ja impresso
                           var url = URL
                                   + 'cgi-bin/siareweb.pl/wsgimp'
                                   + '?tipo=M'
                                   + '&ip='   + IP
                                   + '&data=' + DataGer
                                   + '&hora=' + HoraGer
                                   + '&modo=';

                           //console.log("url", url);
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


   // funcao para a execucao do ajax
   function ajaxGetRequest(url, callback) {
      var req = new XMLHttpRequest();
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


