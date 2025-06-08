(function() {//iife immediately invoked function expression
	let pageOrchestrator = new PageOrchestrator();


	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null || sessionStorage.getItem("role") != "docente") {
			window.location.href = "loginPage.html";
		} else {
			pageOrchestrator.start();
			pageOrchestrator.refresh()
		}
		document.getElementById("username").textContent = sessionStorage.getItem("username");
		document.getElementById("role").textContent = sessionStorage.getItem("role");
		//azione di logout
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
		//mostra la lista dei corsi di un certo docente
		this.show = function() {
			var self = this;
			makeCall("GET", "DocenteHomePage", null,
				function(req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						if (req.status == 200) {
							var corsiListToShow = JSON.parse(message);
							//se non ci sono corsi da mostrare
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
			this.corsiBody.innerHTML = "";
			corsiList.forEach(corso => {
				let row = document.createElement("tr");
				let cell = document.createElement("td");
				cell.textContent = corso.nomecorso;
				cell.style.textDecoration = "underline";
				cell.style.color = "#007bff";
				row.appendChild(cell);

				row.addEventListener("click", () => {
					//chiama la funzione per mostrare gli appelli di un certo corso
					pageOrchestrator.appelli.show(corso.idcorso);
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
		//mostra gli appelli
		this.show = function(corsoId) {
			this.reset();
			makeCall("GET", "DocenteHomePage?corsoId=" + corsoId, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						let appelli = JSON.parse(req.responseText);
						appelli.forEach(appello => {
							let row = document.createElement("tr");
							let cell = document.createElement("td");
							//gli appelli vengono mostrati in base alla data
							cell.textContent = appello.data;
							cell.style.textDecoration = "underline";
							cell.style.color = "#007bff";
							row.appendChild(cell);

							row.addEventListener("click", () => {
								//chiamo la funzione iscritti per mostrare tutti gli studenti iscritti ad un certo appello
								pageOrchestrator.iscritti.show(appello.idapp);
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

		this.iscrittiList = [];
		this.currentSort = { key: null, ascending: true };

		this.reset = function() {
			this.iscrittiSection.style.display = "none";
			this.iscrittiBody.innerHTML = "";
			this.currentAppelloId = null;
			this.iscrittiList = [];
			this.currentSort = { key: null, ascending: true };
		};

		//salvo in iscrittilist gli studenti di questo appello
		this.show = function(appelloId) {
			this.reset();
			this.currentAppelloId = appelloId;

			document.getElementById("corsiTable").style.display = "none";
			document.getElementById("corsiSection").style.display = "none";
			document.getElementById("appelliSection").style.display = "none";

			let self = this;
			makeCall("GET", "Iscritti?appId=" + appelloId, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						self.iscrittiList = JSON.parse(req.responseText);
						self.renderTable(self.iscrittiList);
						self.iscrittiSection.style.display = "block";
					} else {
						document.getElementById("message").textContent = req.responseText;
					}
				}
			});
		};

		//viene creata la tabella con gli studenti presenti in iscrittilist
		this.renderTable = function(list) {
			this.iscrittiBody.innerHTML = "";
			list.forEach(studente => {
				let row = document.createElement("tr");
				["matricola", "cognome", "nome", "email", "corsolaurea", "voto", "statodivalutazione"].forEach(field => {
					let cell = document.createElement("td");
					cell.textContent = studente[field];
					row.appendChild(cell);
				});

				//viene mostrato il bottone di modifica con un suo listener
				let azioniCell = document.createElement("td");
				if (!["PUBBLICATO", "RIFIUTATO", "VERBALIZZATO"].includes(studente["statodivalutazione"])) {
					let modificaButton = document.createElement("button");
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
		};

		//funzione usata per riordinare i valori nella tabella
		this.sortBy = function(key) {
			if (this.currentSort.key === key) {
				this.currentSort.ascending = !this.currentSort.ascending;
			} else {
				this.currentSort.key = key;
				this.currentSort.ascending = true;
			}

			const ascending = this.currentSort.ascending;
			this.iscrittiList.sort((a, b) => {
				let valA = a[key];
				let valB = b[key];

				let numA = parseFloat(valA);
				let numB = parseFloat(valB);
				if (!isNaN(numA) && !isNaN(numB)) {
					valA = numA;
					valB = numB;
				} else {
					if (typeof valA === "string") valA = valA.toLowerCase();
					if (typeof valB === "string") valB = valB.toLowerCase();
				}

				if (valA < valB) return ascending ? -1 : 1;
				if (valA > valB) return ascending ? 1 : -1;
				return 0;
			});

			this.renderTable(this.iscrittiList);
		};

		//funzione utilizzata per aggiungere ai titoli della tabella le funzionalità di riordino
		this.attachSortHandlers = function() {
			const headers = this.iscrittiSection.querySelectorAll("thead a[data-order]");
			headers.forEach(header => {
				header.addEventListener("click", (e) => {
					e.preventDefault();
					const key = header.getAttribute("data-order");
					this.sortBy(key);
				});
			});
		};

		//funzione per l'inserimento multiplo per piu studenti
		this.showInserimentoMultiplo = function() {
			const modal = document.getElementById("inserimentoMultiploModal");
			const tbody = document.getElementById("inserimentoMultiploBody");
			tbody.innerHTML = "";

			// filtra iscritti che hanno lo stato di valutazione a non inserito
			const nonInseriti = this.iscrittiList.filter(s => s.statodivalutazione === "NON_INSERITO");

			if (nonInseriti.length === 0) {
				const row = document.createElement("tr");
				const cell = document.createElement("td");
				cell.setAttribute("colspan", "6");
				cell.textContent = "Nessuno studente nello stato NON_INSERITO";
				row.appendChild(cell);
				tbody.appendChild(row);
			} else {
				nonInseriti.forEach(studente => {
					const row = document.createElement("tr");
					row.setAttribute("data-studente-id", studente.id);
					const fields = ["matricola", "nome", "cognome", "email", "corsolaurea"];
					fields.forEach(field => {
						const cell = document.createElement("td");
						cell.textContent = studente[field];
						row.appendChild(cell);
					});
					const votoCell = document.createElement("td");
					const input = document.createElement("input");
					input.type = "text";
					input.name = "voto";
					votoCell.appendChild(input);
					row.appendChild(votoCell);

					tbody.appendChild(row);
				});
			}
			modal.style.display = "flex";
			document.body.style.overflow = "hidden";
		};
	}

	//mostra la pagina per la modifica del voto dello studente
	function mostraModificaStudente(iscritto) {
		document.getElementById("message").textContent = "";

		//nascondo le altre sezioni
		document.getElementById("corsiSection").style.display = "none";
		document.getElementById("appelliSection").style.display = "none";
		document.getElementById("iscrittiSection").style.display = "none";
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

							//salva lo studente id e l'id dell'appello
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

	//funzione per mostrare il verbale
	function mostraVerbale(verbale, infoverbalizzati) {
		//nascondo le altre sezioni
		document.getElementById("corsiSection").style.display = "none";
		document.getElementById("corsiTable").style.display = "none";
		document.getElementById("appelliSection").style.display = "none";
		document.getElementById("iscrittiSection").style.display = "none";

		const verbaleSection = document.getElementById('verbaleSection');
		verbaleSection.style.display = 'block';

		//mostro i dati relatici al verbale
		document.getElementById('verbaleId').textContent = verbale.idverb || '-';
		document.getElementById('verbaleData').textContent = verbale.data || '-';
		document.getElementById('verbaleOra').textContent = verbale.ora || '-';
		document.getElementById('verbaleDataApp').textContent = verbale.dataapp || '-';


		const tbody = document.getElementById('infoverbalizzatiBody');
		tbody.innerHTML = '';

		//mostro i dati relativi agli studenti verbalizzati
		document.getElementById('infoverbalizzatiBody');
		infoverbalizzati.forEach(item => {
			let row = document.createElement("tr");
			["matricola", "cognome", "nome", "voto", "statodivalutazione"].forEach(field => {
				let cell = document.createElement("td");
				cell.textContent = item[field];
				row.appendChild(cell);
			});

			tbody.appendChild(row);
		});
	}

	//funzione per mostrare l'elenco dei verbali
	function mostraElencoVerbali() {
		//nascondo le altre sezioni
		document.getElementById("corsiSection").style.display = "none";
		document.getElementById("corsiTable").style.display = "none";
		document.getElementById("appelliSection").style.display = "none";
		document.getElementById("iscrittiSection").style.display = "none";
		document.getElementById("message").textContent = "";

		document.getElementById("elencoVerbaliSection").style.display = "block";

		//viene mostrata la lista dei verbali
		this.show = function() {
			var self = this;
			makeCall("GET", "ElencoVerbali", null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						const verbali = JSON.parse(req.responseText);
						verbali.forEach(verbale => {
							let row = document.createElement("tr");

							["nomecorso", "dataapp", "dataverb"].forEach(field => {
								let cell = document.createElement("td");
								cell.textContent = verbale[field];
								row.appendChild(cell);
							});

							this.elencoVerbaliBody.appendChild(row);
						});
					} else {
						document.getElementById("message").textContent = req.responseText;
					}
				}
			});
		}
		show();
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
			this.iscritti.attachSortHandlers();


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
							// la servlet risponde con verbale e infoverbalizzati in html

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

			//bottone per mostrare verbali si un certo docente
			document.getElementById("verbaliButton").addEventListener("click", () => {
				mostraElencoVerbali();
			})

			//bottone per pubblicare 
			document.getElementById("pubblicaButton").addEventListener("click", () => {
				if (this.iscritti.currentAppelloId == null) {
					document.getElementById("message").textContent = "Nessun appello selezionato.";
					return;
				}
				makeCall("POST", "Iscritti?appId=" + this.iscritti.currentAppelloId, null, (req) => {
					if (req.readyState === XMLHttpRequest.DONE) {
						if (req.status === 200) {
							//ricarico la lista degli iscritti
							this.iscritti.show(this.iscritti.currentAppelloId);
							document.getElementById("message").textContent = "Voti pubblicati con successo.";
						} else {
							document.getElementById("message").textContent = req.responseText;
						}
					}
				});
			});

			//bottone per l'inserimento multiplo
			document.getElementById("inserimentoMultiploBtn").addEventListener("click", () => {
				this.iscritti.showInserimentoMultiplo();
			});

			//bottone per chiudere la finestra di inserimento multiplo
			document.getElementById("closeInserimentoModal").addEventListener("click", () => {
				document.getElementById("inserimentoMultiploModal").style.display = "none";
			});

			//modifica dello studente
			document.getElementById("modificaStudenteForm").addEventListener("submit", function(e) {
				e.preventDefault();
				//const form = e.target;
				const studenteId = parseInt(document.getElementById("modificaStudenteForm").dataset.studenteId, 10);
				const appId = parseInt(document.getElementById("modificaStudenteForm").dataset.appId, 10);
				const voto = document.getElementById("modVoto").value;

				const validi = [
					"18",
					"19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "30L", "30l", "ASSENTE", "RIPROVATO"
				];

				if (!validi.includes(voto)) {
					document.getElementById("message").textContent = "Voto non valido, riprova.";
					return;
				}

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


			//viene chiamata la post per ogni studente selezionato dall'inserimento multiplo
			document.getElementById("inserimentoMultiploForm").addEventListener("submit", function(event) {
				event.preventDefault();

				const appId = pageOrchestrator.iscritti.currentAppelloId; // get current appId
				const rows = document.querySelectorAll("#inserimentoMultiploBody tr");

				const requests = Array.from(rows).map(row => {
					const studenteId = row.getAttribute("data-studente-id");
					const votoInput = row.querySelector("input[name='voto']");
					const voto = votoInput.value.trim();

					if (voto !== "") {
						return new Promise((resolve, reject) => {
							makeCall("POST", `ModificaStudente?studenteId=${studenteId}&appId=${appId}&voto=${voto}`, null, (req) => {
								if (req.readyState === XMLHttpRequest.DONE) {
									if (req.status === 200) {
										console.log(`Voto inserito per studente ${studenteId}`);
										resolve();
									} else {
										console.error(`Errore per studente ${studenteId}: ${req.status}`);
										reject(req.status);
									}
								}
							});
						});
					} else {
						return Promise.resolve();
					}
				});

				//aspetto che tutte le post siano terminate
				Promise.all(requests).then(() => {
					pageOrchestrator.iscritti.show(appId);
					document.getElementById("inserimentoMultiploModal").style.display = "none";
					document.body.style.overflow = "auto";
				}).catch(error => {
					console.error("Errore durante l'inserimento dei voti:", error);
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