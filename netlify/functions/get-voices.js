// netlify/functions/get-voices.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { apiKey } = JSON.parse(event.body);
        if (!apiKey) throw new Error("Clé API manquante.");

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': apiKey }
        });

        if (!response.ok) throw new Error('Clé API invalide ou erreur réseau.');
        
        const data = await response.json();
        const voices = data.voices.map(v => ({ voice_id: v.voice_id, name: v.name }));
        
        return { statusCode: 200, body: JSON.stringify(voices) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};