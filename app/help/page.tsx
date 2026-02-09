export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Central de Ajuda
      </h1>

      <p className="text-center text-gray-600 text-lg">
        Encontre respostas para as dúvidas mais comuns da
        <strong> Vera Fashion Kids</strong>.
      </p>

      <div className="space-y-6">
        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            📦 Pedidos e Entregas
          </h2>
          <p className="text-gray-700">
            Após a confirmação do pagamento, seu pedido será processado e enviado
            conforme o prazo informado no momento da compra. Você receberá as
            atualizações pelo email cadastrado.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            💳 Pagamentos
          </h2>
          <p className="text-gray-700">
            Aceitamos diferentes formas de pagamento para sua comodidade.
            Caso o pagamento não seja aprovado, verifique os dados ou tente
            novamente.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            🔁 Trocas e Devoluções
          </h2>
          <p className="text-gray-700">
            Caso precise trocar ou devolver um produto, entre em contato conosco
            dentro do prazo informado. Nossa equipe irá orientar todo o processo.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            👕 Tamanhos e Produtos
          </h2>
          <p className="text-gray-700">
            Consulte as informações de tamanho disponíveis na página do produto.
            Em caso de dúvida, nossa equipe está à disposição para ajudar.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            📞 Atendimento
          </h2>
          <p className="text-gray-700">
            Se sua dúvida não estiver listada aqui, fale conosco pela página de
            contato. Teremos prazer em ajudar.
          </p>
        </div>
      </div>
    </div>
  )
}
