package br.com.seedgrid.app.api.boot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

/**
 * GUARDA DO NIVEL DE LOG (P194.F1.T6) - NAO ENFRAQUECER sem decisao do dono.
 *
 * <p>Em producao o backend nao pode rodar em DEBUG/TRACE: o DEBUG de {@code TenantHostExtractor} e do validador de token
 * vazava subdominio e dados de sessao no log. O padrao (sem perfil) de qualquer {@code quarkus.log...level} em
 * {@code application.properties} tem de ser INFO ou mais alto; DEBUG so aparece com o prefixo {@code %dev.}. A variavel
 * {@code LOG_SEEDGRID_LEVEL} continua sobrescrevendo.</p>
 */
class LogLevelProdDefaultTest {

    private static final Pattern LEVEL_LINE = Pattern.compile("^(quarkus[.]log[.](?:category[.][^=]+[.])?(?:min-)?level)=(.*)$");
    private static final Pattern DEFAULT_OF = Pattern.compile("^[$][{][A-Z0-9_]+:([A-Za-z]+)[}]$");

    private static List<String> lines() throws IOException {
        try (InputStream in = LogLevelProdDefaultTest.class.getResourceAsStream("/application.properties")) {
            String text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            return text.lines().toList();
        }
    }

    private static String levelOf(String value) {
        Matcher m = DEFAULT_OF.matcher(value.trim());
        return (m.matches() ? m.group(1) : value.trim()).toUpperCase();
    }

    @Test
    void semPerfilNenhumNivelDeLogEDebugOuTrace() throws IOException {
        List<String> offenders = new ArrayList<>();
        for (String line : lines()) {
            Matcher m = LEVEL_LINE.matcher(line.trim());
            if (m.matches()) {
                String level = levelOf(m.group(2));
                if (level.equals("DEBUG") || level.equals("TRACE") || level.equals("ALL")) offenders.add(line.trim());
            }
        }
        assertEquals(List.of(), offenders, "producao nao pode ter DEBUG/TRACE por padrao (so com %dev.)");
    }

    @Test
    void devContinuaEmDebugParaDesenvolvimento() throws IOException {
        boolean dev = lines().stream().anyMatch(l -> l.trim().startsWith("%dev.quarkus.log.category.\"br.com.seedgrid\".level=")
                && levelOf(l.substring(l.indexOf('=') + 1)).equals("DEBUG"));
        assertTrue(dev, "o perfil dev deve manter br.com.seedgrid em DEBUG");
    }
}
