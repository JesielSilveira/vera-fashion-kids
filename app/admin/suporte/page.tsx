import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SupportAdminPage() {
  const messages = await prisma.support.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Mensagens de Suporte</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase">
            Total de contatos: {messages.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-black uppercase text-xs">Data</TableHead>
                <TableHead className="font-black uppercase text-xs">Cliente</TableHead>
                <TableHead className="font-black uppercase text-xs">E-mail</TableHead>
                <TableHead className="font-black uppercase text-xs">Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                    Nenhuma mensagem recebida ainda.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="text-xs">
                      {new Date(msg.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-bold">{msg.name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell className="max-w-md break-words text-sm italic text-gray-600">
                      "{msg.message}"
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}