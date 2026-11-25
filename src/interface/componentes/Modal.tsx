import { useEffect, useId, useRef } from 'react'
import type {ReactNode} from 'react'
import './Modal.css'

interface ModalProps{
    aberto: boolean
    titulo: string
    aoFechar: () => void
    children: ReactNode
}

export default function Modal({
    aberto,
    titulo,
    aoFechar,
    children,
}: ModalProps){
    const referencia = useRef<HTMLDialogElement>(null)
    const tituloId = useId()

    useEffect(() => {
        const dialog = referencia.current
        if(!dialog)
            return

        if(aberto && !dialog.open){
            dialog.showModal()
        }else if(!aberto && dialog.open){
            dialog.close()
        }

        return () => {
            if(dialog.open)
                dialog.close()
        }
    }, [aberto])
    return (
        <dialog
            ref = {referencia}
            className="modal"
            aria-labelledby= {tituloId}
            onCancel={(evento) => {
                evento.preventDefault()
                aoFechar()
            }}
        >
            <div className="modal-cabecalho">
                <h2 id={tituloId}>{titulo}</h2>

                <button type="button" className="modal-fechar" onClick={aoFechar} aria-label="Fechar modal">
                    ×
                </button>
            </div>
            <div className="modal-conteudo">{children}</div>
        </dialog>
    )
}