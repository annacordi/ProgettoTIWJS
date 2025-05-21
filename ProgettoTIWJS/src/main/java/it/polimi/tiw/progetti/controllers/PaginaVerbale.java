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
import java.util.ArrayList;
import java.util.List;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.IWebExchange;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import it.polimi.tiw.progetti.beans.InfoIscritti;
import it.polimi.tiw.progetti.beans.Verbale;
import it.polimi.tiw.progetti.dao.VerbaleDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;


@WebServlet("/PaginaVerbale")
public class PaginaVerbale extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;
       

    public PaginaVerbale() {
        super();
    }
    

    public void init() throws ServletException {
    	this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();

		  JakartaServletWebApplication webApplication = JakartaServletWebApplication.buildApplication(servletContext);    
		  WebApplicationTemplateResolver templateResolver = new WebApplicationTemplateResolver(webApplication);

		  templateResolver.setTemplateMode(TemplateMode.HTML);
		  this.templateEngine = new TemplateEngine();
		  this.templateEngine.setTemplateResolver(templateResolver);
		  templateResolver.setSuffix(".html");
    }


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		

	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String appelloIdParam = request.getParameter("appId");
		int appid = Integer.parseInt(appelloIdParam);
		VerbaleDAO verbaleDAO = new VerbaleDAO(connection, appid);
		
		List<Integer> studentidaAggiornare;
		
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
		    } catch (SQLException e) {
		        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Errore nel recuperare il verbale creato.");
		        return;
		    }
		    
		    JakartaServletWebApplication application = JakartaServletWebApplication.buildApplication(getServletContext());
	        IWebExchange webExchange = application.buildExchange(request, response);
	        WebContext ctx = new WebContext(webExchange, request.getLocale());

	        ctx.setVariable("verbale", verbale);
	        ctx.setVariable("infoverbalizzati", studentiaggiornati);
	        templateEngine.process("/WEB-INF/verbale.html", ctx, response.getWriter());
		
		
	    
	}

}
