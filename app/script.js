const {ipcRenderer, remote} = require('electron');
var serialNumber = require('serial-number');
var os = require("os");
function Exit(){ipcRenderer.send('close');};
document.querySelector('.close').addEventListener('click', Exit);
function sendError(info){
	$("h1").addClass("error");
	$("h1").find("b").text(info);
	ipcRenderer.send('errorCollect',info);
	console.error(info);
	$(".details").addClass("error");
	var counter = 6;
	setInterval(function() {
		counter--;
		$(".details").text("Exiting in "+counter+"...");
		//if (counter <= 0) {Exit();}
	}, 1000);
};
var percent = 0;
function Update(status, txt) {
	if (status){percent=status}
	if (txt){$("h1").find("b").text(txt);}
	let $bar = $(".progress__bar");
	percent += Math.random() * 1.8;
	percent = parseFloat(percent.toFixed(1));
	$(".progress__text").find("em").text(percent + "%");
	if (percent >= 100) {
		percent = 100;
		$(".progress").addClass("progress--complete");
		$bar.addClass("bar-blue");
		$(".progress__text").find("em").text("Complete");
		$("h1").find("b").text("Complete.");
	} else {
		if (percent >= 85) {
			$bar.addClass("bar-green");
		} else if (percent >= 55) {
			$bar.addClass("bar-yellow");
		} else if (percent >= 30) {
			$bar.addClass("bar-orange");
		}
	}
	$bar.css({width: percent + "%"});
};

setTimeout(Bootstrap, 1000);
function Bootstrap() {
	$("#PCNAME").text(os.hostname());
	Update(0,"Finding SNID...");
	serialNumber(function (err, GotSNID) {
		if(err){sendError("Failed to find SNID.");}
		if(GotSNID){
			Update(10,"SNID Found.");
			ipcRenderer.send('sendSNID',GotSNID);
			$(".details").find("#SNID").text(GotSNID);
			setTimeout(function(){
				Update(50,"Testing Connection...");
				$.ajax({type: "POST",url: "response.html",
					data: "PCNAME="+os.hostname()+"&SNID="+GotSNID,
					success: function(response){
						if (response=="authenticated"){
							Update(100,"Connection Established.");
							$(".details").addClass("online");
							setTimeout(function(){
								ipcRenderer.send('finish');
							}, 1000);
						}else{sendError("Authentication error.");}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						sendError("Server Error.");
					}
				});
			}, 1000);
		}else{sendError("Failed to find SNID.");}
	});
};

console.log("Background JS Loaded.")
