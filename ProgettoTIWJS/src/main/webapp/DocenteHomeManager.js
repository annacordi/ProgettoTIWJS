(function() {
	var pageOrchestrator = new PageOrchestrator();
	var corsiTable, corsiBody, appelliSection, appelliBody;

	const URL_DOCENTE_HOME = "DocenteHomePage";
	const URL_ISCRITTI = "Iscritti";


	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "loginPage.html";
		} else {//display initial content
			pageOrchestrator.start();
			pageOrchestrator.refresh()
		}
		document.getElementById("username").textContent = sessionStorage.getItem("username");

	}, false)

	function Corsi(_corsiTable, _corsiBody) {
		this.corsiTable = _corsiTable;
		this.corsiBody = _corsiBody;
		this.messageContainer = document.getElementById("message"); // ← AGGIUNGI QUESTO

		
		this.reset = function() {
			this.corsiTable.style.visibility = "hidden";
		}
		this.show = function() {
			var self = this;
			makeCall("GET", URL_DOCENTE_HOME, null,
				function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						if (req.status == 200) {
							var corsiListToShow = JSON.parse(message);
							if (corsiListToShow.length == 0) {
								self.messageContainer.textContent = "No CORSI";
								return;
							}
							
							self.update(corsiListToShow);
							self.corsiTable.style.visibility = "visible";

						} else {
							self.messageContainer.textContent = message;
						}


					}
				}
			);
		};

		this.update = function(corsiList) {
				this.corsiBody.innerHTML = ""; // Pulisce righe precedenti
				corsiList.forEach(corso => {
					let row = document.createElement("tr");
					let cell = document.createElement("td");
					cell.textContent = corso.nomecorso;
					row.appendChild(cell);
					
					row.addEventListener("click", () => {
					            pageOrchestrator.appelli.show(corso.idcorso); // Richiama funzione con id corso
					        });
							
					this.corsiBody.appendChild(row);
				});
			}; 
	}
	
	function Appelli(appelliSection, appelliBody) {
	    this.appelliSection = appelliSection;
	    this.appelliBody = appelliBody;

	    this.reset = function() {
	        this.appelliSection.style.display = "none";
	        this.appelliBody.innerHTML = "";
	    };

	    this.show = function(corsoId) {
	        this.reset();
	        makeCall("GET", "DocenteHomePage?corsoId=" + corsoId, null, (req) => {
	            if (req.readyState === XMLHttpRequest.DONE) {
	                if (req.status === 200) {
	                    let appelli = JSON.parse(req.responseText);
	                    appelli.forEach(appello => {
	                        let row = document.createElement("tr");
	                        let cell = document.createElement("td");
	                        cell.textContent = appello.data; // Assumi che abbia campo `data`
	                        row.appendChild(cell);
	                        this.appelliBody.appendChild(row);
	                    });
	                    this.appelliSection.style.display = "block";
	                } else {
	                    document.getElementById("message").textContent = req.responseText;
	                }
	            }
	        });
	    };
	}

	
	
	
	function PageOrchestrator(){
	        this.corsi = null;

	        this.start = function(){
				this.corsi = new Corsi(document.getElementById("corsiTable"),document.getElementById("corsiBody")
			);
			this.appelli = new Appelli(
			    document.getElementById("appelliSection"),
			    document.getElementById("appelliBody")
			);
			};


	        this.refresh = function(){
				this.corsi.reset();
				this.corsi.show();
				this.appelli.reset();
	        };
	    }

})()