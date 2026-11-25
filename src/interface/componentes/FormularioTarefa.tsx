import { useState } from "react";
import type { FormEvent } from "react";
import "./FormularioTarefa.css";
import { TAREFA_PADRAO } from "../../dominio/tarefas";

import {
  ESTADOS,
  PRIORIDADES,
  ROTULO_ESTADO,
  ROTULO_PRIORIDADE
} from "../../dominio/tipos";

import type {
  DadosTarefa,
  EstadoTarefa,
  Prioridade
} from "../../dominio/tipos";

import {
  semErros,
  validarTarefa
} from "../../dominio/validacao";

import type { Erros } from "../../dominio/validacao";

interface FormularioTarefaProps {
  dadosIniciais ?: DadosTarefa;
  aoSalvar: (dados: DadosTarefa) => void;
  aoCancelar: () => void;
}

export default function FormularioTarefa({
  dadosIniciais = TAREFA_PADRAO, aoSalvar, aoCancelar,
}: FormularioTarefaProps) {

  const [dados, setDados] = useState<DadosTarefa>(
    () => ({ ...dadosIniciais }));

  const [erros, setErros] = useState<Erros<DadosTarefa>>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novosErros = validarTarefa(dados);

    setErros(novosErros);

    if (!semErros(novosErros)) return;

    aoSalvar(dados);
  }
    return (
    <form
      className="formulario-tarefa"
      onSubmit={enviar}
      noValidate
    >
      <div className="formulario-tarefa-campo">

        <label htmlFor="tarefa-titulo"> Título da tarefa </label>

        <input
          id="tarefa-titulo"
          name="titulo"
          type="text"
          placeholder="Digite o título da tarefa"
          value={dados.titulo}
          required
          maxLength={100}
          onChange={(evento) => { setDados({...dados,
              titulo: evento.currentTarget.value });
          }}
          aria-invalid={Boolean(erros.titulo)}
          aria-describedby={
          erros.titulo ? "tarefa-titulo-erro" : undefined
          }
        />

        {erros.titulo && (
        <p id="tarefa-titulo-erro"
        className="formulario-tarefa-erro" role="alert">
        {erros.titulo}</p>)}

      </div>

      <div className="formulario-tarefa-campo">

        <label htmlFor="tarefa-estado"> Estado </label>

        <select
          id="tarefa-estado"
          name="estado"
          value={dados.estado}
          onChange={(evento) => { setDados({ ...dados,
              estado: evento.currentTarget.value as EstadoTarefa});
          }}
          aria-invalid={Boolean(erros.estado)}
          aria-describedby={
          erros.estado ? "tarefa-estado-erro" : undefined
          }
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
                {ROTULO_ESTADO[estado]} </option> ))}
        </select>

        {erros.estado && (
          <p className="formulario-tarefa-erro" role="alert" id="tarefa-estado-erro">
            {erros.estado}
          </p>
        )}

      </div>

      <div className="formulario-tarefa-campo">

        <label htmlFor="tarefa-prioridade">
          Prioridade
        </label>

        <select
          id="tarefa-prioridade"
          name="prioridade"
          value={dados.prioridade}
          onChange={(evento) => { setDados({ ...dados,
              prioridade: evento.currentTarget.value as Prioridade});
          }}
          aria-invalid={Boolean(erros.prioridade)}
          aria-describedby={
            erros.prioridade ? "tarefa-prioridade-erro" : undefined
          }
        >
          {PRIORIDADES.map((prioridade) => (
            <option key={prioridade} value={prioridade}>
              {ROTULO_PRIORIDADE[prioridade]} </option>))}
        </select>

        {erros.prioridade && (
          <p className="formulario-tarefa-erro" role="alert" id="tarefa-prioridade-erro">
            {erros.prioridade}</p> )}

      </div>

      <div className="formulario-tarefa-acoes">

        <button type="button" onClick={aoCancelar}> Cancelar </button>

        <button type="submit"> Salvar tarefa </button>

      </div>

    </form>
  );
}