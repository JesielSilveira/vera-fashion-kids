export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Prazos e Entregas
      </h1>

      <p className="text-center text-gray-600 text-lg">
        Informações sobre envio e prazos da
        <strong> Vera Fashion Kids</strong>.
      </p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Prazo de processamento</h2>
          <p>
            Após a confirmação do pagamento, o pedido é processado em até
            <strong> 2 dias úteis</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Prazo de entrega</h2>
          <p>
            O prazo de entrega varia conforme a região e a forma de envio
            escolhida no momento da compra.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Acompanhamento</h2>
          <p>
            Após o envio, o cliente receberá um código de rastreamento para
            acompanhar a entrega do pedido.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Possíveis atrasos</h2>
          <p>
            Em situações excepcionais, como períodos de alta demanda ou fatores
            externos, o prazo de entrega pode sofrer alterações.
          </p>
        </section>
      </div>
    </div>
  )
}
