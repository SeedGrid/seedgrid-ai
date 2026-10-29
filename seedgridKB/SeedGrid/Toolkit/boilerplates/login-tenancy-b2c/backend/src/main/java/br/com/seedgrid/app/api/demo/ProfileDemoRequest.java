package br.com.seedgrid.app.api.demo;

import org.openapitools.jackson.nullable.JsonNullable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;

/**
 * DOMINIO DE EXEMPLO do PATCH parcial (BE-33): UM DTO de entrada para criar (POST) e alterar parcialmente (PATCH).
 *
 * <ul>
 *   <li>os campos sao {@link JsonNullable}, iniciados com {@code undefined()} (ausente);</li>
 *   <li>o requisito de preenchimento fica no grupo {@link Full}: o POST valida com ele
 *       ({@code @ConvertGroup(to = Full.class)}); o PATCH valida so o que veio;</li>
 *   <li>formato e tamanho ({@code @Size}, {@code @Pattern}) valem nos dois e ficam no tipo-argumento;</li>
 *   <li>"quais campos sao obrigatorios" nao e' repetido em lista nenhuma: o {@code PatchApplier} le o grupo
 *       {@code Full} por reflexao.</li>
 * </ul>
 */
public class ProfileDemoRequest {

    /** Requisitos de preenchimento do POST. */
    public interface Full extends Default {
    }

    /** Obrigatorio: no PATCH, {@code null} explicito responde 400. */
    public JsonNullable<@NotBlank(groups = Full.class) @Size(max = 30) String> displayName = JsonNullable.undefined();

    /** Opcional: no PATCH, {@code null} explicito zera o campo. */
    public JsonNullable<@Size(max = 60) String> bio = JsonNullable.undefined();

    /** Opcional, com formato. */
    public JsonNullable<@Pattern(regexp = "https://\\S+") String> website = JsonNullable.undefined();
}
