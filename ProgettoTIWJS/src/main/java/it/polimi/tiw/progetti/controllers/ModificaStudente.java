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

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// User user = (User) request.getSession().getAttribute("user");
		String studenteIdParam = request.getParameter("studenteId");
		int studenteid = Integer.parseInt(studenteIdParam);
		String appelloIdParam = request.getParameter("appId");
		int appid = Integer.parseInt(appelloIdParam);
		StudenteDAO studenteDAO = new StudenteDAO(connection, studenteid);

		if (studenteIdParam == null || studenteIdParam.isBlank() || appelloIdParam == null
				|| appelloIdParam.isBlank()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("nella doGet di modifica studente uno dei parametri non c'è");
			return;
		}
		//mostro le informazioni del singolo studente selezionato dopo aver premuto tasto modifica
		try {
			InfoStudenteAppello infostud = studenteDAO.cercoInfoStudentePubblicatoperAppello(appid);
			Gson gson = new Gson();
			String json = gson.toJson(infostud);

			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(json);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("non riesco a prendere infoStudentepubblicatoperAppello ");
			return;
		}

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String studenteIdParam = request.getParameter("studenteId");
		int studenteid = Integer.parseInt(studenteIdParam);
		String appelloIdParam = request.getParameter("appId");
		int idapp = Integer.parseInt(appelloIdParam);
		String voto = request.getParameter("voto");
		StudenteDAO studenteDAO = new StudenteDAO(connection, studenteid);

		if (studenteIdParam == null || appelloIdParam == null || voto == null || voto.isBlank()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("nella doPost di modifica studente uno dei parametri non c'è");
			return;
		}
		//modifico nel DB il voto dello studente selezionato con il tasto modifica, cliccando su salva modifiche
		try {
			studenteDAO.aggiornaVotoEStato(idapp, voto);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("non riesco ad aggionrare il voto e lo stato");
			return;
		}

		response.setStatus(HttpServletResponse.SC_OK);

	}

}
