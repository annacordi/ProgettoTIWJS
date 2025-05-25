(function() {
	var pageOrchestrator = new PageOrchestrator();
	var corsiTable, corsiBody, appelliSection, appelliBody;

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
			makeCall("GET", "StudenteHomePage", null,
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
			let self = this;
			makeCall("GET", "StudenteHomePage?corsoId=" + corsoId, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						let appelli = JSON.parse(req.responseText);
						appelli.forEach(appello => {
							let row = document.createElement("tr");
							let cell = document.createElement("td");
							cell.textContent = appello.data; // Assumi che abbia campo `data`
							row.appendChild(cell);

							row.addEventListener("click", () => {
								pageOrchestrator.esito.show(appello.idapp, corsoId);
							});

							self.appelliBody.appendChild(row);
						});
						self.appelliSection.style.display = "block";
					} else {
						document.getElementById("message").textContent = req.responseText;
					}
				}
			});
		};
	}

	function Esito(esitoSection, esitoContent) {
		this.esitoSection = esitoSection;
		this.esitoContent = esitoContent;
		this.rifiutaButton = document.getElementById("rifiutaButton");
		
		this.currentAppelloId = null;
		this.currentCorsoId = null;

		this.reset = function() {
			this.esitoSection.style.display = "none";
			this.esitoContent.innerHTML = "";
			this.rifiutaButton.style.display = "none";
			this.currentAppelloId = null;
			this.currentCorsoId = null;
		};

		this.show = function(appelloId, corsoId) {
			this.reset();
			this.currentAppelloId = appelloId;
			this.currentCorsoId = corsoId;
			
			document.getElementById("corsiSection").style.display = "none";
			document.getElementById("appelliSection").style.display = "none";
			makeCall("GET", "Esito?appelloId=" + appelloId + "&corsoId=" + corsoId, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						const esito = JSON.parse(req.responseText);
						this.esitoContent.innerHTML = "";
						
						const pNomeCorso = document.createElement("p");
						const strongNomeCorso = document.createElement("strong");
						strongNomeCorso.textContent = "Nome corso: ";
						pNomeCorso.appendChild(strongNomeCorso);
						pNomeCorso.appendChild(document.createTextNode(esito.nomecorso));

						const pData = document.createElement("p");
						const strongData = document.createElement("strong");
						strongData.textContent = "Data appello: ";
						pData.appendChild(strongData);
						pData.appendChild(document.createTextNode(esito.data));

						const pVoto = document.createElement("p");
						const strongVoto = document.createElement("strong");
						strongVoto.textContent = "Voto: ";
						pVoto.appendChild(strongVoto);
						pVoto.appendChild(document.createTextNode(esito.voto != null ? esito.voto : "Non definito"));

						const pStato = document.createElement("p");
						const strongStato = document.createElement("strong");
						strongStato.textContent = "Stato: ";
						pStato.appendChild(strongStato);
						pStato.appendChild(document.createTextNode(esito.statodivalutazione));

						// Appendo tutti i paragrafi al contenuto
						this.esitoContent.appendChild(pNomeCorso);
						this.esitoContent.appendChild(pData);
						this.esitoContent.appendChild(pVoto);
						this.esitoContent.appendChild(pStato);
						
						if (esito.voto != null && esito.statodivalutazione != "RIFIUTATO") {
						    this.rifiutaButton.style.display = "inline-block";
						    this.rifiutaButton.disabled = false;
						} else {
						    this.rifiutaButton.style.display = "none";
							const msg = document.createElement("p");
							msg.textContent = "Il voto è stato rifiutato";
							this.esitoContent.appendChild(msg);
						}
						
						this.esitoSection.style.display = "block";
					} else {
						document.getElementById("message").textContent = req.responseText;
					}
				}
			});
		};
		
		this.rifiutaButton.addEventListener("click", () => {
		    if (!this.currentAppelloId || !this.currentCorsoId) return;

		    this.rifiutaButton.disabled = true; // previeni doppio click

		    // Costruisci i parametri da inviare


		    makeCall("POST", "Esito?appelloId=" + this.currentAppelloId + "&corsoId=" + this.currentCorsoId,null, (req) => {
		        if (req.readyState === XMLHttpRequest.DONE) {
		            if (req.status === 200) {
						pageOrchestrator.esito.show(this.currentAppelloId, this.currentCorsoId);
		                // Nascondi bottone e mostra messaggio
		                this.rifiutaButton.style.display = "none";
		                const msg = document.createElement("p");
		                msg.textContent = "Il voto è stato rifiutato";
		                this.esitoContent.appendChild(msg);
		            } else {
		                document.getElementById("message").textContent = "Errore nel rifiuto del voto: " + req.responseText;
		                this.rifiutaButton.disabled = false;
		            }
		        }
		    });
		});
	}

	function PageOrchestrator() {
		this.corsi = null;
		this.appelli = null;

		this.start = function() {
			this.corsi = new Corsi(document.getElementById("corsiTable"), document.getElementById("corsiBody")
			);
			this.appelli = new Appelli(
				document.getElementById("appelliSection"),
				document.getElementById("appelliBody")
			);

			this.esito = new Esito(
				document.getElementById("esitoSection"),
				document.getElementById("esitoContent")
			);


		};

		this.refresh = function() {
			this.corsi.reset();
			this.corsi.show();
			this.appelli.reset();
		};
	}

})()