import amqp from 'amqplib';

// TypeScript'in tip uyuşmazlığı yaratmasını engellemek için "any" kullanıyoruz
let channel: any;

export const connectQueue = async () => {
    try {
        // connection değişkenini sadece bu fonksiyonun içine aldık (TS kendi tipini kendi bulacak)
        const connection = await amqp.connect('amqp://localhost:5672');
        
        // Kanalı oluştur ve dışarıdaki değişkene ata
        channel = await connection.createChannel();
        
        // Kuyruğu hazırla
        await channel.assertQueue('proposal_queue', { durable: true });
        
        console.log("✅ RabbitMQ Bağlantısı Başarılı: 'proposal_queue' dinlemeye hazır.");
        
        return channel;
    } catch (error) {
        console.error("❌ RabbitMQ Bağlantı Hatası:", error);
        process.exit(1); 
    }
};

export const getChannel = () => {
    if (!channel) {
        console.error("RabbitMQ kanalı henüz hazır değil!");
    }
    return channel;
};