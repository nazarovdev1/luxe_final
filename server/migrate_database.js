/**
 * MongoDB Migration Script
 * Eski clusterdan yangi clusterga barcha ma'lumotlarni ko'chiradi
 */

import { MongoClient } from 'mongodb';

// Eski cluster (Cluster0 - US)
const OLD_MONGO_URL = 'mongodb+srv://akbarnazarov109_db_user:asd126536@cluster0.f7lycys.mongodb.net/?retryWrites=true&w=majority';

// Yangi cluster (luxxx - Mumbai)
const NEW_MONGO_URL = 'mongodb+srv://akbarnazarov888_db_user:asd126536@luxxx.nu3od0u.mongodb.net/?retryWrites=true&w=majority';

const DATABASE_NAME = 'luxe';

// Ko'chiriladigan collectionlar
const COLLECTIONS = ['products', 'users', 'orders', 'reviews', 'announcements'];

async function migrate() {
    console.log('🚀 Migration boshlandi...\n');

    let oldClient, newClient;

    try {
        // 1. Eski clusterga ulanish
        console.log('📦 Eski clusterga ulanmoqda...');
        oldClient = new MongoClient(OLD_MONGO_URL);
        await oldClient.connect();
        const oldDb = oldClient.db(DATABASE_NAME);
        console.log('✅ Eski clusterga ulandi!\n');

        // 2. Yangi clusterga ulanish
        console.log('📦 Yangi clusterga ulanmoqda...');
        newClient = new MongoClient(NEW_MONGO_URL);
        await newClient.connect();
        const newDb = newClient.db(DATABASE_NAME);
        console.log('✅ Yangi clusterga ulandi!\n');

        // 3. Har bir collection uchun migrate
        for (const collectionName of COLLECTIONS) {
            console.log(`\n📋 ${collectionName} ko'chirilmoqda...`);

            try {
                // Eski clusterdan o'qish
                const oldCollection = oldDb.collection(collectionName);
                const documents = await oldCollection.find({}).toArray();

                if (documents.length === 0) {
                    console.log(`   ⚠️  ${collectionName} - bo'sh (0 ta document)`);
                    continue;
                }

                console.log(`   📄 ${documents.length} ta document topildi`);

                // Yangi clusterga yozish
                const newCollection = newDb.collection(collectionName);

                // Avval mavjud documentlarni o'chirish (agar bor bo'lsa)
                await newCollection.deleteMany({});

                // Yangi documentlarni qo'shish
                const result = await newCollection.insertMany(documents);
                console.log(`   ✅ ${result.insertedCount} ta document ko'chirildi!`);

            } catch (collError) {
                console.log(`   ❌ ${collectionName} xatosi:`, collError.message);
            }
        }

        console.log('\n\n✨ ========================================');
        console.log('✨ MIGRATION MUVAFFAQIYATLI YAKUNLANDI!');
        console.log('✨ ========================================\n');
        console.log('Endi serverni qayta ishga tushiring:');
        console.log('npm start\n');

    } catch (error) {
        console.error('\n❌ Migration xatosi:', error.message);
    } finally {
        // Ulanishlarni yopish
        console.log('🔒 Ulanishlar yopilmoqda...');
        if (oldClient) await oldClient.close();
        if (newClient) await newClient.close();
    }

    process.exit(0);
}

// Scriptni ishga tushirish
migrate();
