// Saves options to chrome.storage
function save_options() {
   var NOT = document.getElementById('NOT').checked;
   var PDF = document.getElementById('PDF').checked;
   var URL = document.getElementById('URL').value;
   var EMP = document.getElementById('EMP').value;
   var IP  = document.getElementById('IP').value;
   var PL  = document.getElementById('PL').value;
   
   if (URL.substr(URL.length - 1, 1) == '/') {
      URL = URL.substr(0, URL.length - 1);
   }
   
   chrome.storage.sync.set({
      alerts: NOT,
      pdf: PDF,
      url: URL,
      emp: EMP,
	   ip: IP,
	   pl: PL
   }, function() {
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
      url: URL,
      emp: EMP,
	   ip: IP,
	   pl: PL
   }, function(items) {

   	$(':checkbox', '#options-box').removeAttr('checked');
   	$("#NOT").prop('checked', items.alerts);
   	$("#PDF").prop('checked', items.pdf);
      
      if (items.url != null) {
         if (typeof items.url != 'object' ) {
            document.getElementById('URL').value = items.url;
         } else {
            document.getElementById('URL').value = 'http://192.168.25.110:3125/';
         }
      } else {
         document.getElementById('URL').value = 'http://192.168.25.110:3125/';
      }
      
      if (items.emp != null) {
         if (typeof items.emp != 'object' ) {
            document.getElementById('EMP').value = items.emp;
         } else {
            document.getElementById('EMP').value = "";
         }
      } else {
         document.getElementById('EMP').value = "";
      }
      
      if (items.ip != null) {
         if (typeof items.ip != 'object' ) {
            document.getElementById('IP').value = items.ip;
         } else {
            document.getElementById('IP').value = findIP(addIP);
         }
      } else {
         document.getElementById('IP').value = findIP(addIP);
      }
      
      if (items.pl != null) {
         if (typeof items.pl != 'object' ) {
            document.getElementById('PL').value = items.pl;
         } else {
            document.getElementById('PL').value = "";
         }
      } else {
         document.getElementById('PL').value = "";
      }
      
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
//console.log(Ip);
  IP = Ip;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
