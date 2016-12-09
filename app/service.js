var serialNumber = require('serial-number');
var os = require("os");
var exec = require('child_process').exec;
var serial = null;

$("#PCNAME").text(os.hostname());
serialNumber(function (err, SNID) {
	if(err){console.error("Failed to find SNID.");}
	if(SNID){
		$("#SNID").text(SNID);
		serial = SNID;
		serviceUpdate();
	}else{console.error("Failed to find SNID.");}
});

var updating = false;
function failUpdate(data){
	console.error(data);
	updating = false;	
	setTimeout(function(){
		$(".fa-refresh").removeClass( "fa-spin" );
		$(".fa-circle").addClass("error");
		$(".status").text(data);
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
	if(serial && serial==null){return failUpdate("Serial Error.");}
	$.ajax({type: "POST",url: "response.html",
		data: "PCNAME="+os.hostname()+"&SNID="+serial,
		success: function(response){
			if (response && response=="authenticated"){completeUpdate();}else{failUpdate("Authentication Error.");}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {failUpdate("Server Error.");}
	});
};

document.querySelector('.fa-refresh').addEventListener('click', function(){
	if(updating){return false;}else{return serviceUpdate();}
});

function changeHostname(newName){
	let cmd = false;
	let fin = false;
	switch (os.platform()) {
		case "win32": // Windows
			cmd = "WMIC computersystem where caption='"+os.hostname()+"' rename '"+newName+"'";
			fin = "Shutdown /r /f /t 05";
		break;case "linux": // Linux
			console.error("Linux renaming is not yet supported.");
		break;case "darwin": // Mac
			cmd = "sudo scutil --set HostName "+newName+"";
			fin = "sudo shutdown -r 5";
	};
	if(cmd){
		exec(cmd, function(error, stdout, stderr) {if(error){console.error(error);}else{
			console.log(stdout);
			console.log(stderr);
			//if(fin){exec(fin, function(error, stdout, stderr) {if(error){console.error(error);}else{console.log(stdout);}})}
		}});
	}else{console.error("shell not supplied.");}
}

console.log("Service JS Loaded.")