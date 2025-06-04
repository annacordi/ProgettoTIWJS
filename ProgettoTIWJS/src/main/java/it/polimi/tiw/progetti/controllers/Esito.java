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
import com.google.gson.GsonBuilder;

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

    }
		
	


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user = (User) request.getSession().getAttribute("user");
		String appelloIdParam = request.getParameter("appelloId");
		int appelloId = Integer.parseInt(appelloIdParam);
		String corsoIdParam = request.getParameter("corsoId");
		int corsoId = Integer.parseInt(corsoIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection,user.getId());

		//carico informazioni riguardanti l'esame dello studente
		InfoStudenteAppello infostud = null;
		try {
			infostud = studenteDAO.cercoInfoStudentePubblicatoperAppello(appelloId);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile recuperare l'esito per questo appello");
		    return;
		}
		
		Gson gson = new GsonBuilder().create();
        String json = gson.toJson(infostud);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(json);


	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user = (User) request.getSession().getAttribute("user");
		String appelloIdParam = request.getParameter("appelloId");
		int appelloId = Integer.parseInt(appelloIdParam);
		String corsoIdParam = request.getParameter("corsoId");
		int corsoId = Integer.parseInt(corsoIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection,user.getId());
		
		
		//aggiorno lo stato di valutazione nel DB a rifiutato
		try {
			studenteDAO.aggiornaRifiutato(appelloId);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Impossibile rifiutare il voto");
			return;
		}
		doGet(request, response);
	}

}
