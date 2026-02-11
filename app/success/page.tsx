"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState("confirmando") // confirmando, sucesso, erro

  useEffect(() => {
    if (!sessionId) return

    // Função que verifica se o pedido já apareceu no banco
    const checkOrder = async () => {
      try {
        const res = await fetch(`/api/orders/check?sessionId=${sessionId}`)
        if (res.ok) {
          setStatus("sucesso")
          return true // Para o loop
        }
      } catch (err) {
        console.error("Aguardando webhook...")
      }
      return false
    }

    // Polling: Tenta a cada 2 segundos, no máximo 10 vezes
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const isDone = await checkOrder()
      if (isDone || attempts > 10) clearInterval(interval)
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === "confirmando" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Quase lá!</h1>
          <p>Estamos confirmando seu pagamento com o Stripe...</p>
        </div>
      )}

      {status === "sucesso" && (
        <div className="text-center bg-green-50 p-8 rounded-2xl border border-green-200">
          <h1 className="text-3xl font-bold text-green-700">✅ Pagamento Confirmado!</h1>
          <p className="mt-2 text-green-600">Obrigado pela sua compra. O pedido já está no seu painel.</p>
          <a href="/minha-conta" className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg">
            Ver meus pedidos
          </a>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}