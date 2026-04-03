import prisma from './prisma';

/**
 * Short-term memory logic and conversation DB logging handling offline constraints.
 */
export class MemoryManager {
    static async getSessionMessages(sessionId: string) {
        // Retrieve recent conversations
        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            take: 10 // Last 5 exchanges (5 user, 5 ai)
        });

        // Parse to Ollama expected format
        return messages.map((m: any) => ({
            role: m.role,
            content: m.content
        }));
    }

    static async saveMessage(sessionId: string, role: string, content: string) {
        // Enforce token constraints / character limits roughly per offline rule
        let tokenSafeContent = content;
        if (content.length > 2000) {
            tokenSafeContent = content.substring(0, 2000) + '... (truncated due to local token limits)';
        }

        return prisma.message.create({
            data: {
                sessionId,
                role,
                content: tokenSafeContent
            }
        });
    }

    static async getOrCreateSession(userId: string) {
        let session = await prisma.chatSession.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    userId,
                    title: 'Offline Chat'
                }
            });
        }
        return session;
    }
}
