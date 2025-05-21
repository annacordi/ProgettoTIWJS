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
import java.util.List;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.IWebExchange;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import it.polimi.tiw.progetti.beans.InfoVerbaleDocente;
import it.polimi.tiw.progetti.beans.User;
import it.polimi.tiw.progetti.dao.DocenteDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;

/**
 * Servlet implementation class ElencoVerbali
 */
@WebServlet("/ElencoVerbali")
public class ElencoVerbali extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;
	
    public ElencoVerbali() {
        super();
        // TODO Auto-generated constructor stub
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
		User user = (User) request.getSession().getAttribute("user");
		DocenteDAO docenteDAO = new DocenteDAO(connection, user.getId());
		
		JakartaServletWebApplication application = JakartaServletWebApplication.buildApplication(getServletContext());
		IWebExchange webExchange = application.buildExchange(request, response);
		WebContext ctx = new WebContext(webExchange, request.getLocale());
		
		try {
			List<InfoVerbaleDocente> infoVerbale = docenteDAO.cercaVerbale();
			ctx.setVariable("infoverbale", infoVerbale);

		} catch (SQLException e) {
		    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare i verbali per questo docente");
		    return;
		}
	    templateEngine.process("/WEB-INF/elencoVerbali.html", ctx, response.getWriter());
			
		}


	


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
