var Ip = "";

// Saves options to chrome.storage
function save_options() {
   var NOT = document.getElementById('NOT').checked;
   var PDF = document.getElementById('PDF').checked;
   var TMPMAN = document.getElementById('TMPMAN').checked;
   var iURL = document.getElementById('iURL').value;
   var EMP = document.getElementById('EMP').value;
   var IP = document.getElementById('IP').value;
   var PL = document.getElementById('PL').value;
   var amount = document.getElementById('amount').value;

   if (iURL.substr(iURL.length - 1, 1) == '/') {
      iURL = iURL.substr(0, iURL.length - 1);
   }
   
   if (iURL == '') {
      status.textContent = 'URL do Serviço deve ser informada! Ex.: "http://192.168.25.110:3125/"';
      return;
   }

   if (EMP == '') {
      status.textContent = 'Código da Empresa deve ser informado! Ex.: "XX"';
      return;
   }
   
   if (IP == '') {
      status.textContent = 'IP Local deve ser informado! Ex.: "192.168.50.138"';
      return;
   }
   
   if (PL == '') {
      status.textContent = 'Nome do Arquivo "PL" deve ser informado! Ex.: "siareweb[xx].pl"';
      return;
   }
      
   chrome.storage.sync.set({
      alerts: NOT,
      pdf: PDF,
      tmpman: TMPMAN,
      tempo: amount,
      url: iURL,
      emp: EMP,
	   ip: IP,
	   pl: PL
   }, function(items) {
      alert('Dados Gravados');
      var status = document.getElementById('status');
      status.textContent = 'Dados Gravados';
      setTimeout(function() {
         status.textContent = '';
      }, 750);
   });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
   chrome.storage.sync.get({
      alerts: NOT,
      pdf: PDF,
      tmpman: TMPMAN,
      tempo: amount,
      url: iURL,
      emp: EMP,
	   ip: IP,
	   pl: PL
   }, function(items) {
   	$(':checkbox', '#options-box').removeAttr('checked');
      
      $("#NOT").prop('checked', items.alerts);
   	$("#PDF").prop('checked', items.pdf);
      
      //alert(items.tempo);
      if (items.tempo != null && items.tempo != '[object Object]') {
         $("#TMPMAN").prop('checked', items.tmpman);
      } else {
         $("#TMPMAN").prop('checked', false);

         var valor = 1.0;
         $("#slider-range-max").slider("value", valor);
         $("#amount").val(valor);

         var hours = Math.floor(valor / 60);
         var minutes = valor - (hours * 60);
         //if(hours.toString().length == 1) hours = '0' + hours;
         if (hours == 0 && minutes == 0) minutes = '01';
         if (minutes.toString().length == 1) minutes = '0' + minutes;

         $('#horas').val(hours + ':' + minutes + 'hs');
   }
      
      if (items.tempo != null) {
         if (typeof items.tempo != 'object' ) {
            $("#slider-range-max").slider("value", items.tempo);
            var valor = $("#slider-range-max").slider("value");
            $("#amount").val(valor);

            var hours = Math.floor(valor / 60);
            var minutes = valor - (hours * 60);
            //if(hours.toString().length == 1) hours = '0' + hours;
            if (hours == 0 && minutes == 0) minutes = '01';
            if (minutes.toString().length == 1) minutes = '0' + minutes;

            $('#horas').val(hours + ':' + minutes + 'hs');
         }
      }

      if (items.url != null) {
         if (typeof items.url != 'object' ) {
            document.getElementById('iURL').value = items.url;
         }
      }
      
      if (items.emp != null) {
         if (typeof items.emp != 'object' ) {
            document.getElementById('EMP').value = items.emp;
         }
      }
      
      if (items.ip != null) {
         if (typeof items.ip != 'object' ) {
            document.getElementById('IP').value = items.ip;
         }
      }
      
      if (items.pl != null) {
         if (typeof items.pl != 'object' ) {
            document.getElementById('PL').value = items.pl;
         }
      }
      
   });
}

$("#slider-range-max").slider({
   range: "max",
   min: 0,
   max: 1440,
   value: 1,
   //values: [0.01667, 0.5, 1, 1.50, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5, 24],
   step: 15,
   slide: function(e, ui) {
      $("#amount").val(ui.value);
      
      var hours = Math.floor(ui.value / 60);
      var minutes = ui.value - (hours * 60);
      //if(hours.toString().length == 1) hours = '0' + hours;
      if(minutes.toString().length == 1) minutes = '0' + minutes;
      if (hours == 0 && minutes == 0) minutes = '01';
      $('#horas').val(hours + ':' + minutes + 'hs');
   }
});
$("#amount").val($("#slider-range-max").slider("value"));

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
