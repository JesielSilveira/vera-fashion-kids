"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState("confirmando")
  const [order, setOrder] = useState<any>(null) // Armazena os dados do pedido

  useEffect(() => {
    if (!sessionId) {
      setStatus("erro")
      return
    }

    const checkOrder = async () => {
      try {
        // Busca os dados na nossa API interna
        const res = await fetch(`/api/orders/check?sessionId=${sessionId}`)
        
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
          setStatus("sucesso")
          return true 
        }
      } catch (err) {
        console.error("Erro ao buscar pedido:", err)
      }
      return false
    }

    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const isDone = await checkOrder()
      // Para o loop se achar o pedido ou se passar de 15 tentativas (30 segundos)
      if (isDone || attempts > 15) {
        clearInterval(interval)
        if (!isDone) setStatus("atrasado")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      {status === "confirmando" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800">Processando Pedido...</h1>
          <p className="text-gray-500">Aguardando confirmação do banco de dados.</p>
        </div>
      )}

      {status === "sucesso" && order && (
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pedido Realizado!</h1>
          <p className="text-gray-600 mb-6">Obrigado pela sua compra na Vera Fashion Kids.</p>
          
          <div className="text-left border-t border-b py-4 mb-6 space-y-2">
            <p className="text-sm text-gray-500">Resumo:</p>
            <div className="flex justify-between font-medium">
              <span>Total Pago:</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">ID da Sessão: {sessionId?.slice(0, 15)}...</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/minha-conta" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition">
              Acompanhar Pedido
            </Link>
            <Link href="/" className="text-pink-600 font-medium text-sm hover:underline">
              Voltar para a Loja
            </Link>
          </div>
        </div>
      )}

      {status === "atrasado" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-orange-600">O pagamento foi aprovado!</h1>
          <p className="text-gray-600 mt-2">Mas o banco de dados está demorando um pouco para atualizar.</p>
          <p className="text-sm text-gray-500">Não se preocupe, você receberá um e-mail em instantes.</p>
          <Link href="/minha-conta" className="mt-6 inline-block text-pink-600 font-bold">Verificar meus pedidos</Link>
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