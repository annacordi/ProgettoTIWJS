package it.polimi.tiw.progetti.beans;

import java.sql.Date;

public class InfoVerbaleDocente {
    private Date dataverb;
    private Date dataapp;
    private String nomecorso;
    
    public Date getDataverb() {
        return dataverb;
    }

    public void setDataverb(Date dataverb) {
        this.dataverb = dataverb;
    }

    public Date getDataapp() {
        return dataapp;
    }

    public void setDataapp(Date dataapp) {
        this.dataapp = dataapp;
    }

    public String getNomecorso() {
        return nomecorso;
    }

    public void setNomecorso(String nomecorso) {
        this.nomecorso = nomecorso;
    }
}