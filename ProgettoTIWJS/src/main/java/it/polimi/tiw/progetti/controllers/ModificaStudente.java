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

import com.google.gson.Gson;

import it.polimi.tiw.progetti.beans.InfoStudenteAppello;
import it.polimi.tiw.progetti.dao.StudenteDAO;
import it.polimi.tiw.progetti.utils.ConnectionHandler;

/**
 * Servlet implementation class Iscritti
 */
@WebServlet("/ModificaStudente")
public class ModificaStudente extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ModificaStudente() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    public void init() throws ServletException {
    	this.connection = ConnectionHandler.getConnection(getServletContext());
		ServletContext servletContext = getServletContext();

    }
		
	


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//User user = (User) request.getSession().getAttribute("user");
		String studenteIdParam = request.getParameter("studenteId");
		int studenteid = Integer.parseInt(studenteIdParam);
		String appelloIdParam = request.getParameter("appId");
		int appid = Integer.parseInt(appelloIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection, studenteid);
		

		try {
			InfoStudenteAppello infostud = studenteDAO.cercoInfoStudentePubblicatoperAppello(appid);
			Gson gson = new Gson();
			String json = gson.toJson(infostud);

			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(json);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare i dati di questo studente per questo appello");
			return;
		}
		
            
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String studenteIdParam = request.getParameter("studenteId");
		int studenteid = Integer.parseInt(studenteIdParam);
		String appelloIdParam = request.getParameter("appId");
		int appid = Integer.parseInt(appelloIdParam);
		 String voto = request.getParameter("voto");
		StudenteDAO studenteDAO = new StudenteDAO(connection, studenteid);
				

		
		try {
			studenteDAO.aggiornaVotoEStato(appid, voto);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile modificare il voto");
			return;
		}
		
		response.sendRedirect(getServletContext().getContextPath() + "/Iscritti?appId=" + appid);

	}

}
