package it.polimi.tiw.progetti.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetti.beans.InfoIscritti;
import it.polimi.tiw.progetti.beans.Verbale;
import it.polimi.tiw.progetti.dao.VerbaleDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;
import it.polimi.tiw.progetti.utils.LocalTimeAdapter;


@WebServlet("/PaginaVerbale")
public class PaginaVerbale extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	

    public PaginaVerbale() {
        super();
    }
    

    public void init() throws ServletException {
    	this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();

    }


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		

	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String appelloIdParam = request.getParameter("appId");
		int appid = Integer.parseInt(appelloIdParam);
		VerbaleDAO verbaleDAO = new VerbaleDAO(connection, appid);
		
		List<Integer> studentidaAggiornare;
		Map<String, Object> result = new HashMap<>();
		 try {
		        studentidaAggiornare = verbaleDAO.cercaIdStudentiPubbORif();
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore nel cercare gli ID degli studenti da aggiornare.");
		        return;
		    }

		    try {
		        verbaleDAO.aggiornaverbalizzato();
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore durante l'aggiornamento dei dati come verbalizzati.");
		        return;
		    }
		    
		    List<InfoIscritti> studentiaggiornati = new ArrayList<InfoIscritti>();

		    try {
		    	studentiaggiornati = verbaleDAO.infoStudentiAggiornati(appid, studentidaAggiornare);
		    	result.put("infoverbalizzati", studentiaggiornati);
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore nel recuperare le informazioni degli studenti aggiornati.");
		        return;
		    }

		    try {
		        verbaleDAO.creaverbale();
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore nella creazione del verbale.");
		        return;
		    }
		    Verbale verbale = new Verbale();

		    try {
		    
		    	verbale = verbaleDAO.idVerb();
		    	result.put("verbale", verbale);
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore nel recuperare il verbale creato.");
		        return;
		    }
		    Gson gson = new GsonBuilder()
		    	    .registerTypeAdapter(LocalTime.class, new LocalTimeAdapter())
		    	    .create();

		    String json = gson.toJson(result);

		    response.setContentType("application/json");
		    response.setCharacterEncoding("UTF-8");
		    response.getWriter().write(json);
		   
		
		
	    
	}

}
