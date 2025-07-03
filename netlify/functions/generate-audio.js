// netlify/functions/generate-audio.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { apiKey, voiceId, text, intonations } = JSON.parse(event.body);
        if (!apiKey || !voiceId || !text) throw new Error("Données manquantes.");

        const finalText = intonations ? `${intonations}. ${text}` : text;
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: finalText,
                model_id: 'eleven_multilingual_v2',
            }),
        });
        
        if (!response.ok) throw new Error((await response.json()).detail.message);

        const audioBuffer = await response.arrayBuffer();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'audio/mpeg' },
            body: Buffer.from(audioBuffer).toString('base64'),
            isBase64Encoded: true,
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};