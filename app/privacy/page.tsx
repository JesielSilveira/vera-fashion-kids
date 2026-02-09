export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
      <h1 className="text-4xl font-extrabold text-center">
        Política de Privacidade
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          A <strong>Vera Fashion Kids</strong> respeita a privacidade de seus
          clientes e se compromete a proteger os dados pessoais fornecidos.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Coleta de informações</h2>
          <p>
            Coletamos informações necessárias para processar pedidos, realizar
            entregas e melhorar a experiência do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Uso das informações</h2>
          <p>
            Os dados são utilizados exclusivamente para fins operacionais,
            comunicação com o cliente e cumprimento de obrigações legais.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Segurança</h2>
          <p>
            Adotamos medidas de segurança para proteger as informações contra
            acesso não autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Compartilhamento</h2>
          <p>
            Não compartilhamos dados pessoais com terceiros, exceto quando
            necessário para a execução dos serviços contratados.
          </p>
        </section>
      </div>
    </div>
  )
}
