package it.polimi.tiw.progetti.beans;

import java.sql.Date;
import java.time.LocalTime;
import java.util.List;

public class Verbale {
	private int idverb;
    private Date data;
    private Date dataapp;
    private LocalTime ora;
    private int idapp;

    public int getIdverb() {
        return idverb;
    }

    public Date getData() {
        return data;
    }
    
    public Date getDataapp() {
        return dataapp;
    }

    public LocalTime getOra() {
        return ora;
    }

    public int getIdapp() {
        return idapp;
    }

    public void setIdverb(int idverb) {
        this.idverb = idverb;
    }

    public void setData(Date data) {
        this.data = data;
    }
    
    public void setDataapp(Date dataapp) {
        this.dataapp = dataapp;
    }

    public void setOra(LocalTime ora) {
        this.ora = ora;
    }

    public void setIdapp(int idapp) {
        this.idapp = idapp;
    }
}