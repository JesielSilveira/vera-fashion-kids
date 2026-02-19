export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-center uppercase tracking-tighter">
          Sobre a Vera Fashion Kids
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed">
          A <strong>Vera Fashion Kids</strong> não começou em uma prateleira, mas sim no coração de uma avó apaixonada. 
          Tudo começou em 2016, com a chegada da minha primeira neta, Isabella. 
          Ao mergulhar no universo dela, percebi que o mundo precisava de mais magia, de mais brilho e de vestidos que transformassem momentos comuns em contos de fadas.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed">
          A loja cresceu passo a passo com a Isabella. Enquanto ela descobria o mundo,
          eu descobria minha verdadeira paixão: a moda infantil de festa.
          O que começou como um desejo de vestir minha neta como uma princesa, 
          tornou-se o propósito de levar esse encanto para famílias de todo o país.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-black pl-4">
          "Vestir uma criança para um momento especial é participar da construção de um sonho. É por isso que cada detalhe aqui é escolhido com o amor de quem veste a própria neta." — Vera
        </p>
      </div>

      {/* SEÇÃO ONDE ESTAMOS / MAPA */}
      <div className="space-y-6 pt-8 border-t">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">Onde Estamos</h2>
          <p className="text-gray-500">Venha nos visitar em Espumoso</p>
        </div>
        
        <div className="w-full h-[400px] rounded-3xl overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=SUA_CHAVE_AQUI&q=Travessa+São+Jorge+64,Espumoso+RS,Brasil`}
          ></iframe>
          {/* NOTA: Você pode usar o link direto do Google Maps abaixo se preferir não usar API Key agora */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3485.432654497645!2d-52.853386!3d-28.724898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94fd708deaebe503%3A0x9ed10e6fd71f4d8f!2sTv.%20S%C3%A3o%20Jorge%2C%2064%20-%20Espumoso%2C%20RS%2C%2099400-000!5e0!3m2!1spt-BR!2sbr!4v1708280000000!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy"
          ></iframe>
        </div>
        <p className="text-center font-bold text-gray-800">
          Travessa São Jorge, 64 — Espumoso-RS
        </p>
      </div>

      <div className="border-t pt-6">
        <p className="text-center text-gray-500 text-sm">
          Vera Fashion Kids © {new Date().getFullYear()} —  
          Moda infantil com amor e estilo.
        </p>
      </div>
    </div>
  )
}