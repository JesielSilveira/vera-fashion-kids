import Link from "next/link"
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react"

const footerData = {
  institucional: [
    { label: "Sobre a loja", href: "/about" },
    { label: "Contato", href: "/contact" },
  ],
  ajuda: [
    { label: "Central de ajuda", href: "/help" },
    { label: "Trocas e devoluções", href: "/returns" },
    { label: "Prazos e entregas", href: "/shipping" },
  ],
  legal: [
    { label: "Política de privacidade", href: "/privacy" },
    { label: "Termos de uso", href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      
      {/* Top infos */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Logo + descrição */}
          <div>
            <h3 className="mb-2 text-xl font-bold">Vera Fashion Kids</h3>
            <p className="text-sm text-muted-foreground">
              A melhor experiência de compra online, com segurança e rapidez.
            </p>

            {/* Redes sociais */}
            <div className="mt-4 flex gap-3">
              <Link href="#"><Facebook className="h-5 w-5" /></Link>
              <Link href="#"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="mb-3 font-semibold">Institucional</h4>
            <ul className="space-y-2 text-sm">
              {footerData.institucional.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="mb-3 font-semibold">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              {footerData.ajuda.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segurança e entrega */}
          <div>
            <h4 className="mb-3 font-semibold">Segurança</h4>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Compra 100% segura
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Entrega para todo o Brasil
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Parcelamento em até 12x
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Vera Fashion Kids. Todos os direitos reservados.
      </div>
    </footer>
  )
}
