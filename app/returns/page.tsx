export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Trocas e Devoluções
      </h1>

      <p className="text-center text-gray-600 text-lg">
        Confira abaixo a política de trocas e devoluções da
        <strong> Vera Fashion Kids</strong>.
      </p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Prazo para troca ou devolução</h2>
          <p>
            O cliente pode solicitar a troca ou devolução do produto em até
            <strong> 7 dias corridos</strong> após o recebimento, conforme o
            Código de Defesa do Consumidor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Condições do produto</h2>
          <p>
            Para que a troca ou devolução seja aceita, o produto deve estar sem
            sinais de uso, com etiqueta original e em sua embalagem original.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Como solicitar</h2>
          <p>
            Para solicitar a troca ou devolução, entre em contato conosco pela
            página de contato, informando o número do pedido e o motivo da
            solicitação.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Formas de reembolso</h2>
          <p>
            O reembolso será realizado de acordo com a forma de pagamento
            utilizada na compra, após o recebimento e análise do produto
            devolvido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Custos de envio</h2>
          <p>
            Em caso de defeito ou erro no envio, os custos de frete serão de
            responsabilidade da loja. Nos demais casos, o frete poderá ser de
            responsabilidade do cliente.
          </p>
        </section>
      </div>
    </div>
  )
}
