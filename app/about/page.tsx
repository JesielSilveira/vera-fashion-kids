export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-8">
      <h1 className="text-4xl font-extrabold text-center">
        Sobre a Vera Fashion Kids
      </h1>

      <p className="text-gray-700 text-lg leading-relaxed">
        A <strong>Vera Fashion Kids</strong> nasceu com o propósito de levar
        estilo, conforto e qualidade para o dia a dia das crianças.
        Trabalhamos com peças pensadas para acompanhar cada fase da infância,
        sempre unindo moda e bem-estar.
      </p>

      <p className="text-gray-700 text-lg leading-relaxed">
        Nossa loja é focada em oferecer produtos selecionados com carinho,
        prezando por tecidos confortáveis, ótimo acabamento e preços justos.
        Acreditamos que toda criança merece se vestir bem e se sentir livre
        para brincar, aprender e se expressar.
      </p>

      <p className="text-gray-700 text-lg leading-relaxed">
        Estamos sempre buscando novidades e tendências do universo infantil,
        sem abrir mão da qualidade e da segurança. Aqui, cada detalhe importa —
        do atendimento à entrega.
      </p>

      <div className="border-t pt-6">
        <p className="text-center text-gray-500">
          Vera Fashion Kids © {new Date().getFullYear()} —  
          Moda infantil com amor e estilo.
        </p>
      </div>
    </div>
  )
}
