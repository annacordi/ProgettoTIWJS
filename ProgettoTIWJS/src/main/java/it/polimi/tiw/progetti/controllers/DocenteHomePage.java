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
import com.google.gson.GsonBuilder;

import it.polimi.tiw.progetti.beans.Appello;
import it.polimi.tiw.progetti.beans.Corso;
import it.polimi.tiw.progetti.beans.User;
import it.polimi.tiw.progetti.dao.CorsoDAO;
import it.polimi.tiw.progetti.dao.DocenteDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;

/**
 * Servlet implementation class DocenteHomePage
 */
@WebServlet("/DocenteHomePage")
public class DocenteHomePage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

    public DocenteHomePage() {
        super();
    }
    
    public void init() throws ServletException {
    	this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();

		
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user = (User) request.getSession().getAttribute("user");

		String corsoIdParam = request.getParameter("corsoId");
	    Gson gson = new GsonBuilder().create();
	    response.setCharacterEncoding("UTF-8");
	    response.setContentType("application/json");

	    try {
	        if (corsoIdParam != null) {
	            // ↳ Richiesta appelli di un corso
	            int corsoId = Integer.parseInt(corsoIdParam);
	            CorsoDAO corsoDAO = new CorsoDAO(connection, corsoId);
	            List<Appello> appelli = corsoDAO.cercaAppelli();
	            String json = gson.toJson(appelli);
	            response.setStatus(HttpServletResponse.SC_OK);
	            response.getWriter().write(json);
	            return;
	        } else {
	            // ↳ Richiesta corsi del docente
	            DocenteDAO docenteDAO = new DocenteDAO(connection, user.getId());
	            List<Corso> corsi = docenteDAO.cercaCorsi();
	            String json = gson.toJson(corsi);
	            response.setStatus(HttpServletResponse.SC_OK);
	            response.getWriter().write(json);
	            return;
	        }
	    } catch (NumberFormatException e) {
	        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid corsoId");
	    } catch (SQLException e) {
	        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
	    }

		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
