package it.polimi.tiw.progetti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import it.polimi.tiw.progetti.beans.InfoIscritti;
import it.polimi.tiw.progetti.beans.Statodivalutazione;




public class AppelloDAO {
	private Connection con;
	private int idapp;

	public AppelloDAO(Connection connection, int idapp) {
		this.con = connection;
		this.idapp = idapp;
	}
	
	//trovare gli iscritti all'appello e dire matricola, nome, cognome, mail, corso, voto, stato
	public List<InfoIscritti> cercaAppelli(String orderBy, String orderDirection) throws SQLException {
		List<InfoIscritti> infoIscrtittiList = new ArrayList<InfoIscritti>();
		Set<String> allowedOrderBy = Set.of("matricola","nome","cognome","email","corsolaurea","voto","statodivalutazione");
		Set<String> allowedDirections = Set.of("ASC","DESC");
		if (orderBy == null || !allowedOrderBy.contains(orderBy)) {
			orderBy = "cognome"; // default column
		}
		if (orderDirection == null || !allowedDirections.contains(orderDirection.toUpperCase())) {
			orderDirection = "ASC"; // default direction
		}
		
		String query = "SELECT "
				+ "s.id, "
				+ "s.matricola, "
				+ "s.cognome, "
				+ "s.nome, "
				+ "s.email, "
				+ "s.corsolaurea, "
				+ "e.voto, "
				+ "e.statodivalutazione "
				+ "FROM "
				+ "appello AS a "
				+ "JOIN "
				+ "esame AS e ON a.idapp = e.idapp "
				+ "JOIN "
				+ "user AS s ON e.idstudente = s.id "
				+ "WHERE "
				+ "a.idapp = ? "
				+ "ORDER BY " + orderBy + " " + orderDirection;
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idapp);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					InfoIscritti infoiscritti = new InfoIscritti();
					infoiscritti.setId(result.getInt("s.id"));
					infoiscritti.setMatricola(result.getInt("s.matricola"));
					infoiscritti.setNome(result.getString("s.nome"));
					infoiscritti.setCognome(result.getString("s.cognome"));
					infoiscritti.setEmail(result.getString("s.email"));
					infoiscritti.setCorsolaurea(result.getString("s.corsolaurea"));;
					infoiscritti.setVoto(result.getString("e.voto"));
					infoiscritti.setIdapp(idapp);
					infoiscritti.setStatodivalutazione(Statodivalutazione.valueOf(result.getString("statodivalutazione").toUpperCase()));
					infoIscrtittiList.add(infoiscritti);
					
				}
			}
		}
		return infoIscrtittiList;
	}
	//aggiorna lo stato di valutazione a pubblicato degli studenti inseriti
	public void aggiornaPubblicati() throws SQLException{
		String query = "UPDATE esame "
		        + "SET statodivalutazione = 'PUBBLICATO' "
		        + "WHERE idapp = ? AND statodivalutazione = 'INSERITO';";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idapp);
			pstatement.executeUpdate();
		}
		
		
	}
	
	
	
	
}