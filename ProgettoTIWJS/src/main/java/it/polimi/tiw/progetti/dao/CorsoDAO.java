package it.polimi.tiw.progetti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.progetti.beans.Appello;


public class CorsoDAO {
	private Connection con;
	private int idcorso;

	public CorsoDAO(Connection connection, int idcorso) {
		this.con = connection;
		this.idcorso = idcorso;
	}
		
	//cerca appelli di un certo corso
	public List<Appello> cercaAppelli() throws SQLException {
		List<Appello> appelli = new ArrayList<Appello>();
		String query = "SELECT idapp, data "
				+ "FROM appello "
				+ "WHERE idcorso = ? "
				+ "ORDER BY data DESC;";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idcorso);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					Appello appello = new Appello();
					appello.setIdApp(result.getInt("idapp"));
					appello.setIdCorso(idcorso);
					appello.setData(result.getDate("data"));
					appelli.add(appello);
				}
			}
		}
		return appelli;
	}

	
}
