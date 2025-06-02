(function(){

    const URL_CHECK_LOGIN = "CheckLogin";
    
    //sign-in management
    document.getElementById("loginbutton").addEventListener("click", (e) =>{
		var form = document.getElementById("loginform");
        var userField = form.elements["username"];
        var pwdField = form.elements["pwd"];

        
        if(form.checkValidity()){

            makeCall("POST", URL_CHECK_LOGIN, form,
                function(req){
                    
                    if(req.readyState == XMLHttpRequest.DONE){
                        if(req.status == 200){
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
                            
                        }else if(req.status == 401){//incorrect credentials
                            document.getElementById("error_message").textContent = req.responseText;
                        }else{
                            document.getElementById("error_message").textContent = req.responseText;
                        }
                    }
                });
        }else{
            form.reportValidity();
        }
    });
    
    
})()