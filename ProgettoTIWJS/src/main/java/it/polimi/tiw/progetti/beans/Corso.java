package it.polimi.tiw.progetti.beans;

public class Corso {
	private int idcorso;
	private int iddocente;
	private String nomecorso;
	
	public int getIdCorso() {
        return idcorso;
    }

    public int getIdDocente() {
        return iddocente;
    }
    
    public String getNomecorso() {
    	return nomecorso;
    }

    public void setIdCorso(int idCorso) {
        this.idcorso = idCorso;
    }

    public void setIdDocente(int idDocente) {
        this.iddocente = idDocente;
    }
    
    public void setNomecorso(String NomeCorso) {
    	this.nomecorso = NomeCorso;
    }
	
}

