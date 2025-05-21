package it.polimi.tiw.progetti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.progetti.beans.Appello;
import it.polimi.tiw.progetti.beans.Corso;
import it.polimi.tiw.progetti.beans.InfoStudenteAppello;
import it.polimi.tiw.progetti.beans.Statodivalutazione;


public class StudenteDAO {
	private Connection con;
	private int idstud;

	public StudenteDAO(Connection connection, int idstud) {
		this.con = connection;
		this.idstud = idstud;
	}
	
	//cerca corsi di un certo studente
	public List<Corso> cercaCorsi() throws SQLException {
		List<Corso> corsi = new ArrayList<Corso>();
		String query = "SELECT c.idcorso, c.nomecorso "
				+ "FROM iscrittocorso i "
				+ "JOIN corso c ON i.idcorso = c.idcorso "
				+ "WHERE  i.idstudente = ? "
				+ "ORDER BY c.nomecorso DESC;";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idstud);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					Corso corso = new Corso();
					corso.setIdCorso(result.getInt("idcorso"));
					corso.setNomecorso(result.getString("nomecorso"));
					corsi.add(corso);
				}
			}
		}
		return corsi;
	}
	

	//cerca appelli di un certo corso a cui un certo studente è iscritto
	public List<Appello> cercaAppelliStudente(int idcorso) throws SQLException {
		List<Appello> appelli = new ArrayList<Appello>();
		String query = "SELECT a.idapp, a.data FROM esame e JOIN appello a ON e.idapp = a.idapp "
				+ "WHERE e.idstudente = ? and a.idcorso = ?;";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idstud);
			pstatement.setInt(2, idcorso);
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
	
	public InfoStudenteAppello cercoInfoStudentePubblicatoperAppello(int idapp) throws SQLException {
	    InfoStudenteAppello infostudenteappello = new InfoStudenteAppello();
	    String query = "SELECT u.matricola, u.cognome, u.nome, u.email, u.corsolaurea, " +
	                   "c.nomecorso, e.voto, e.statodivalutazione, a.data, c.idcorso " +
	                   "FROM esame e " +
	                   "JOIN user u ON e.idstudente = u.id " +
	                   "JOIN appello a ON e.idapp = a.idapp " +
	                   "JOIN corso c ON a.idcorso = c.idcorso " +
	                   "WHERE e.idapp = ? AND e.idstudente = ? ;";
	    try (PreparedStatement pstatement = con.prepareStatement(query);) {
	        pstatement.setInt(1, idapp);
	        pstatement.setInt(2, this.idstud);
	        try (ResultSet result = pstatement.executeQuery();) {
	            if (result.next()) {
	            	infostudenteappello.setId(idstud);
	            	infostudenteappello.setIdcorso(result.getInt("idcorso"));
	            	infostudenteappello.setIdapp(idapp);
	            	infostudenteappello.setData(result.getDate("data"));
	                infostudenteappello.setMatricola(result.getInt("matricola"));
	                infostudenteappello.setNome(result.getString("nome"));
	                infostudenteappello.setCognome(result.getString("cognome"));
	                infostudenteappello.setEmail(result.getString("email"));
	                infostudenteappello.setCorsolaurea(result.getString("corsolaurea")); 
	                infostudenteappello.setNomecorso(result.getString("nomecorso")); 
	                infostudenteappello.setVoto(result.getString("voto"));
	                infostudenteappello.setStatodivalutazione(Statodivalutazione.valueOf(result.getString("statodivalutazione").toUpperCase()));
	            }
	        }
	    }
	    return infostudenteappello;
	}
	
	public void aggiornaVotoEStato(int idapp, String voto) throws SQLException {
	    String query = "UPDATE esame SET voto = ?, statodivalutazione = ? WHERE idapp = ? AND idstudente = ?;";
	    try (PreparedStatement pstatement = con.prepareStatement(query)) {
	        pstatement.setString(1, voto);
	        pstatement.setString(2, Statodivalutazione.INSERITO.getLabel());
	        pstatement.setInt(3, idapp);
	        pstatement.setInt(4, this.idstud);
	        pstatement.executeUpdate();
	    }
	}
	
	public void aggiornaRifiutato(int idapp) throws SQLException {
		String query = "UPDATE esame " +
                "SET statodivalutazione = 'RIFIUTATO' " +
                "WHERE idapp = ? AND idstudente = ?";
	    try (PreparedStatement pstatement = con.prepareStatement(query)) {
	        pstatement.setInt(1, idapp);
	        pstatement.setInt(2, idstud);
	        pstatement.executeUpdate();
	    }
	}
	
	

	
	
	
}
