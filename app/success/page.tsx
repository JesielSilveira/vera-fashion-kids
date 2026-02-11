"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  
  // ✅ CORREÇÃO: Pegando o nome exato que vem na URL (sessionId)
  const sessionId = searchParams.get("sessionId") 
  
  const [status, setStatus] = useState("confirmando")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Se não tiver o ID na URL, para aqui.
    if (!sessionId) {
      console.error("Session ID não encontrado na URL")
      setStatus("erro")
      return
    }

    const checkOrder = async () => {
      try {
        // ✅ CORREÇÃO: Enviando para a rota pública que criamos
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
      
      // Tenta por 30 segundos (15 * 2s)
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
          <p className="text-gray-500">Aguardando confirmação do servidor.</p>
        </div>
      )}

      {status === "erro" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Algo deu errado!</h1>
          <p className="text-gray-600">Não conseguimos identificar sua sessão de pagamento.</p>
          <Link href="/" className="mt-4 inline-block text-pink-600 font-bold">Voltar ao Início</Link>
        </div>
      )}

      {status === "sucesso" && order && (
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pedido Realizado!</h1>
          <p className="text-gray-600 mb-6">Obrigado por comprar na Vera Fashion Kids.</p>
          
          <div className="text-left border-t border-b py-4 mb-6 space-y-2">
            <p className="text-sm text-gray-500">Resumo:</p>
            <div className="flex justify-between font-medium">
              <span>Total Pago:</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-400 break-all">ID: {sessionId}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition">
              Continuar Comprando
            </Link>
          </div>
        </div>
      )}

      {status === "atrasado" && (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border">
          <h1 className="text-2xl font-bold text-orange-600">Pagamento Confirmado!</h1>
          <p className="text-gray-600 mt-2">O banco de dados está um pouco lento, mas seu pedido já foi recebido.</p>
          <p className="text-sm text-gray-500 mt-2">Você pode fechar esta página com segurança.</p>
          <Link href="/" className="mt-6 inline-block bg-pink-600 text-white px-6 py-2 rounded-lg font-bold">Voltar para a Loja</Link>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}