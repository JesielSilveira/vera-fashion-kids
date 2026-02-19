"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  
  // ✅ CORREÇÃO MULTI-ID: O Mercado Pago envia como collection_id ou payment_id
  // Se for um teste manual seu, ele ainda aceita sessionId
  const sessionId = 
    searchParams.get("collection_id") || 
    searchParams.get("payment_id") || 
    searchParams.get("sessionId");
  
  const [status, setStatus] = useState("confirmando")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Se não tiver nenhum ID na URL após tentar todos os nomes, aí sim dá erro
    if (!sessionId) {
      // Só logamos erro se realmente não houver nenhum parâmetro de ID
      if (searchParams.toString().length > 0) {
         console.error("ID de pagamento não encontrado nos parâmetros da URL")
         setStatus("erro")
      }
      return
    }

    const checkOrder = async () => {
      try {
        // ✅ Enviando o ID capturado para a sua rota de check
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
      
      // Tenta por 30 segundos
      if (isDone || attempts > 15) {
        clearInterval(interval)
        if (!isDone) setStatus("atrasado")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      {status === "confirmando" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800">Processando Pedido...</h1>
          <p className="text-gray-500">Estamos confirmando seu pagamento com o Mercado Pago.</p>
        </div>
      )}

      {status === "erro" && (
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg border">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h1 className="text-2xl font-bold text-red-600">Ops! Pedido não localizado</h1>
          <p className="text-gray-600 mt-2">Não encontramos os dados da sua compra nesta página.</p>
          <Link href="/" className="mt-6 inline-block bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition">
            Voltar para a Loja
          </Link>
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
            <p className="text-[10px] text-gray-400 break-all mt-4">Comprovante: {sessionId}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition">
              Continuar Comprando
            </Link>
          </div>
        </div>
      )}

      {status === "atrasado" && (
        <div className="text-center p-8 bg-white rounded-3xl shadow-lg border max-w-sm">
          <span className="text-5xl mb-4 block">⏳</span>
          <h1 className="text-2xl font-bold text-orange-600">Pagamento Recebido!</h1>
          <p className="text-gray-600 mt-2">Estamos terminando de gerar seu pedido no sistema.</p>
          <p className="text-sm text-gray-400 mt-4 italic">Você receberá a confirmação por e-mail em instantes.</p>
          <Link href="/" className="mt-6 inline-block bg-pink-600 text-white px-8 py-3 rounded-xl font-bold">Voltar para a Loja</Link>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}