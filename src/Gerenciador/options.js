var Ip = "";
getIPs(function(ip){
   Ip = ip;
   console.log("00=>Ip", Ip, ip);
   document.getElementById('IP').value = Ip;
});

console.log("01=>Ip", Ip);

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

   getIPs(function(ip){Ip = ip;});
   if (Ip != "" && IP != Ip) {IP = Ip;}

   console.log("02=>vars", IP, URL, PL);
   
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

      getIPs(function(ip){Ip = ip;});
      if (Ip != "" && IP != Ip) {IP = Ip;}

      console.log("03=>items", Ip, items);

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
            document.getElementById('IP').value = Ip;
         }
      } else {
         document.getElementById('IP').value = Ip;
      }
      
      if (Ip != "" && document.getElementById('IP').value != Ip) {
         document.getElementById('IP').value = Ip;
      }
      
      if (items.pl != null) {
         if (typeof items.pl != 'object' ) {
            document.getElementById('PL').value = items.pl;
         } else {
            document.getElementById('PL').value = "siarewebpy.pl";
         }
      } else {
         document.getElementById('PL').value = "siarewebpy.pl";
      }
      
   });
}

//get the IP addresses associated with an account
function getIPs(callback){

    //console.log("04=>Ip", Ip);

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


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
