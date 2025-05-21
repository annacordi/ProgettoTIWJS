package it.polimi.tiw.progetti.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import it.polimi.tiw.progetti.beans.User;
import it.polimi.tiw.progetti.dao.UserDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/CheckLogin")
//@MultipartConfig
public class CheckLogin extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;

	public CheckLogin() {
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

	protected void doPost(HttpServletRequest request, HttpServletResponse response) // TODO qui è una get
			throws ServletException, IOException {
		// obtain and escape params
		String usrn = null;
		String pwd = null;
		usrn = request.getParameter("username");
		pwd = request.getParameter("pwd");
		if (usrn == null || pwd == null || usrn.isEmpty() || pwd.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect credentials");
			// request.getSession().setAttribute("error_message","Credentials must be not
			// null");
			return;
		}
		// query db to authenticate for user
		UserDAO userDao = new UserDAO(connection);
		User user = null;
		try {
			user = userDao.checkCredentials(usrn, pwd);
		} catch (SQLException e) {
			e.printStackTrace(); // <--- add this
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			request.getSession().setAttribute("error_message", "Internal server error, retry later");
			return;

		}

		// If the user exists, add info to the session and go to home page, otherwise
		// return an error status code and message
		if (user == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

			// request.getSession().setAttribute("error_message","Incorrect credentials");
			response.sendRedirect("loginPage.html");
		} else if (user.getRole().equals("studente")) {
			request.getSession().setAttribute("user", user);
			response.setStatus(HttpServletResponse.SC_OK);
			// response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			// response.sendRedirect("studenteHomePage.html");
			response.sendRedirect(getServletContext().getContextPath() + "/StudenteHomePage");
		} else if (user.getRole().equals("docente")) {
			request.getSession().setAttribute("user", user);
			response.setStatus(HttpServletResponse.SC_OK);
			// response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			// response.sendRedirect("docenteHomePage.html");
			response.sendRedirect(getServletContext().getContextPath() + "/DocenteHomePage");
		}

	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
