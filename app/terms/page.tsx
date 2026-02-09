export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Termos de Uso
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Ao acessar e utilizar o site da
          <strong> Vera Fashion Kids</strong>, você concorda com os termos
          descritos abaixo.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Uso do site</h2>
          <p>
            O usuário se compromete a utilizar o site de forma lícita e a não
            praticar atos que possam prejudicar seu funcionamento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Responsabilidades</h2>
          <p>
            A loja não se responsabiliza por danos decorrentes do uso indevido
            das informações disponíveis no site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Alterações</h2>
          <p>
            Os termos de uso podem ser atualizados a qualquer momento, sem aviso
            prévio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Contato</h2>
          <p>
            Em caso de dúvidas sobre estes termos, entre em contato conosco pelos
            canais disponíveis no site.
          </p>
        </section>
      </div>
    </div>
  )
}
