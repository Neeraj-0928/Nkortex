// cron.ts
// Local task scheduler offline running using node-cron.
import cron from 'node-cron';
import prisma from './prisma';

console.log("Offline Task Scheduler started.");

// Run daily at midnight to "refresh" local offline entries or cleanup old short-term memory
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily memory cleanup & analytics update...');
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Truncate old chat history dynamically (optimization)
        const resUser = await prisma.message.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } }
        });
        console.log(`Cleaned up ${resUser.count} old memory contexts.`);
    } catch (err) {
        console.error("Local SQLite/PG Engine offline: Skipping cleanup.");
    }
});

// Run every 6 hours updating mocked API "crawler"
cron.schedule('0 */6 * * *', async () => {
    console.log("Verifying offline internship schema data...");
    // Future offline scraper functions would hook here
});
