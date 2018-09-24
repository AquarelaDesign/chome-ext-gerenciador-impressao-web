// Elements
(function(window,document) {
  'use strict';
   
   window.onload = function(){

      const testFolder = 'http://pro03des.procyon.com.br:3125/wss/pdf/';

      var response      = document.getElementById('response');
      var searchButton  = document.getElementById('buttonSearch');

      //response.innerHTML=testFolder;
      //console.log(testFolder);
      
      chrome.alarms.onAlarm.addListener(function( alarm ) {
         if (search.value != "" && search.value != null) {
            var url = 'http://pro03des.procyon.com.br:3125/wss/ext/busca.php?url='+search.value;
            //response.innerHTML = url;
            ajaxGetRequest(url,createList);
            console.log("Buscando...", alarm);
         }
      });

      createAlarm();
/*
      searchButton.onclick = function() {
         if (search.value != "" && search.value != null) {
            var url = 'http://pro03des.procyon.com.br:3125/wss/ext/busca.php?url='+search.value;
            //response.innerHTML = url;
            ajaxGetRequest(url,createList);
         }
      }
*/      
      // cria a lista com o resultado da busca
      function createList(json) {
         response.innerHTML=null;

         //var ul   = document.createElement('ul');
         var tb = document.createElement('table');
         
         //ul.id = "list";
         tb.id = "list";
        
         if (json != null) {
            for (var i=0; i < json.arquivos.length; i++) {
               var tr = document.createElement('tr');
               var td = document.createElement('td');
               td.innerHTML = '<a href="'+json.arquivos[i].url+'">'+json.arquivos[i].nome+'<br />';
               tr.appendChild(td);
               tb.appendChild(tr);
               //var li = document.createElement('li');
               //li.innerHTML = '<a href="'+json.arquivos[i].url+'">'+json.arquivos[i].nome+'<br />';
               //ul.appendChild(li);
               //chrome.tabs.create({ url: json.arquivos[i].url });
               notifyMe(json.arquivos[i].nome, json.arquivos[i].url);
            }
         } else {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.innerHTML = '';
            tr.appendChild(td);
            tb.appendChild(tr);
            //var li = document.createElement('li');
            //li.innerHTML = '';
            //ul.appendChild(li);
         }
         
         response.appendChild(tb);
         //response.appendChild(ul);
         
      }

      // funcao para a execucao do ajax
      function ajaxGetRequest(url,callback)
      {
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
       //document.getElementById('toggleAlarm').innerText = newLabel;
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
  
   //var toggleAlarm  = document.getElementById('toggleAlarm');
   //toggleAlarm.addEventListener('click', doToggleAlarm);
  
   checkAlarm();

})(window,document);


