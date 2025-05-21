package it.polimi.tiw.progetti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import it.polimi.tiw.progetti.beans.InfoIscritti;
import it.polimi.tiw.progetti.beans.Statodivalutazione;
import it.polimi.tiw.progetti.beans.Verbale;


public class VerbaleDAO {
	private Connection con;
	private int idapp;

	public VerbaleDAO(Connection connection, int idapp) {
		this.con = connection;
		this.idapp = idapp;
	}
	
	public List<Integer> cercaIdStudentiPubbORif() throws SQLException{
		List<Integer> idList = new ArrayList<Integer>();
		String query = "SELECT u.id "
				+ "FROM esame e "
				+ "JOIN user u ON u.id = e.idstudente "
				+ "WHERE (e.statodivalutazione = 'Pubblicato' OR e.statodivalutazione = 'Rifiutato') "
				+ "AND e.idapp = ? ;";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idapp);
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					idList.add(result.getInt("id"));
					
				}
			}
		}
		return idList;
		
	}
	
	public List<InfoIscritti> infoStudentiAggiornati(int appId, List<Integer> studentIds) throws SQLException {
	    if (studentIds == null || studentIds.isEmpty()) return new ArrayList<>();

	    String inSql = studentIds.stream().map(id -> "?").collect(Collectors.joining(","));
	    String query = "SELECT e.idstudente, e.voto, e.statodivalutazione, u.nome, u.cognome, u.matricola " +
	                   "FROM esame e JOIN user u ON e.idstudente = u.id " +
	                   "WHERE e.idapp = ? AND e.idstudente IN (" + inSql + ")";

	    try (PreparedStatement pstm = con.prepareStatement(query)) {
	        pstm.setInt(1, appId);
	        for (int i = 0; i < studentIds.size(); i++) {
	            pstm.setInt(i + 2, studentIds.get(i)); // +2 because appId is 1-based index
	        }

	        try (ResultSet rs = pstm.executeQuery()) {
	            List<InfoIscritti> results = new ArrayList<>();
	            while (rs.next()) {
	                InfoIscritti info = new InfoIscritti();
	                info.setId(rs.getInt("idstudente"));
	                info.setMatricola(rs.getInt("matricola"));
	                info.setVoto(rs.getString("voto"));
	                info.setStatodivalutazione(Statodivalutazione.valueOf(rs.getString("statodivalutazione").toUpperCase()));
	                info.setNome(rs.getString("nome"));
	                info.setCognome(rs.getString("cognome"));
	                results.add(info);
	            }
	            return results;
	        }
	    }
	}
	
	public void aggiornaverbalizzato() throws SQLException{
		String query = "UPDATE esame "
				+ "SET "
				+ "voto = CASE "
				+ "WHEN statodivalutazione = 'RIFIUTATO' THEN 'RIMANDATO' "
				+ "ELSE voto "
				+ "END, "
				+ "statodivalutazione = CASE "
				+ "WHEN statodivalutazione IN ('PUBBLICATO', 'RIFIUTATO') THEN 'VERBALIZZATO' "
				+ "ELSE statodivalutazione "
				+ "END "
				+ "WHERE idapp = ? AND statodivalutazione IN ('PUBBLICATO', 'RIFIUTATO');";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idapp);
			pstatement.executeUpdate();
		}
	}
	
	public void creaverbale() throws SQLException{
		String query = "INSERT INTO verbale (data, ora, idapp) "
				+ "VALUES (CURRENT_DATE(), CURRENT_TIME(), ?);";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, this.idapp);
			pstatement.executeUpdate();
		}
	}
	
	public Verbale idVerb() throws SQLException{
		Verbale verbale = new Verbale();
		String query = "SELECT v.idverb, v.data AS verbale_data, v.ora, a.idapp, a.data AS appello_data "
				+ "FROM verbale v "
				+ "JOIN appello a ON v.idapp = a.idapp "
				+ "WHERE v.idverb = (SELECT MAX(idverb) FROM verbale);";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			try (ResultSet result = pstatement.executeQuery();) {
				if (result.next()) {
					verbale.setDataapp(result.getDate("appello_data"));
					verbale.setData(result.getDate("verbale_data"));
					verbale.setIdverb(result.getInt("idverb"));
					verbale.setOra(result.getTime("ora").toLocalTime());
				}
			}
		}
		return verbale;
		
	}
	
	
	
	
		


	
}
