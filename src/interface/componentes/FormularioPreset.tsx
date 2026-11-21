import { useState } from "react";
import type { FormEvent } from "react";
import { PRESET_SUGERIDO } from "../../dominio/presets";
import type { DadosPreset, ParametrosPreset } from "../../dominio/tipos";
import { semErros, validarPreset } from "../../dominio/validacao";
import type { Erros } from "../../dominio/validacao";
import "./FormularioPreset.css";

interface FormularioPresetProps {
  dadosIniciais?: DadosPreset;
  aoSalvar: (dados: DadosPreset) => void;
  aoCancelar: () => void;
}

const CAMPOS_NUMERICOS: {
  nome: keyof ParametrosPreset;
  rotulo: string;
  maximo: number;
}[] = [
  {
    nome: "tempoFocoMin",
    rotulo: "Tempo de foco (minutos)",
    maximo: 120,
  },
  {
    nome: "tempoPausaCurtaMin",
    rotulo: "Pausa curta (minutos)",
    maximo: 60,
  },
  {
    nome: "ciclosAntesPausaLonga",
    rotulo: "Ciclos antes da pausa longa",
    maximo: 12,
  },
  {
    nome: "tempoPausaLongaMin",
    rotulo: "Pausa longa (minutos)",
    maximo: 60,
  },
];

export default function FormularioPreset({
  dadosIniciais = PRESET_SUGERIDO,
  aoSalvar,
  aoCancelar,
}: FormularioPresetProps) {
  const [dados, setDados] = useState<DadosPreset>(() => ({ ...dadosIniciais }));
  const [erros, setErros] = useState<Erros<DadosPreset>>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novosErros = validarPreset(dados);
    setErros(novosErros);

    if (!semErros(novosErros)) return;

    aoSalvar(dados);
  }

  return (
    <form className="formulario-preset" onSubmit={enviar} noValidate>
      <div className="formulario-preset-campo">
        <label htmlFor="preset-nome">Nome do temporizador</label>

        <input
          id="preset-nome"
          name="nome"
          type="text"
          value={dados.nome}
          required
          maxLength={40}
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? "preset-nome-erro" : undefined}
          onChange={(evento) => {
            setDados({ ...dados, nome: evento.currentTarget.value });
          }}
        />

        {erros.nome && (
          <p
            id="preset-nome-erro"
            className="formulario-preset-erro"
            role="alert"
          >
            {erros.nome}
          </p>
        )}
      </div>

      {CAMPOS_NUMERICOS.map((campo) => {
        const id = `preset-${campo.nome}`;
        const erro = erros[campo.nome];
        const valor = dados[campo.nome];

        return (
          <div key={campo.nome} className="formulario-preset-campo">
            <label htmlFor={id}>{campo.rotulo}</label>

            <input
              id={id}
              name={campo.nome}
              type="number"
              value={Number.isNaN(valor) ? "" : valor}
              required
              min={1}
              max={campo.maximo}
              step={1}
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? `${id}-erro` : undefined}
              onChange={(evento) => {
                setDados({
                  ...dados,
                  [campo.nome]: evento.currentTarget.valueAsNumber,
                });
              }}
            />

            {erro && (
              <p
                id={`${id}-erro`}
                className="formulario-preset-erro"
                role="alert"
              >
                {erro}
              </p>
            )}
          </div>
        );
      })}

      <div className="formulario-preset-acoes">
        <button type="button" onClick={aoCancelar}>
          Cancelar
        </button>

        <button type="submit">Salvar temporizador</button>
      </div>
    </form>
  );
}
