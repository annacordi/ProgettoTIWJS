package it.polimi.tiw.progetti.beans;

import java.sql.Date;


public class Appello {
	private int idapp;
	private int idcorso;
	private Date data;
	
	public int getIdApp() {
        return idapp;
    }

    public int getIdCorso() {
        return idcorso;
    }

    public Date getData() {
        return data;
    }

    public void setIdApp(int idAppello) {
        this.idapp = idAppello;
    }

    public void setIdCorso(int idCorso) {
        this.idcorso = idCorso;
    }

    public void setData(Date data) {
        this.data = data;
    }
}

