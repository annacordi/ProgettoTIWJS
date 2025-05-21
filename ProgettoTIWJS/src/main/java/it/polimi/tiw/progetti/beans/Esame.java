package it.polimi.tiw.progetti.beans;


public class Esame {
	private int idapp;
	private int idstudente;
	private String voto;
	private Statodivalutazione statodivalutazione;
	
	public int getIdapp() {
        return idapp;
    }

    public int getIdstudente() {
        return idstudente;
    }

    public String getVoto() {
        return voto;
    }

    public Statodivalutazione getStatodivalutazione() {
        return statodivalutazione;
    }

    public void setStatodivalutazione(Statodivalutazione statodivalutazione) {
        this.statodivalutazione = statodivalutazione;
    }

    public void setVoto(String voto) {
        this.voto = voto;
    }

    public void setIdstudente(int idstudente) {
        this.idstudente = idstudente;
    }

    public void setIdapp(int idapp) {
        this.idapp = idapp;
    }
	
}

