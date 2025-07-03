// netlify/functions/generate-audio.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { apiKey, voiceId, text, style } = JSON.parse(event.body);
        if (!apiKey || !voiceId || !text) throw new Error("Données manquantes.");

        // On n'ajoute plus d'instructions au texte
        // Le texte est juste le texte
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text, // Le texte seul
                model_id: 'eleven_multilingual_v2',
                // On ajoute ici les réglages de la voix
                voice_settings: {
                    stability: 0.7,
                    similarity_boost: 0.7,
                    style: style || 0, // Utilise la valeur du curseur
                    use_speaker_boost: true
                }
            }),
        });
        
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.detail ? errorBody.detail.message : "Erreur de l'API ElevenLabs");
        }

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