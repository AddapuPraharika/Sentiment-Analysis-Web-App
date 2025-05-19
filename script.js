document.getElementById('sentimentBtn').addEventListener('click', async () => {
    await analyzeText('sentiment');
});

document.getElementById('emotionBtn').addEventListener('click', async () => {
    await analyzeText('emotion');
});

document.getElementById('toxicityBtn').addEventListener('click', async () => {
    await analyzeText('toxicity');
});

function mapStarsToSentiment(label) {
    if (label === '1 star' || label === '2 stars') {
        return 'Negative';
    } else if (label === '3 stars') {
        return 'Neutral';
    } else if (label === '4 stars' || label === '5 stars') {
        return 'Positive';
    } else {
        return label;
    }
}

async function analyzeText(type) {
    const text = document.getElementById('inputText').value.trim();
    const resultDiv = document.getElementById('result');

    if (!text) {
        resultDiv.textContent = 'Please enter some text to analyze.';
        return;
    }

    resultDiv.textContent = 'Analyzing...';

    let endpoint = '';
    if (type === 'sentiment') {
        endpoint = 'http://localhost:8000/predict/sentiment';
    } else if (type === 'emotion') {
        endpoint = 'http://localhost:8000/predict/emotion';
    } else if (type === 'toxicity') {
        endpoint = 'http://localhost:8000/predict/toxicity';
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (response.ok) {
            if (type === 'sentiment') {
                const sentimentData = data.sentiment;
                if (Array.isArray(sentimentData) && sentimentData.length > 0) {
                    const topResult = sentimentData[0];
                    const sentimentLabel = mapStarsToSentiment(topResult.label);
                    const scorePercent = (topResult.score * 100).toFixed(2);
                    resultDiv.textContent = `Sentiment: ${sentimentLabel} (${scorePercent}%)`;
                } else {
                    resultDiv.textContent = 'Sentiment: No data received';
                }
            } else if (type === 'emotion') {
                const emotionData = data.emotion;
                if (Array.isArray(emotionData)) {
                    const flatEmotionData = emotionData.flat(Infinity);
                    const formattedEmotion = flatEmotionData.map(item => `${item.label}: ${(item.score * 100).toFixed(2)}%`).join('\n');
                    resultDiv.textContent = `Emotion Scores:\n${formattedEmotion}`;
                } else {
                    resultDiv.textContent = 'Emotion: No data received';
                }
            } else if (type === 'toxicity') {
                const toxicityData = data.toxicity;
                if (Array.isArray(toxicityData)) {
                    const flatToxicityData = toxicityData.flat(Infinity);
                    const formattedToxicity = flatToxicityData.map(item => `${item.label}: ${(item.score * 100).toFixed(2)}%`).join('\n');
                    resultDiv.textContent = `Toxicity Scores:\n${formattedToxicity}`;
                } else {
                    resultDiv.textContent = 'Toxicity: No data received';
                }
            }
        } else {
            resultDiv.textContent = `Error: ${data.detail || 'Unknown error'}`;
        }
    } catch (error) {
        resultDiv.textContent = 'Error: Could not connect to the server.';
        console.error('Error:', error);
    }
}
