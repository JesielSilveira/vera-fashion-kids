export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Contato
      </h1>

      <p className="text-center text-gray-600 text-lg">
        Entre em contato com a <strong>Vera Fashion Kids</strong>.
        Estamos prontos para te atender!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INFORMAÇÕES */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Fale conosco</h2>

          <p className="text-gray-700">
            Se você tiver dúvidas sobre nossos produtos, pedidos ou quiser
            falar com nossa equipe, utilize um dos canais abaixo.
          </p>

          <ul className="space-y-2 text-gray-700">
            <li>
              📧 Email: <span className="font-medium">contato@verafashionkids.com</span>
            </li>
            <li>
              📱 WhatsApp: <span className="font-medium">(00) 00000-0000</span>
            </li>
            <li>
              🕒 Atendimento: Segunda a Sexta, das 9h às 18h
            </li>
          </ul>
        </div>

        {/* FORMULÁRIO (VISUAL) */}
        <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
          <h2 className="text-2xl font-semibold">Envie uma mensagem</h2>

          <input
            type="text"
            placeholder="Seu nome"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="email"
            placeholder="Seu email"
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            placeholder="Sua mensagem"
            className="w-full border rounded px-3 py-2 min-h-[120px] resize-y"
          />

          <button
            type="button"
            className="w-full bg-black text-white rounded py-2 font-semibold hover:opacity-90"
          >
            Enviar mensagem
          </button>

          <p className="text-xs text-gray-500">
            * Formulário ilustrativo. A funcionalidade pode ser adicionada depois.
          </p>
        </div>
      </div>
    </div>
  )
}
