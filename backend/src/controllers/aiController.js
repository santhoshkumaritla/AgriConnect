const predictDisease = async (req, res) => {
  const sampleResults = [
    {
      crop: 'Tomato',
      disease: 'Early blight',
      confidence: 0.86,
      treatment: 'Use copper-based fungicides and remove infected leaves.',
    },
    {
      crop: 'Potato',
      disease: 'Late blight',
      confidence: 0.79,
      treatment: 'Apply certified fungicide and avoid overhead irrigation.',
    },
  ];

  const prediction = sampleResults[Math.floor(Math.random() * sampleResults.length)];
  return res.json({
    message: 'Mock prediction - AI module placeholder',
    prediction,
  });
};

module.exports = { predictDisease };
