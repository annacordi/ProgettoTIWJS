(function() {

	//gestione del login
	document.getElementById("loginbutton").addEventListener("click", (e) => {
		var form = document.getElementById("loginform");


		if (form.checkValidity()) {

			makeCall("POST", "CheckLogin", form,
				function(req) {

					if (req.readyState == XMLHttpRequest.DONE) {
						if (req.status == 200) {
							var userData = JSON.parse(req.responseText);
							sessionStorage.setItem('username', userData.username);
							sessionStorage.setItem('role', userData.role);

							// Redirect in base al ruolo
							if (userData.role === "studente") {
								window.location.href = "studenteHomePage.html";
							} else if (userData.role === "docente") {
								window.location.href = "docenteHomePage.html";
							} else {
								document.getElementById("error_message").textContent = "Ruolo sconosciuto.";
							}

						} else if (req.status == 400) {//bad request
							document.getElementById("error_message").textContent = req.responseText;
						} else if (req.status == 401) {//credenziali errate
							document.getElementById("error_message").textContent = req.responseText;
						} else if (req.status == 500) {//server error
							document.getElementById("error_message").textContent = req.responseText;
						} else {
							document.getElementById("error_message").textContent = req.responseText;
						}
					}
				});
		} else {
			form.reportValidity();
		}
	});


})()