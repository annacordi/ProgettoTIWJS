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


import it.polimi.tiw.progetti.beans.InfoIscritti;
import it.polimi.tiw.progetti.beans.InfoStudenteAppello;
import it.polimi.tiw.progetti.beans.User;
import it.polimi.tiw.progetti.dao.AppelloDAO;
import it.polimi.tiw.progetti.dao.StudenteDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;

/**
 * Servlet implementation class Iscritti
 */
@WebServlet("/Esito")
public class Esito extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Esito() {
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
		String appelloIdParam = request.getParameter("appelloId");
		int appelloId = Integer.parseInt(appelloIdParam);
		String corsoIdParam = request.getParameter("corsoId");
		int corsoId = Integer.parseInt(appelloIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection,user.getId());
		
		JakartaServletWebApplication application = JakartaServletWebApplication.buildApplication(getServletContext());
		IWebExchange webExchange = application.buildExchange(request, response);
		WebContext ctx = new WebContext(webExchange, request.getLocale());

		try {
			InfoStudenteAppello infostud = studenteDAO.cercoInfoStudentePubblicatoperAppello(appelloId);
			ctx.setVariable("infostud", infostud);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare l'esito per questo appello");
		    return;
		}

		
	
		
		
	    templateEngine.process("/WEB-INF/esito.html", ctx, response.getWriter());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user = (User) request.getSession().getAttribute("user");
		String appelloIdParam = request.getParameter("appelloId");
		int appelloId = Integer.parseInt(appelloIdParam);
		String corsoIdParam = request.getParameter("corsoId");
		int corsoId = Integer.parseInt(appelloIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection,user.getId());
		
		
		
		try {
			studenteDAO.aggiornaRifiutato(appelloId);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile rifiutare il voto");
			return;
		}
		doGet(request, response);
	}

}
