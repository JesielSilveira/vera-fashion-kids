// prisma/seed-admin.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "admin@admin.com"
  const password = "123456"

  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Administrador",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Admin criado:", admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
