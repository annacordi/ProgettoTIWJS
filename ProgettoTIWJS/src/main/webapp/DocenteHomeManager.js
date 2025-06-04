(function() {
	var pageOrchestrator = new PageOrchestrator();
	var corsiTable, corsiBody, appelliSection, appelliBody, verbaleSection;

	const URL_DOCENTE_HOME = "DocenteHomePage";
	const URL_ISCRITTI = "Iscritti";



	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null || sessionStorage.getItem("role")!="docente") {
			window.location.href = "loginPage.html";
		} else {//display initial content
			
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

		// Add this:
		this.iscrittiList = [];  // store all iscritti here
		this.currentSort = { key: null, ascending: true };  // track current sort state

		this.reset = function() {
			this.iscrittiSection.style.display = "none";
			this.iscrittiBody.innerHTML = "";
			this.currentAppelloId = null;
			this.iscrittiList = [];
			this.currentSort = { key: null, ascending: true };
		};

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

		// Add this method for rendering the table rows from a list:
		this.renderTable = function(list) {
			this.iscrittiBody.innerHTML = "";
			list.forEach(studente => {
				let row = document.createElement("tr");
				["matricola", "cognome", "nome", "email", "corsolaurea", "voto", "statodivalutazione"].forEach(field => {
					let cell = document.createElement("td");
					cell.textContent = studente[field];
					row.appendChild(cell);
				});

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

		// Add this method to sort the list and re-render
		this.sortBy = function(key) {
			if (this.currentSort.key === key) {
				this.currentSort.ascending = !this.currentSort.ascending; // toggle order
			} else {
				this.currentSort.key = key;
				this.currentSort.ascending = true; // default ascending
			}

			const ascending = this.currentSort.ascending;

			this.iscrittiList.sort((a, b) => {
				let valA = a[key];
				let valB = b[key];

				// Try to parse as numbers for numeric sort (e.g. voto, matricola)
				let numA = parseFloat(valA);
				let numB = parseFloat(valB);
				if (!isNaN(numA) && !isNaN(numB)) {
					valA = numA;
					valB = numB;
				} else {
					// For strings, lowercase for case-insensitive comparison
					if (typeof valA === "string") valA = valA.toLowerCase();
					if (typeof valB === "string") valB = valB.toLowerCase();
				}

				if (valA < valB) return ascending ? -1 : 1;
				if (valA > valB) return ascending ? 1 : -1;
				return 0;
			});

			this.renderTable(this.iscrittiList);
		};

		// Attach event listeners to headers for sorting (call once)
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

		this.showInserimentoMultiplo = function() {
			const modal = document.getElementById("inserimentoMultiploModal");
			const tbody = document.getElementById("inserimentoMultiploBody");
			tbody.innerHTML = "";

			// Filtra iscritti non ancora inseriti
			const nonInseriti = this.iscrittiList.filter(s => s.statodivalutazione === "NON_INSERITO");

			if (nonInseriti.length === 0) {
				tbody.innerHTML = "<tr><td colspan='4'>Nessuno studente nello stato NON_INSERITO</td></tr>";
			} else {
				nonInseriti.forEach(studente => {
					let row = document.createElement("tr");
					row.setAttribute("data-studente-id", studente.id); // 👈 store studente.id
					row.innerHTML = `
					        <td>${studente.matricola}</td>
					        <td>${studente.nome}</td>
					        <td>${studente.cognome}</td>
							<td>${studente.email}</td>
							<td>${studente.corsolaurea}</td>
							<td><input type="text" name="voto"></td>
					      `;
					tbody.appendChild(row);
				});
			}



			modal.style.display = "flex";
			document.body.style.overflow = "hidden";
		};

	}




	function mostraModificaStudente(iscritto) {
		// Pulisce eventuali messaggi
		document.getElementById("message").textContent = "";

		// Mostra solo la sezione di modifica
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


		const tbody = document.getElementById('infoverbalizzatiBody');
		tbody.innerHTML = ''; // svuota la tabella

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


	function mostraElencoVerbali() {
		// Pulisce eventuali messaggi
		document.getElementById("corsiSection").style.display = "none";
		document.getElementById("corsiTable").style.display = "none";
		document.getElementById("appelliSection").style.display = "none";
		document.getElementById("iscrittiSection").style.display = "none";
		document.getElementById("message").textContent = "";

		// Mostra solo la sezione di modifica
		document.getElementById("elencoVerbaliSection").style.display = "block";



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

			document.getElementById("verbaliButton").addEventListener("click", () => {
				mostraElencoVerbali();
			})

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

			document.getElementById("inserimentoMultiploBtn").addEventListener("click", () => {
				this.iscritti.showInserimentoMultiplo();
			});

			document.getElementById("closeInserimentoModal").addEventListener("click", () => {
				document.getElementById("inserimentoMultiploModal").style.display = "none";
			});
			/*
						document.addEventListener("DOMContentLoaded", function() {
							const inserimentoBtn = document.getElementById("inserimentoMultiploBtn");
							const modal = document.getElementById("inserimentoMultiploModal");
							const closeBtn = document.getElementById("closeInserimentoModal");
			
							inserimentoBtn.addEventListener("click", function() {
								modal.style.display = "flex";
								document.body.style.overflow = "hidden"; // blocca lo scroll sotto
							});
			
							closeBtn.addEventListener("click", function() {
								modal.style.display = "none";
								document.body.style.overflow = "auto"; // riattiva lo scroll
							});
			
							// Chiudi modale se clicchi fuori
							window.addEventListener("click", function(event) {
								if (event.target === modal) {
									modal.style.display = "none";
									document.body.style.overflow = "auto";
								}
							});
						});
						*/


			document.getElementById("modificaStudenteForm").addEventListener("submit", function(e) {
				e.preventDefault();
				//const form = e.target;
				const studenteId = parseInt(document.getElementById("modificaStudenteForm").dataset.studenteId, 10);
				const appId = parseInt(document.getElementById("modificaStudenteForm").dataset.appId, 10);
				const voto = document.getElementById("modVoto").value;
				
				const validi = [
				  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
				  "11", "12", "13", "14", "15", "16", "17", "18",
				  "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "30L"
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


			document.getElementById("inserimentoMultiploForm").addEventListener("submit", function(event) {
				event.preventDefault();

				const appId = pageOrchestrator.iscritti.currentAppelloId; // get current appId
				const rows = document.querySelectorAll("#inserimentoMultiploBody tr");

				// Create an array of promises for all the POST calls
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
						return Promise.resolve(); // Skip empty rows
					}
				});

				// Wait for all requests to complete before updating
				Promise.all(requests).then(() => {
					pageOrchestrator.iscritti.show(appId); // Refresh iscritti after all votes are inserted
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