"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner" // Ou use um alert simples se não tiver sonner

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    }

    try {
      // Aqui você pode criar uma rota API ou usar um serviço como Formspree
      // Por enquanto, vamos simular o envio para você testar o visual funcional
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      console.log("Mensagem enviada:", data)
      alert("Mensagem enviada com sucesso! Entraremos em contato em breve.")
      event.currentTarget.reset()
    } catch (error) {
      alert("Erro ao enviar mensagem. Tente o WhatsApp!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12 overflow-x-hidden">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900">
          Contato
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Dúvidas sobre tamanhos ou pedidos? A equipe da <strong>Vera Fashion Kids</strong> está pronta para ajudar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* CANAIS DE ATENDIMENTO */}
        <div className="space-y-8 bg-white p-8 rounded-3xl border shadow-sm">
          <div>
            <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">Fale conosco</h2>
            <p className="text-gray-600 leading-relaxed">
              Escolha o canal de sua preferência. Respondemos rapidinho!
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-full">📧</div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">E-mail</p>
                <p className="font-bold text-gray-800">veraregina2257z@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">📱</div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">WhatsApp</p>
                <p className="font-bold text-gray-800">(54) 99184-4554</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">🕒</div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Atendimento</p>
                <p className="font-bold text-gray-800">Segunda a Sexta, das 8h às 18h</p>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO REAL */}
        <form onSubmit={handleSubmit} className="border-2 border-black rounded-3xl p-8 space-y-5 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Envie uma mensagem</h2>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase ml-1">Seu Nome</label>
            <Input
              name="name"
              required
              placeholder="Ex: Maria Silva"
              className="rounded-xl border-gray-300 focus:ring-black focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase ml-1">Seu E-mail</label>
            <Input
              name="email"
              type="email"
              required
              placeholder="email@exemplo.com"
              className="rounded-xl border-gray-300 focus:ring-black focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase ml-1">Mensagem</label>
            <Textarea
              name="message"
              required
              placeholder="Como podemos te ajudar?"
              className="rounded-xl border-gray-300 focus:ring-black focus:border-black min-h-[120px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-6 font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
          >
            {loading ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </form>
      </div>
    </div>
  )
}