(function() {
	var pageOrchestrator = new PageOrchestrator();
	var corsiTable, corsiBody, appelliSection, appelliBody, verbaleSection;

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

							row.addEventListener("click", () => {
								pageOrchestrator.iscritti.show(appello.idapp); // Trigger Iscritti
							});

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

	function Iscritti(iscrittiSection, iscrittiBody) {
		this.iscrittiSection = iscrittiSection;
		this.iscrittiBody = iscrittiBody;
		this.currentAppelloId = null;


		this.reset = function() {
			this.iscrittiSection.style.display = "none";
			this.iscrittiBody.innerHTML = "";
			this.currentAppelloId = null;
		};

		this.show = function(appelloId) {
			this.reset();
			this.currentAppelloId = appelloId;

			document.getElementById("corsiTable").style.display = "none";
			document.getElementById("corsiSection").style.display = "none";
			document.getElementById("appelliSection").style.display = "none";

			makeCall("GET", "Iscritti?appId=" + appelloId, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						let iscritti = JSON.parse(req.responseText);
						iscritti.forEach(studente => {
							let row = document.createElement("tr");

							["matricola", "cognome", "nome", "email", "corsolaurea", "voto", "statodivalutazione"].forEach(field => {
								let cell = document.createElement("td");
								cell.textContent = studente[field];
								row.appendChild(cell);
							});

							// Add actions column
							let azioniCell = document.createElement("td");
							// You can add buttons here


							if (!["PUBBLICATO", "RIFIUTATO", "VERBALIZZATO"].includes(studente["statodivalutazione"])) {
								let modificaButton;
								modificaButton = document.createElement("button");
								modificaButton.textContent = "MODIFICA";
								modificaButton.addEventListener("click", () => {
									document.getElementById("corsiTable").style.display = "none";
									document.getElementById("corsiSection").style.display = "none";
									document.getElementById("appelliSection").style.display = "none";
									document.getElementById("iscrittiSection").style.display = "none";
									mostraModificaStudente(studente);
								});
								azioniCell.appendChild(modificaButton);
							}
							row.appendChild(azioniCell);

							this.iscrittiBody.appendChild(row);
						});
						this.iscrittiSection.style.display = "block";
					} else {
						document.getElementById("message").textContent = req.responseText;
					}
				}
			});
		};
	}




	function mostraModificaStudente(iscritto) {
		// Pulisce eventuali messaggi
		document.getElementById("message").textContent = "";

		// Mostra solo la sezione di modifica
		document.getElementById("modificaStudenteSection").style.display = "block";

		this.show = function() {
			var self = this;
			makeCall("GET", "ModificaStudente?studenteId=" + iscritto.id + "&appId=" + iscritto.idapp, null,
				function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						if (req.status == 200) {
							const studente = JSON.parse(req.responseText);
							document.getElementById("modMatricola").textContent = studente.matricola;
							document.getElementById("modCognome").textContent = studente.cognome;
							document.getElementById("modNome").textContent = studente.nome;
							document.getElementById("modEmail").textContent = studente.email;
							document.getElementById("modLaurea").textContent = studente.corsolaurea;
							document.getElementById("modVoto").value = studente.voto || "";
							document.getElementById("modStato").textContent = studente.statodivalutazione;

							// Store IDs in hidden fields if needed
							document.getElementById("modificaStudenteForm").dataset.studenteId = studente.id;
							document.getElementById("modificaStudenteForm").dataset.appId = studente.idapp;

						} else {
							document.getElementById("message").textContent = req.responseText;
						}


					}
				}
			);
		}
		show();

	}

	function mostraVerbale(verbale, infoverbalizzati) {
		// Mostra la section verbale e nasconde le altre
		document.getElementById("corsiSection").style.display = "none";
		document.getElementById("corsiTable").style.display = "none";
		document.getElementById("appelliSection").style.display = "none";
		document.getElementById("iscrittiSection").style.display = "none";

		const verbaleSection = document.getElementById('verbaleSection');
		verbaleSection.style.display = 'block';

		// Popola dati verbale
		document.getElementById('verbaleId').textContent = verbale.idverb || '-';
		document.getElementById('verbaleData').textContent = verbale.data || '-';
		document.getElementById('verbaleOra').textContent = verbale.ora || '-';
		document.getElementById('verbaleDataApp').textContent = verbale.dataapp || '-';
/*
		// Popola tabella studenti verbalizzati
		const tbody = document.getElementById('infoverbalizzatiBody');
		tbody.innerHTML = ''; // svuota la tabella
		tbody.style.display = 'block';*/
		document.getElementById('infoverbalizzatiBody');
		infoverbalizzati.forEach(item => {
			let row = document.createElement("tr");
			["matricola", "cognome", "nome", "voto", "statodivalutazione"].forEach(field => {
				let cell = document.createElement("td");
				cell.textContent = item[field];
				row.appendChild(cell);
			});

			let azioniCell = document.createElement("td");
		});
		infoverbalizzati.style.display='block';
	}








	function PageOrchestrator() {
		this.corsi = null;
		this.appelli = null;
		this.iscritti = null;

		this.start = function() {
			this.corsi = new Corsi(document.getElementById("corsiTable"), document.getElementById("corsiBody")
			);
			this.appelli = new Appelli(
				document.getElementById("appelliSection"),
				document.getElementById("appelliBody")
			);
			this.iscritti = new Iscritti(
				document.getElementById("iscrittiSection"),
				document.getElementById("iscrittiBody")
			);

			// Listener bottone VERBALI
			document.getElementById("verbalizzaButton").addEventListener("click", () => {
				if (this.iscritti.currentAppelloId == null) {
					document.getElementById("message").textContent = "Nessun appello selezionato.";
					return;
				}
				// POST per richiedere il verbale
				makeCall("POST", "PaginaVerbale?appId=" + this.iscritti.currentAppelloId, null, (req) => {
					if (req.readyState === XMLHttpRequest.DONE) {
						if (req.status === 200) {
							// la servlet risponde con verbale e infoverbalizzati in html, quindi dobbiamo modificare la servlet per restituire JSON oppure parse HTML...
							// Qui assumiamo che la servlet torni JSON (modifica servlet se serve)

							// Se la servlet ritorna JSON, deserializziamo:
							let response = null;
							try {
								response = JSON.parse(req.responseText);
							} catch (e) {
								document.getElementById("message").textContent = "Errore parsing verbale JSON.";
								return;
							}

							mostraVerbale(response.verbale, response.infoverbalizzati);
							document.getElementById("message").textContent = "";
						} else {
							document.getElementById("message").textContent = req.responseText;
						}
					}
				});
			});


			document.getElementById("pubblicaButton").addEventListener("click", () => {
				if (this.iscritti.currentAppelloId == null) {
					document.getElementById("message").textContent = "Nessun appello selezionato.";
					return;
				}
				makeCall("POST", "Iscritti?appId=" + this.iscritti.currentAppelloId, null, (req) => {
					if (req.readyState === XMLHttpRequest.DONE) {
						if (req.status === 200) {
							// Dopo il POST, ricarica la lista degli iscritti
							this.iscritti.show(this.iscritti.currentAppelloId);
							document.getElementById("message").textContent = "Voti pubblicati con successo.";
						} else {
							document.getElementById("message").textContent = req.responseText;
						}
					}
				});
			});

			document.getElementById("modificaStudenteForm").addEventListener("submit", function(e) {
				e.preventDefault();
				//const form = e.target;
				const studenteId = parseInt(document.getElementById("modificaStudenteForm").dataset.studenteId, 10);
				const appId = parseInt(document.getElementById("modificaStudenteForm").dataset.appId, 10);
				const voto = document.getElementById("modVoto").value;

				makeCall("POST", "ModificaStudente?studenteId=" + studenteId + "&appId=" + appId + "&voto=" + voto, null, (req) => {
					if (req.readyState === XMLHttpRequest.DONE) {
						if (req.status === 200) {
							document.getElementById("message").textContent = "Voto modificato con successo.";
							document.getElementById("modificaStudenteSection").style.display = "none";
							pageOrchestrator.iscritti.show(appId);
							// Dopo il POST, ricarica la lista degli iscritti

						} else {
							document.getElementById("message").textContent = req.responseText;
						}
					}
				});
			});



		};


		this.refresh = function() {
			this.corsi.reset();
			this.corsi.show();
			this.appelli.reset();
			this.iscritti.reset();
		};
	}

}
)()