const {ipcRenderer} = require('electron')
var os = require("os");
var exec = require('child_process').exec;
var SNID = null
ipcRenderer.on('getSNID', (event, arg) => {if(arg!=null){SNID=arg;}});

document.querySelector('.fa-refresh').addEventListener('click', function(){if(updating){return false;}else{return serviceUpdate();}});
var updating = false;
function failUpdate(info){
	console.error(info);
	ipcRenderer.send('errorCollect',info);
	updating = false;	
	setTimeout(function(){
		$(".fa-refresh").removeClass( "fa-spin" );
		$(".fa-circle").addClass("error");
		$(".status").text(info);
	}, 1000);
};
function completeUpdate(data){
	updating = false;
	setTimeout(function(){
		$(".fa-refresh").removeClass( "fa-spin" );
		$(".fa-circle").addClass("online");
	}, 1000);
};
function serviceUpdate(){
	updating = true;
	$(".fa-refresh").addClass("fa-spin");
	$(".fa-circle").removeClass( "error" );
	$(".fa-circle").removeClass( "online" );
	$(".status").text("");
	if(SNID && SNID==null){return failUpdate("Serial Error.");}
	$.ajax({type: "POST",url: "response.html",
		data: "PCNAME="+os.hostname()+"&SNID="+SNID,
		success: function(response){
			if (response && response=="authenticated"){completeUpdate();}else{failUpdate("Authentication Error.");}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {failUpdate("Server Error.");}
	});
};


ipcRenderer.send('sendSNID');

setTimeout(function(){
	$("#PCNAME").text(os.hostname());
	$("#SNID").text(SNID);
	serviceUpdate();
}, 1000);

function changeHostname(newName){
	let cmds = null;
	switch (os.platform()) {
		case "win32": // Windows
			cmds = [
				"wmic computersystem where caption='"+os.hostname()+"' rename '"+newName+"'",
				"Shutdown /r /f /t 05"
			];
		break;case "linux": // Linux
			cmds = [
				"sudo sed -i 's/"+os.hostname()+"/"+newName+"/g' /etc/hosts",
				"sudo sed -i 's/"+os.hostname()+"/"+newName+"/g' /etc/hostname",
				"sudo hostname '"+newName+"'"
			];
		break;case "darwin": // Mac
			cmds = [
				"sudo scutil --set HostName '"+newName+"'",
				"sudo shutdown -r 5"
			];
	};
	if(cmds!=null){
		for (i = 0; i < cmds.length; i++) {exec(cmds[i], function(error, stdout, stderr) {if(error){return console.error(error);}else{console.log(stdout);}});};
	}else{console.error("This OS is not supported.");}
}

console.log("Service JS Loaded.")