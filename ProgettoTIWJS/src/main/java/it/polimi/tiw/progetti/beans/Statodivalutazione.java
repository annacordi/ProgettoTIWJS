package it.polimi.tiw.progetti.beans;


public enum Statodivalutazione {
    NON_INSERITO("non_inserito"),
    INSERITO("inserito"),
    PUBBLICATO("pubblicato"),
    RIFIUTATO("rifiutato"),
    VERBALIZZATO("verbalizzato");

    private final String label;

    Statodivalutazione(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}