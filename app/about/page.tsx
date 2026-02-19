export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12 overflow-x-hidden">
      {/* HISTÓRIA */}
      <div className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-black text-center uppercase tracking-tighter text-gray-900">
          Sobre a Vera Fashion Kids
        </h1>

        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            A <strong className="text-black">Vera Fashion Kids</strong> não começou em uma prateleira, mas sim no coração de uma avó apaixonada. 
            Tudo começou em 2016, com a chegada da minha primeira neta, Isabella. 
            Ao mergulhar no universo dela, percebi que o mundo precisava de mais magia, de mais brilho e de vestidos que transformassem momentos comuns em contos de fadas.
          </p>

          <p>
            A loja cresceu passo a passo com a Isabella. Enquanto ela descobria o mundo,
            eu descobria minha verdadeira paixão: a moda infantil de festa.
            O que começou como um desejo de vestir minha neta como uma princesa, 
            tornou-se o propósito de levar esse encanto para famílias de todo o país.
          </p>

          <p className="italic border-l-4 border-black pl-6 py-2 bg-slate-50 rounded-r-xl font-medium">
            "Vestir uma criança para um momento especial é participar da construção de um sonho. É por isso que cada detalhe aqui é escolhido com o amor de quem veste a própria neta." — Vera
          </p>

          <p>
            Hoje, a Vera Fashion Kids atravessa fronteiras. Queremos espalhar o mundo encantado das festas por todo o Brasil, entregando não apenas vestidos, mas o cenário perfeito para as memórias mais preciosas da infância.
          </p>
        </div>
      </div>

      {/* SEÇÃO ONDE ESTAMOS / MAPA (CORRIGIDO SEM API KEY) */}
      <div className="space-y-6 pt-12 border-t">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">Onde Estamos</h2>
          <p className="text-gray-500 font-medium">Venha conhecer nosso cantinho em Espumoso</p>
        </div>
        
        {/* Container do Mapa com Estilo Neobrutalista */}
        <div className="w-full h-[450px] rounded-3xl overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3483.565431526487!2d-52.85542792437651!3d-28.723730275615714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9503708d7bef65e3%3A0xc9e10e6f661f0d8f!2sTv.%20S%C3%A3o%20Jorge%2C%2064%2C%20Espumoso%20-%20RS%2C%2099400-000!5e0!3m2!1spt-BR!2sbr!4v1708280000000!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Vera Fashion Kids"
          ></iframe>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <p className="font-black text-gray-900 uppercase text-center text-lg tracking-tight">
            Travessa São Jorge, 64
          </p>
          <p className="text-gray-600 font-bold uppercase text-sm tracking-widest">
            Espumoso - RS | CEP 99400-000
          </p>
        </div>
      </div>

      {/* RODAPÉ DA PÁGINA */}
      <div className="border-t pt-8 pb-4 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Vera Fashion Kids © {new Date().getFullYear()} —  
          Moda infantil com amor de avó.
        </p>
      </div>
    </div>
  )
}