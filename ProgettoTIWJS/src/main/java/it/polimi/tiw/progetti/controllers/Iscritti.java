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
import it.polimi.tiw.progetti.dao.AppelloDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;

/**
 * Servlet implementation class Iscritti
 */
@WebServlet("/Iscritti")
public class Iscritti extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Iscritti() {
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

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// User user = (User) request.getSession().getAttribute("user");
		String appelloIdParam = request.getParameter("appId");
		int appId = Integer.parseInt(appelloIdParam);

		String orderBy = request.getParameter("orderBy");
		String orderDirection = request.getParameter("orderDirection");

		if (orderDirection != null && orderDirection.equalsIgnoreCase("ASC")) {
			orderDirection = "ASC";
		} else {
			orderDirection = "DESC";
		}

		AppelloDAO appelloDAO = new AppelloDAO(connection, appId);

		JakartaServletWebApplication application = JakartaServletWebApplication.buildApplication(getServletContext());
		IWebExchange webExchange = application.buildExchange(request, response);
		WebContext ctx = new WebContext(webExchange, request.getLocale());
		// ctx.setVariable("username", user.getUsername());

		try {

			List<InfoIscritti> iscritti = appelloDAO.cercaAppelli(orderBy, orderDirection);
			ctx.setVariable("iscritti", iscritti);
			ctx.setVariable("orderBy", orderBy);
			ctx.setVariable("orderDirection", orderDirection);

		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Impossibile recuperare gli iscritti a questo appello");
			return;
		}
		templateEngine.process("/WEB-INF/iscritti.html", ctx, response.getWriter());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String appelloIdParam = request.getParameter("appId");
		int appId = Integer.parseInt(appelloIdParam);
		AppelloDAO appelloDAO = new AppelloDAO(connection, appId);

		try {
			appelloDAO.aggiornaPubblicati();
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile pubblicare i voti");
			return;
		}

		doGet(request, response);

	}

}
