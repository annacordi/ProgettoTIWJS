package it.polimi.tiw.progetti.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import it.polimi.tiw.progetti.beans.User;
import it.polimi.tiw.progetti.dao.UserDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CheckLogin() {
		super();
	}

	public void init() throws ServletException {
		this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();

	}

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {
		String usrn = null;
		String pwd = null;
		usrn = request.getParameter("username");
		pwd = request.getParameter("pwd");
		if (usrn == null || pwd == null || usrn.isEmpty() || pwd.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Incorrect credential js");
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
			response.getWriter().println("Internal server error, retry later");
			return;

		}

		// If the user exists, add info to the session and go to home page, otherwise
		// return an error status code and message
		if (user == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Credenziali errate");
		} else {
			 request.getSession().setAttribute("user", user);
			    response.setStatus(HttpServletResponse.SC_OK);
			    response.setCharacterEncoding("UTF-8");
			    response.setContentType("application/json");
			    String json = String.format("{\"username\": \"%s\", \"role\": \"%s\"}", user.getUsername(), user.getRole());
			    response.getWriter().println(json);
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
