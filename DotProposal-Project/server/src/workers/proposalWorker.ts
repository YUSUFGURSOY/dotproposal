import { ConsumeMessage } from 'amqplib';
import { getChannel } from '../config/rabbitmq';
import { generateProposalService } from '../Service/proposalService'; // 👈 Servisimizi dahil ettik

export const startProposalWorker = async () => {
    const channel = getChannel();
    
    if (!channel) {
        console.error("Worker başlatılamadı: Kanal bulunamadı.");
        return;
    }

    console.log("👷 Worker çalışıyor, 'proposal_queue' kuyruğu dinleniyor...");

    channel.consume('proposal_queue', async (msg: ConsumeMessage | null) => {
        if (msg !== null) {
            try {
                const data = JSON.parse(msg.content.toString());
                console.log(`📩 Kuyruktan yeni bir iş alındı! Proposal ID: ${data.proposalId || 'Bilinmiyor'}`);

                // ASIL İŞLEM BURADA: Simülasyon yerine gerçek servisi çağırıyoruz
                // Controller'dan gelen paket: userId, requestBody (form datası) ve proposalId
                await generateProposalService(data.userId, data.requestBody, data.proposalId);
                
                console.log("✅ İşlem başarıyla tamamlandı, Gemini cevabı veritabanına kaydedildi.");

                channel.ack(msg); 
                
            } catch (error) {
                console.error("❌ Worker işlemi sırasında hata oluştu:", error);
                channel.nack(msg, false, true); 
            }
        }
    });
};