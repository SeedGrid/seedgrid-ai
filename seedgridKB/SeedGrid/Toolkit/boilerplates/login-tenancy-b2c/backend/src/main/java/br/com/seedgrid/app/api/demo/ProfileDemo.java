package br.com.seedgrid.app.api.demo;

/** Entidade do exemplo do PATCH parcial (em memoria: o exemplo nao precisa de tabela). */
public class ProfileDemo {

    private String displayName;
    private String bio;
    private String website;

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}
