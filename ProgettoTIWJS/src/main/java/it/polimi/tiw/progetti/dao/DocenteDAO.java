package it.polimi.tiw.progetti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.progetti.beans.Corso;
import it.polimi.tiw.progetti.beans.InfoVerbaleDocente;


public class DocenteDAO {
	private Connection con;
	private int iddocente;

	public DocenteDAO(Connection connection, int iddocente) {
		this.con = connection;
		this.iddocente = iddocente;
	}
	
	//cerca corsi di un certo docente
	public List<Corso> cercaCorsi() throws SQLException {
		List<Corso> corsi = new ArrayList<Corso>();
		String query = "SELECT idcorso, nomecorso "
				+ "FROM corso "
				+ "WHERE iddocente = ? "
				+ "ORDER BY nomecorso DESC;";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.iddocente);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					Corso corso = new Corso();
					corso.setIdCorso(result.getInt("idcorso"));
					corso.setIdDocente(iddocente);
					corso.setNomecorso(result.getString("nomecorso"));
					corsi.add(corso);
				}
			}
		}
		return corsi;
	}
	
	//cerca verbali di un certo docente
		public List<InfoVerbaleDocente> cercaVerbale() throws SQLException {
			List<InfoVerbaleDocente> infoverbali = new ArrayList<InfoVerbaleDocente>();
			String query = "SELECT v.data AS dataverb, a.data AS dataapp, c.nomecorso FROM verbale v "
					+ "JOIN appello a ON v.idapp = a.idapp "
					+ "JOIN corso c ON a.idcorso = c.idcorso "
					+ "WHERE c.iddocente = ? "
					+ "ORDER BY c.nomecorso ASC, a.data ASC;";
			try (PreparedStatement pstatement = con.prepareStatement(query);) {
				pstatement.setInt(1, this.iddocente);
				try (ResultSet result = pstatement.executeQuery();) {
					while (result.next()) {
						InfoVerbaleDocente infoverbale = new InfoVerbaleDocente();
						infoverbale.setDataverb(result.getDate("dataverb"));
						infoverbale.setDataapp(result.getDate("dataapp"));
						infoverbale.setNomecorso(result.getString("nomecorso"));
						 infoverbali.add(infoverbale);
					}
				}
			}
			return infoverbali;
		}
	
}
