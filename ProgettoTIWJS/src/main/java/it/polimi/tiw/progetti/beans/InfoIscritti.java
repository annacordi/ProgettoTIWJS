package it.polimi.tiw.progetti.beans;

public class InfoIscritti {
    private int matricola;
    private int id;
    private int idapp;
    private String nome;
    private String cognome;
    private String email;
    private String corsolaurea;
    private String voto;
    private Statodivalutazione statodivalutazione;
    

    public int getMatricola() {
        return matricola;
    }
    
    public int getIdapp() {
        return idapp;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public void setIdapp(int idapp) {
        this.idapp = idapp;
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

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCorsolaurea(String corso) {
        this.corsolaurea = corso;
    }

    public void setVoto(String voto) {
        this.voto = voto;
    }

    public void setStatodivalutazione(Statodivalutazione statodivalutazione) {
        this.statodivalutazione = statodivalutazione;
    }
    
    
    
    
    
}