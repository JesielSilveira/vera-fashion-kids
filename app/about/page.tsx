export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-8">
      <h1 className="text-4xl font-extrabold text-center">
        Sobre a Vera Fashion Kids
      </h1>

      <p className="text-gray-700 text-lg leading-relaxed">
        A <strong>Vera Fashion Kids</strong> ão começou em uma prateleira, mas sim no coração de uma avó apaixonada. 
        Tudo começou em 2016, com a chegada da minha primeira neta, Isabella. 
        Ao mergulhar no universo dela, percebi que o mundo precisava de mais magia, de mais brilho e de vestidos que transformassem momentos comuns em contos de fadas.
      </p>

      <p className="text-gray-700 text-lg leading-relaxed">
        ​A loja cresceu passo a passo com a Isabella. Enquanto ela descobria o mundo,
         eu descobria minha verdadeira paixão: a moda infantil de festa.
          O que começou como um desejo de vestir minha neta como uma princesa, 
          tornou-se o propósito de levar esse encanto para famílias de todo o país.
          ​Nossa Missão
      </p>

      <p className="text-gray-700 text-lg leading-relaxed">
        Hoje, a Vera Fashion Kids atravessa fronteiras. Queremos espalhar o mundo encantado das festas por todo o Brasil, entregando não apenas vestidos, mas o cenário perfeito para as memórias mais preciosas da infância.
​"Vestir uma criança para um momento especial é participar da construção de um sonho. É por isso que cada detalhe aqui é escolhido com o amor de quem veste a própria neta." — Vera
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
