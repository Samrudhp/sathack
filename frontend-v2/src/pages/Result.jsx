import { useNavigate } from 'react-router-dom';
import { useScanStore, useUserStore } from '../store';

// Helper function to format markdown text
function formatMarkdownText(text) {
  if (!text) return '';
  
  // Remove markdown headers (## Step 1:, etc.)
  text = text.replace(/^#{1,6}\s+.*$/gm, '');
  
  // Remove bold markers (**text** -> text)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Remove italic markers (*text* -> text)
  text = text.replace(/\*(.*?)\*/g, '$1');
  
  // Remove numbered list markers that are too verbose (## Step X:)
  text = text.replace(/^Step \d+:.*$/gm, '');
  
  // Clean up multiple consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Remove lines that start with "The final answer is:"
  text = text.replace(/^The final answer is:.*$/gm, '');
  
  // Extract only the essential disposal instructions (numbered list at the end)
  const finalInstructions = text.match(/^\d+\.\s+\*\*.*?\*\*:.*$/gm);
  if (finalInstructions && finalInstructions.length > 0) {
    return finalInstructions
      .map(line => line.replace(/\*\*/g, '').replace(/^\d+\.\s+/, '• '))
      .join('\n\n');
  }
  
  // If no structured list found, clean and return the text
  return text.trim();
}

function Result() {
  const navigate = useNavigate();
  const { currentScan, globalDocs, personalDocs } = useScanStore();
  const { language } = useUserStore();

  if (!currentScan) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: '#faf8f3' }}>
        <div className="card text-center">
          <p className="text-xl font-semibold mb-4" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'No scan data found' : 'कोई स्कैन डेटा नहीं मिला'}
          </p>
          <button 
            onClick={() => navigate('/home')} 
            className="px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(74, 124, 44, 0.3)'
            }}
          >
            {language === 'en' ? 'Go Home' : 'होम पर जाएं'}
          </button>
        </div>
      </div>
    );
  }

  const {
    material,
    material_description,  // NEW: Detailed CLIP description
    raw_detection,         // NEW: Exact CLIP label
    transcribed_text,  // For voice scans
    confidence,
    cleanliness_score,
    hazard_class,
    disposal_instruction,
    hazard_notes,
    estimated_credits,
    environmental_impact,
    recycler_ranking,
  } = currentScan;
  
  // Use detailed description for display, fallback to raw_detection, then material
  const displayMaterial = raw_detection || material || (language === 'en' ? 'General Waste' : 'सामान्य कचरा');
  
  // Check if this is a voice scan
  const isVoiceScan = !!transcribed_text;

  return (
    <div className="min-h-screen p-6" style={{ background: '#faf8f3' }}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 font-semibold flex items-center gap-2 hover:gap-4 transition-all rounded-full px-6 py-3"
          style={{
            color: '#2d5016',
            background: 'white',
            border: '2px solid #e8dfd0'
          }}
        >
          ← {language === 'en' ? 'Back to Home' : 'होम पर वापस'}
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
            boxShadow: '0 6px 16px rgba(74, 124, 44, 0.3)'
          }}>
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'Scan Results' : 'स्कैन परिणाम'}
          </h1>
        </div>

        {/* Material Detection */}
        <div className="card mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-5">♻️</div>
          <h2 className="text-2xl font-bold mb-3 relative z-10" style={{ color: '#2d5016' }}>
            {displayMaterial}
          </h2>
          
          {/* Show material category badge */}
          {raw_detection && material && raw_detection !== material && (
            <div className="mb-3 inline-block px-4 py-1 rounded-full text-sm font-semibold relative z-10" style={{
              background: 'rgba(74, 124, 44, 0.1)',
              color: '#2d5016',
              border: '1px solid #87a878'
            }}>
              Category: {material}
            </div>
          )}
          
          {/* Show transcribed text for voice scans */}
          {isVoiceScan && transcribed_text && (
            <div className="mb-4 p-4 rounded-xl relative z-10" style={{
              background: 'linear-gradient(135deg, rgba(216, 121, 65, 0.1) 0%, rgba(193, 69, 67, 0.05) 100%)',
              border: '2px solid #e8dfd0'
            }}>
              <p className="text-sm mb-1" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? '🎤 Your Question:' : '🎤 आपका प्रश्न:'}
              </p>
              <p className="font-semibold italic" style={{ color: '#2d5016' }}>"{transcribed_text}"</p>
            </div>
          )}
          
          <div className="flex gap-4 text-sm relative z-10 flex-wrap">
            <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
              <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Confidence:' : 'विश्वास:'}</span>
              <span className="font-bold ml-2" style={{ color: '#2d5016' }}>{confidence ? (confidence * 100).toFixed(1) : '100.0'}%</span>
            </div>
            {!isVoiceScan && (
              <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Cleanliness:' : 'स्वच्छता:'}</span>
                <span className="font-bold ml-2" style={{ color: '#2d5016' }}>{cleanliness_score?.toFixed ? cleanliness_score.toFixed(0) : cleanliness_score}%</span>
              </div>
            )}
            <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
              <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Hazard:' : 'खतरा:'}</span>
              <span className={`font-bold ml-2`} style={{ color: hazard_class ? '#c14543' : '#2d5016' }}>
                {hazard_class || (language === 'en' ? 'None' : 'कोई नहीं')}
              </span>
            </div>
          </div>
        </div>

        {/* Hazard Warning */}
        {hazard_class === 'hazardous' && hazard_notes && (
          <div className="p-4 rounded-2xl mb-6 text-white" style={{
            background: 'linear-gradient(135deg, #c14543 0%, #d87941 100%)',
            boxShadow: '0 4px 12px rgba(193, 69, 67, 0.2)'
          }}>
            <h3 className="font-bold text-lg mb-2">⚠️ {language === 'en' ? 'Hazard Warning' : 'खतरे की चेतावनी'}</h3>
            <p>{hazard_notes}</p>
          </div>
        )}

        {/* Disposal Instructions */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-3" style={{ color: '#2d5016' }}>
            ♻️ {language === 'en' ? 'Disposal Instructions' : 'निपटान निर्देश'}
          </h3>
          <div className="p-4 rounded-xl" style={{ 
            background: 'rgba(180, 212, 165, 0.08)',
            border: '2px solid #e8dfd0'
          }}>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#5f7c4d' }}>
              {formatMarkdownText(disposal_instruction) || (language === 'en' ? 'Dispose of this item responsibly.' : 'इस वस्तु को जिम्मेदारी से निपटाएं।')}
            </p>
          </div>
        </div>

        {/* Environmental Impact */}
        {environmental_impact && (
        <div className="card mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-7xl opacity-5">🌍</div>
          <h3 className="text-xl font-bold mb-4 relative z-10" style={{ color: '#2d5016' }}>
            🌿 {language === 'en' ? 'Environmental Impact' : 'पर्यावरणीय प्रभाव'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="p-4 bg-white rounded-xl" style={{ boxShadow: '0 2px 8px rgba(74, 124, 44, 0.1)' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(74, 124, 44, 0.2) 0%, rgba(135, 168, 120, 0.1) 100%)'
                }}>
                  <span className="text-2xl">☁️</span>
                </div>
                <div className="text-sm mb-1" style={{ color: '#5f7c4d' }}>
                  {language === 'en' ? 'CO₂ Saved' : 'CO₂ बचत'}
                </div>
                <div className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                  {(environmental_impact.co2_saved_kg || 0).toFixed(2)}
                </div>
                <div className="text-xs" style={{ color: '#87a878' }}>kg</div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl" style={{ boxShadow: '0 2px 8px rgba(74, 124, 44, 0.1)' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(168, 197, 221, 0.3) 0%, rgba(180, 212, 165, 0.15) 100%)'
                }}>
                  <span className="text-2xl">💧</span>
                </div>
                <div className="text-sm mb-1" style={{ color: '#5f7c4d' }}>
                  {language === 'en' ? 'Water Saved' : 'जल बचत'}
                </div>
                <div className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                  {(environmental_impact.water_saved_liters || 0).toFixed(2)}
                </div>
                <div className="text-xs" style={{ color: '#87a878' }}>liters</div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl" style={{ boxShadow: '0 2px 8px rgba(74, 124, 44, 0.1)' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.2) 0%, rgba(135, 168, 120, 0.1) 100%)'
                }}>
                  <span className="text-2xl">🗑️</span>
                </div>
                <div className="text-sm mb-1" style={{ color: '#5f7c4d' }}>
                  {language === 'en' ? 'Landfill Saved' : 'लैंडफिल बचत'}
                </div>
                <div className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                  {(environmental_impact.landfill_saved_kg || 0).toFixed(2)}
                </div>
                <div className="text-xs" style={{ color: '#87a878' }}>kg</div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Estimated Credits */}
                {/* Estimated Credits */}
        <div className="card mb-6 text-white" style={{
          background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
          boxShadow: '0 6px 20px rgba(45, 80, 22, 0.25)'
        }}>
          <h3 className="text-xl font-bold mb-3">
            🪙 {language === 'en' ? 'Estimated Credits' : 'अनुमानित क्रेडिट'}
          </h3>
          <p className="text-4xl font-bold">{estimated_credits || 0}</p>
          <p className="text-sm opacity-90 mt-2">
            {language === 'en' ? 'Tokens will be added after verification' : 'सत्यापन के बाद टोकन जोड़े जाएंगे'}
          </p>
        </div>

        {/* RAG Knowledge Sources */}
        {(globalDocs?.length > 0 || personalDocs?.length > 0) && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold mb-3" style={{ color: '#2d5016' }}>
              📚 {language === 'en' ? 'Knowledge Sources' : 'ज्ञान स्रोत'}
            </h3>
            
            {globalDocs?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2" style={{ color: '#5f7c4d' }}>
                  {language === 'en' ? 'Global Knowledge' : 'वैश्विक ज्ञान'}
                </h4>
                <ul className="space-y-2 text-sm">
                  {globalDocs.map((doc, i) => (
                    <li key={i} className="p-3 rounded-lg" style={{ 
                      background: 'rgba(180, 212, 165, 0.08)',
                      color: '#5f7c4d'
                    }}>
                      • {doc.content?.substring(0, 100)}...
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {personalDocs?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#5f7c4d' }}>
                  {language === 'en' ? 'Personal Insights' : 'व्यक्तिगत अंतर्दृष्टि'}
                </h4>
                <ul className="space-y-2 text-sm">
                  {personalDocs.map((doc, i) => (
                    <li key={i} className="p-3 rounded-lg" style={{ 
                      background: 'rgba(180, 212, 165, 0.08)',
                      color: '#5f7c4d'
                    }}>
                      • {doc.content?.substring(0, 100)}...
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Nearby Recyclers */}
        {recycler_ranking?.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2d5016' }}>
              📍 {language === 'en' ? 'Nearby Recyclers' : 'निकटतम रीसाइकलर'}
            </h3>
            <div className="space-y-4">
              {recycler_ranking.slice(0, 3).map((recycler, i) => (
                <div key={i} className="p-4 rounded-xl relative overflow-hidden" style={{
                  background: 'white',
                  border: '2px solid #e8dfd0',
                  boxShadow: '0 2px 8px rgba(74, 124, 44, 0.1)'
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-lg" style={{ color: '#2d5016' }}>{recycler.name}</p>
                      <p className="text-sm mt-1" style={{ color: '#5f7c4d' }}>{recycler.address}</p>
                    </div>
                    {i === 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{
                        background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                        boxShadow: '0 2px 8px rgba(74, 124, 44, 0.3)'
                      }}>
                        {language === 'en' ? 'NEAREST' : 'निकटतम'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-sm mt-3 flex-wrap">
                    <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                      <span style={{ color: '#5f7c4d' }}>📏 Distance:</span>
                      <span className="font-bold ml-1" style={{ color: '#2d5016' }}>{recycler.distance_km?.toFixed(1)} km</span>
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                      <span style={{ color: '#5f7c4d' }}>⏱️ Time:</span>
                      <span className="font-bold ml-1" style={{ color: '#2d5016' }}>~{recycler.estimated_travel_time_min?.toFixed(0)} min</span>
                    </div>
                    {recycler.rating && (
                      <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                        <span style={{ color: '#5f7c4d' }}>⭐ Rating:</span>
                        <span className="font-bold ml-1" style={{ color: '#2d5016' }}>{recycler.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  {recycler.phone && (
                    <p className="text-sm mt-3" style={{ color: '#5f7c4d' }}>
                      <span>📞 Phone:</span>
                      <span className="ml-1 font-semibold" style={{ color: '#2d5016' }}>{recycler.phone}</span>
                    </p>
                  )}
                  
                  {recycler.operating_hours && (
                    <p className="text-sm mt-1" style={{ color: '#5f7c4d' }}>
                      <span>🕒 Hours:</span>
                      <span className="ml-1 font-semibold" style={{ color: '#2d5016' }}>{recycler.operating_hours}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                if (recycler_ranking?.length > 0) {
                  navigate('/map', { 
                    state: { 
                      recyclers: recycler_ranking,
                      material: material 
                    } 
                  });
                }
              }}
              className="w-full mt-4 font-semibold rounded-full py-3 hover:scale-105 transition-all"
              style={{
                background: 'linear-gradient(135deg, #87a878 0%, #5f7c4d 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(135, 168, 120, 0.3)'
              }}
            >
              🗺️ {language === 'en' ? 'Show All on Map' : 'मानचित्र पर सभी दिखाएं'}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/map', { 
              state: { 
                recyclers: recycler_ranking,
                material: material 
              } 
            })} 
            className="w-full text-lg py-4 font-bold rounded-full hover:scale-105 transition-all"
            style={{
              background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(74, 124, 44, 0.3)'
            }}
          >
            🗺️ {language === 'en' ? 'Explore Map & Find Recyclers' : 'मानचित्र देखें और रीसाइकलर खोजें'}
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/scan')} 
              className="font-semibold rounded-full py-3 hover:scale-105 transition-all"
              style={{
                background: 'white',
                color: '#2d5016',
                border: '2px solid #e8dfd0',
                boxShadow: '0 2px 8px rgba(74, 124, 44, 0.1)'
              }}
            >
              📸 {language === 'en' ? 'Scan Again' : 'फिर से स्कैन करें'}
            </button>
            <button 
              onClick={() => navigate('/voice')} 
              className="font-semibold rounded-full py-3 hover:scale-105 transition-all"
              style={{
                background: 'linear-gradient(135deg, #d87941 0%, #c14543 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(216, 121, 65, 0.3)'
              }}
            >
              🎤 {language === 'en' ? 'Voice' : 'आवाज़'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;