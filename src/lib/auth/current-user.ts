const user = await prisma.user.findUnique({
  where: { id: session.sub },
  select: {
    id: true,
    email: true,
    name: true,
    plan: true,
    password: true,
    phoneNumber: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
  },
});
