(function() {
	var pageOrchestrator = new PageOrchestrator();
	var corsiTable, corsiBody, appelliSection, appelliBody;

	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null || sessionStorage.getItem("role") != "studente") {
			window.location.href = "loginPage.html";
		} else {
			//display initial content
			pageOrchestrator.start();
			pageOrchestrator.refresh()
		}
		document.getElementById("username").textContent = sessionStorage.getItem("username");
		document.getElementById("role").textContent = sessionStorage.getItem("role");
		document.getElementById("logoutBtn").addEventListener("click", () => {
			sessionStorage.clear();
			window.location.href = "loginPage.html";
		});


	}, false)

	function Corsi(_corsiTable, _corsiBody) {
		this.corsiTable = _corsiTable;
		this.corsiBody = _corsiBody;
		this.messageContainer = document.getElementById("message");


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
				cell.style.textDecoration = "underline";
				cell.style.color = "#007bff";
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
							cell.style.textDecoration = "underline";
							cell.style.color = "#007bff";
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
		this.trashcan = document.getElementById("trashcan");


		this.currentAppelloId = null;
		this.currentCorsoId = null;

		this.reset = function() {
			this.esitoSection.style.display = "none";
			this.esitoContent.innerHTML = "";
			this.rifiutaButton.style.display = "none";
			this.currentAppelloId = null;
			this.currentCorsoId = null;
			this.trashcan.style.display = "none";

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

						const pMatricola = document.createElement("p");
						const strongMat = document.createElement("strong");
						strongMat.textContent = "Matricola: ";
						pMatricola.appendChild(strongMat);
						pMatricola.appendChild(document.createTextNode(esito.matricola));

						const pCognome = document.createElement("p");
						const strongCog = document.createElement("strong");
						strongCog.textContent = "Cognome: ";
						pCognome.appendChild(strongCog);
						pCognome.appendChild(document.createTextNode(esito.cognome));

						const pNome = document.createElement("p");
						const strongNome = document.createElement("strong");
						strongNome.textContent = "Nome: ";
						pNome.appendChild(strongNome);
						pNome.appendChild(document.createTextNode(esito.nome));

						const pEmail = document.createElement("p");
						const strongEmail = document.createElement("strong");
						strongEmail.textContent = "Email: ";
						pEmail.appendChild(strongEmail);
						pEmail.appendChild(document.createTextNode(esito.email));

						const pCorsodiLaurea = document.createElement("p");
						const strongCorsoL = document.createElement("strong");
						strongCorsoL.textContent = "Corso di laurea: ";
						pCorsodiLaurea.appendChild(strongCorsoL);
						pCorsodiLaurea.appendChild(document.createTextNode(esito.corsolaurea));

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
						this.esitoContent.appendChild(pMatricola);
						this.esitoContent.appendChild(pCognome);
						this.esitoContent.appendChild(pNome);
						this.esitoContent.appendChild(pEmail);
						this.esitoContent.appendChild(pCorsodiLaurea);
						this.esitoContent.appendChild(pVoto);
						this.esitoContent.appendChild(pStato);

						if (esito.voto != null && esito.statodivalutazione != "RIFIUTATO") {
							this.rifiutaButton.style.display = "inline-block";
							this.rifiutaButton.disabled = false;
							this.trashcan.style.display = "inline-block";
						} else {
							this.rifiutaButton.style.display = "none";
							this.trashcan.style.display = "none";

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

		// Drag & Drop implementation
		// 1. Set dataTransfer on dragstart
		this.esitoContent.addEventListener("dragstart", (ev) => {
			ev.dataTransfer.setData("text/plain", "esitoContentDragged");
			// You can style the dragging element if you want
		});

		// 2. Allow drop on trashcan
		this.trashcan.addEventListener("dragover", (ev) => {
			ev.preventDefault(); // allow drop
			this.trashcan.style.filter = "brightness(0.8)"; // optional highlight effect
		});

		this.trashcan.addEventListener("dragleave", (ev) => {
			this.trashcan.style.filter = "none"; // remove highlight effect
		});

		// 3. On drop, trigger rifiutaButton click logic
		this.trashcan.addEventListener("drop", (ev) => {
			ev.preventDefault();
			this.trashcan.style.filter = "none";

			// You could also check ev.dataTransfer.getData to confirm
			const data = ev.dataTransfer.getData("text/plain");
			if (data === "esitoContentDragged") {
				// Trigger the rifiuta action programmatically
				document.getElementById("confirmModal").style.display = "flex";
			}
		});

		this.rifiutaButton.addEventListener("click", () => {
			if (!this.currentAppelloId || !this.currentCorsoId) return;

			this.rifiutaButton.disabled = true; // previeni doppio click

			// Costruisci i parametri da inviare


			makeCall("POST", "Esito?appelloId=" + this.currentAppelloId + "&corsoId=" + this.currentCorsoId, null, (req) => {
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
			document.getElementById("confirmModal").style.display = "none";
		});

		/*
		// Modal buttons
		document.getElementById("confirmRifiuta").addEventListener("click", () => {
			document.getElementById("confirmModal").style.display = "none";
			this.rifiutaButton.click(); // trigger the existing logic
		});
		*/

		document.getElementById("cancelModal").addEventListener("click", () => {
			document.getElementById("confirmModal").style.display = "none";
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