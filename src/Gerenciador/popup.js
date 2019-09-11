(function (window, document) {
   'use strict';

   var TMPMAN = '';
   var TEMPO = '';
   var URL = '';
   var PDF = '';
   var NOT = '';
   var IP = '';
   var PL = '';

   //var response = document.getElementById('response');
   //var searchButton = document.getElementById('buttonSearch');
   var alarmName = 'remindme';

   function AtualizaGet() {
      chrome.storage.sync.get({
         alerts: NOT,
         pdf: PDF,
         tmpman: TMPMAN,
         tempo: TEMPO,
         url: URL,
         ip: IP,
         pl: PL
      }, function (items) {
         if (items.alerts != undefined && items.alerts != null) {
            NOT = items.alerts;
         } else {
            NOT = true;
         }

         if (items.pdf != undefined && items.pdf != null) {
            PDF = items.pdf;
         } else {
            PDF = true;
         }

         if (items.tmpman != undefined && items.tmpman != null) {
            TMPMAN = items.tmpman;
         } else {
            TMPMAN = true;
         }

         if (items.tempo != undefined && items.tempo != null) {
            TEMPO = items.tempo;
         }

         if (items.ip != undefined && items.ip != null) {
            IP = items.ip;
            
            if (document.getElementById("TitTab") !== undefined) {
               if (document.getElementById("TitTab") !== null) {
                  document.getElementById("TitTab").innerHTML = "Relat&oacute;rios Gerados (" + IP + ")";
               }
            }
         }

         if (items.pl != undefined && items.pl != null) {
            PL = items.pl;
         }

         if (items.url != undefined && items.url != null) {
            URL = items.url;
         }
      });
   }

   chrome.alarms.onAlarm.addListener(function (alarm) {
      buscaLista();
   });

   function buscaLista() {
      chrome.tabs.getAllInWindow(null, function (tabs) {
         var tabTitle = "";
         var tabId = 0;
         var tabUrl = "";
         for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].title == tabTitle &&
               tabs[i].title != "SiareWeb - Procyon Sistemas" &&
               tabs[i].url == tabUrl) {
               chrome.tabs.remove(tabId);
            }
            tabTitle = tabs[i].title;
            tabId = tabs[i].id;
            tabUrl = tabs[i].url;
         }
      });
      
      AtualizaGet();
      var msg = "";
      if (TEMPO != "") {
         msg += 'Timer: ' + (!TMPMAN ? 1.0 : parseFloat(TEMPO) * 60) + ' ' + TMPMAN;
      }

      if (IP != "") {
         if (msg != "") msg += "\n";
         msg += 'IP: ' + IP;
      }

      if (URL != "") {
         if (msg != "") msg += "\n";
         msg += 'URL: ' + URL;
      }

      if (PL != "") {
         if (msg != "") msg += "/";
         msg += PL;
      }

      //if (msg != "") notifyMe(msg,"");
      
      if (URL != "" && URL != null) {
         var url = URL
            + '/cgi-bin/' + PL + '/wsgimp'
            + '?tipo='
            + '&ip=' + IP
            + '&modo=';
         ajaxGetRequest(url, createList);
      }
   }

   // cria a lista com o resultado da busca
   function createList(json) {
      if (json != null) {
         if (json.dtbimp !== undefined) {
            AtualizaGet();

            var ttbimp = json.dtbimp.ttbimp;
            if (ttbimp != null) {
               for (var i = 0; i < ttbimp.length; i++) {
                  var aArqPDF = ttbimp[i].ArqPDF.split("/");
                  var ArqPDF;
                  for (var x = 0; x < aArqPDF.length; x++) {
                     ArqPDF = aArqPDF[x];
                  }

                  if (ttbimp[i].StaImp == '') {
                     var URLArqui = ttbimp[i].URLArq + ArqPDF;

                     var DataGer = ttbimp[i].DataGer;
                     var HoraGer = ttbimp[i].HoraGer;
                     var IP1 = ttbimp[i].IP;

                     var req = new XMLHttpRequest();
                     req.open("GET", URLArqui, true);
                     req.onreadystatechange = function (data) {

                        if (req.readyState == 4 && req.status == 200) {

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
                              + '&ip=' + IP1
                              + '&data=' + DataGer
                              + '&hora=' + HoraGer
                              + '&modo=';

                           var mImp = new XMLHttpRequest();
                           mImp.open("GET", url, true);
                           mImp.onreadystatechange = function (data) {
                              if (mImp.readyState == 4 && mImp.status == 200) {
                                 //notifyMe(ArqPDF, ttbimp[i].URLArq+ArqPDF);
                                 console.log(ArqPDF, "Marcado com o Impresso!");
                              } else {
                                 console.log(ArqPDF, "Erro ao Marcar com o Impresso!");
                              }
                           }
                           mImp.send(null);
                        } else {
                           console.log(ArqPDF, 'Nao esta acessivel!');
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
            var ttbimp = json.dtbimp.ttbimp;
            
            $("#Tabela").empty();
            
            var tr = [];
            var lin = $('<tr></tr>').appendTo("#Tabela");
            $('<td></td>').text("Arquivo").attr({ width: "50%", style: ["font-weight: bold"] }).appendTo(lin);
            $('<td></td>').text("Data").attr({ width: "10%", style: ["font-weight: bold"] }).appendTo(lin);
            $('<td></td>').text("Hora").attr({ width: "10%", style: ["font-weight: bold"] }).appendTo(lin);
            $('<td></td>').text("IP").attr({ width: "20%", style: ["font-weight: bold"] }).appendTo(lin);
            $('<td></td>').text("Status").attr({ width: "10%", style: ["font-weight: bold"] }).appendTo(lin);

            var x = 0;
            var lmax = 15;
            if (ttbimp != null) {
               for (var i = 0; i < ttbimp.length; i++) {
                  var aArqPDF = ttbimp[i].ArqPDF.split("/");
                  var ArqPDF;
                  for (var x = 0; x < aArqPDF.length; x++) {
                     ArqPDF = aArqPDF[x];
                  }

                  var lin = $('<tr></tr>').appendTo("#Tabela");
                  var td = $('<td></td>').text('').appendTo(lin);
                  var link = $('<a />', { href: ttbimp[i].URLArq + ArqPDF }).text(ArqPDF);
                  
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
                     var URLArqui = ttbimp[i].URLArq + ArqPDF;

                     var DataGer = ttbimp[i].DataGer;
                     var HoraGer = ttbimp[i].HoraGer;
                     var IP = ttbimp[i].IP;

                     var req = new XMLHttpRequest();
                     req.open("GET", URLArqui, true);
                     req.onreadystatechange = function (data) {

                        if (req.readyState == 4 && req.status == 200) {
                           // Marca como ja impresso
                           var url = URL
                              + '/cgi-bin/' + PL + '/wsgimp'
                              + '?tipo=M'
                              + '&ip=' + IP
                              + '&data=' + DataGer
                              + '&hora=' + HoraGer
                              + '&modo=';

                           var mImp = new XMLHttpRequest();
                           mImp.open("GET", url, true);
                           mImp.onreadystatechange = function (data) {
                              if (mImp.readyState == 4 && mImp.status == 200) {
                                 //notifyMe(ArqPDF, ttbimp[i].URLArq+ArqPDF);
                                 //console.log(ArqPDF, "Marcado com o Impresso!");
                              } else {
                                 //notifyMe(ArqPDF + '\nNao esta acessivel!', null);
                                 console.log(ArqPDF, "Erro ao Marcar com o Impresso!");
                              }
                           }
                           mImp.send(null);

                        } else {
                           console.log(ArqPDF, '\nNao esta acessivel!');
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

            if (x == 0) x = lmax;

            for (var y = 0; y <= x; y++) {
               var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo("#Tabela");
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
            }

            $("#loader-container").hide();
         } else {
            var lmax = 15;
            for (var y = 0; y <= lmax; y++) {
               var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo("#Tabela");
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
               var td = $('<td></td>').text('').appendTo(lin);
            }
         }
      } else {
         var lmax = 15;
         for (var y = 0; y <= lmax; y++) {
            var lin = $('<tr></tr>').attr({ class: ["commands-row"].join(' ') }).appendTo("#Tabela");
            var td = $('<td></td>').text('').appendTo(lin);
            var td = $('<td></td>').text('').appendTo(lin);
            var td = $('<td></td>').text('').appendTo(lin);
            var td = $('<td></td>').text('').appendTo(lin);
            var td = $('<td></td>').text('').appendTo(lin);
         }
      }

   }

   // funcao para a execucao do ajax
   function ajaxGetRequest(url, callback) {
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      //console.log('req.readyState', req.readyState);
      //notifyMe('url: ' + url + '\nstatus: ' + req.status,"");
      req.onreadystatechange = function (data) {
         if ((req.readyState == 4 && req.status == 200) || req.status == 0)
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
         var notification = new Notification(
            (url !== '' ? 'PDF Gerado' : ''), {
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

   function checkAlarm(callback) {
      chrome.alarms.getAll(function (alarms) {
         var hasAlarm = alarms.some(function (a) {
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
      AtualizaGet();
      //notifyMe('Carga: ' + (!TMPMAN ? 1.0 : parseFloat(TEMPO) * 60) + ' ' + TMPMAN, '');
      chrome.alarms.clear(alarmName);
      chrome.alarms.create(alarmName, {
         delayInMinutes: (!TMPMAN ? 1.0 : parseFloat(TEMPO) * 60), 
         periodInMinutes: (!TMPMAN ? 1.0 : parseFloat(TEMPO) * 60)
      });
   }

   function cancelAlarm() {
      chrome.alarms.clear(alarmName);
   }

   function doToggleAlarm() {
      checkAlarm(function (hasAlarm) {
         if (hasAlarm) {
            cancelAlarm();
         } else {
            createAlarm();
         }
         checkAlarm();
      });
   }

   window.onfocus = function () {
      $('body').on('click', 'a', function () {
         chrome.tabs.create({
            url: $(this).attr('href')
         });
         return false;
      });

      if (URL != "" && URL != null) {
         var url = URL
            + '/cgi-bin/' + PL + '/wsgimp'
            + '?tipo='
            + '&ip=' + IP
            + '&modo='
            + '&rand=' + Math.floor((Math.random() * 1000000000) + 1);
         ajaxGetRequest(url, getList);
      }
   }

   AtualizaGet();
   
   if (document.getElementById("TitTab") !== undefined) {
      if (document.getElementById("TitTab") !== null) {
         document.getElementById("TitTab").innerHTML = "Relat&oacute;rios Gerados (" + IP + ")";
      }
   }
   
   window.onload = function () {
      AtualizaGet();
      if (TEMPO != null && TEMPO != undefined && TEMPO == '') {
         if (IP == '' || URL == '' || PL == '') {
            //chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
         }
      }

      //createAlarm();
      //buscaLista();
   }

   $(document).ready(function() {
      AtualizaGet();
      createAlarm();
      //buscaLista();

      $('body').on('click', 'a', function () {
         chrome.tabs.create({
            url: $(this).attr('href')
         });
         return false;
      });

      if (URL != "" && URL != null) {
         var url = URL
            + '/cgi-bin/' + PL + '/wsgimp'
            + '?tipo='
            + '&ip=' + IP
            + '&modo='
            + '&rand=' + Math.floor((Math.random() * 1000000000) + 1);
         ajaxGetRequest(url, getList);
      }
   });

})(window, document);
