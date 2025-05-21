package it.polimi.tiw.progetti.beans;

import java.sql.Date;

public class InfoStudenteAppello {
    private int matricola;
    private int id;
    private int idapp;
    private int idcorso;
    private String nome;
    private String cognome;
    private String email;
    private String corsolaurea;
    private String nomecorso;
    private String voto;
    private Date data;
    private Statodivalutazione statodivalutazione;

    public int getMatricola() {
        return matricola;
    }
    
    public int getId() {
        return id;
    }
    
    public int getIdcorso() {
    	return idcorso;
    }
    
    public void setIdcorso(int idcorso) {
    	this.idcorso = idcorso;
    	
    }
    
    public Date getData() {
        return data;
    }
    
    public void setData(Date data) {
    	this.data = data;
    }
    
    public int getIdapp() {
        return idapp;
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public String getEmail() {
        return email;
    }

    public String getNomecorso() {
        return nomecorso;
    }
    
    public String getCorsolaurea() {
        return corsolaurea;
    }

    public String getVoto() {
        return voto;
    }

    public Statodivalutazione getStatodivalutazione() {
        return statodivalutazione;
    }

    public void setMatricola(int matricola) {
        this.matricola = matricola;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public void setIdapp(int idapp) {
        this.idapp = idapp;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setCorsolaurea(String corsolaurea) {
        this.corsolaurea= corsolaurea;    }

    public void setNomecorso(String nomecorso) {
        this.nomecorso = nomecorso;
    }

    public void setVoto(String voto) {
        this.voto = voto;
    }

    public void setStatodivalutazione(Statodivalutazione statodivalutazione) {
        this.statodivalutazione = statodivalutazione;
    }
    
    
    
    
    
}