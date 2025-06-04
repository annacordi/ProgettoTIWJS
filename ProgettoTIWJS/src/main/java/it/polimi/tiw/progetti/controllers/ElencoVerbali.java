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

import com.google.gson.Gson;

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
	
    public ElencoVerbali() {
        super();
        // TODO Auto-generated constructor stub
    }


    public void init() throws ServletException {
    	this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user = (User) request.getSession().getAttribute("user");
		DocenteDAO docenteDAO = new DocenteDAO(connection, user.getId());
		
		//carica la lista dei verbali
		try {
			List<InfoVerbaleDocente> infoVerbale = docenteDAO.cercaVerbale();
			Gson gson = new Gson();
		    String json = gson.toJson(infoVerbale);
		    response.setContentType("application/json");
		    response.setCharacterEncoding("UTF-8");
		    response.getWriter().write(json);

		} catch (SQLException e) {
		    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare i verbali per questo docente");
		    return;
		}			
		}


	


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
