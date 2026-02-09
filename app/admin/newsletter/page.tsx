import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminNewsletterPage() {
  const emails = await prisma.newsletterEmail.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Newsletter
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            Emails cadastrados ({emails.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {emails.map(item => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{item.email}</span>
              <span className="text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
