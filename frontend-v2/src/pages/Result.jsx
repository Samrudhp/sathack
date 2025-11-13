import { useNavigate } from 'react-router-dom';
import { useScanStore, useUserStore } from '../store';

export default function Result() {
  const navigate = useNavigate();
  const { currentScan, globalDocs, personalDocs } = useScanStore();
  const { language } = useUserStore();

  if (!currentScan) {
    return (
      <div className="min-h-screen bg-beige p-6 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-xl text-forest font-semibold">
            {language === 'en' ? 'No scan data found' : 'कोई स्कैन डेटा नहीं मिला'}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            {language === 'en' ? 'Go Home' : 'होम पर जाएं'}
          </button>
        </div>
      </div>
    );
  }

  const {
    material,
    confidence,
    cleanliness_score,
    hazard_class,
    disposal_instruction,
    hazard_notes,
    estimated_credits,
    environmental_impact,
    recycler_ranking,
  } = currentScan;

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-forest font-semibold flex items-center gap-2 hover:gap-4 transition-all"
        >
          ← {language === 'en' ? 'Back to Home' : 'होम पर वापस'}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          📊 {language === 'en' ? 'Scan Results' : 'स्कैन परिणाम'}
        </h1>

        {/* Material Detection */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-forest mb-3">
            {material}
          </h2>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-olive-dark">{language === 'en' ? 'Confidence:' : 'विश्वास:'}</span>
              <span className="font-bold ml-2">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-olive-dark">{language === 'en' ? 'Cleanliness:' : 'स्वच्छता:'}</span>
              <span className="font-bold ml-2">{cleanliness_score?.toFixed ? cleanliness_score.toFixed(0) : cleanliness_score}%</span>
            </div>
            <div>
              <span className="text-olive-dark">{language === 'en' ? 'Hazard:' : 'खतरा:'}</span>
              <span className={`font-bold ml-2 ${hazard_class ? 'text-hazard' : 'text-forest'}`}>
                {hazard_class || (language === 'en' ? 'None' : 'कोई नहीं')}
              </span>
            </div>
          </div>
        </div>

        {/* Hazard Warning */}
        {hazard_class === 'hazardous' && hazard_notes && (
          <div className="bg-hazard text-white p-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-2">⚠️ {language === 'en' ? 'Hazard Warning' : 'खतरे की चेतावनी'}</h3>
            <p>{hazard_notes}</p>
          </div>
        )}

        {/* Disposal Instructions */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-forest mb-3">
            ♻️ {language === 'en' ? 'Disposal Instructions' : 'निपटान निर्देश'}
          </h3>
          <p className="text-forest leading-relaxed whitespace-pre-wrap">
            {disposal_instruction}
          </p>
        </div>

        {/* Environmental Impact */}
        {environmental_impact && (
          <div className="card bg-olive-light mb-6">
            <h3 className="text-xl font-bold text-forest mb-3">
              🌍 {language === 'en' ? 'Environmental Impact' : 'पर्यावरणीय प्रभाव'}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-forest">{environmental_impact.co2_saved_kg.toFixed(1)}</p>
                <p className="text-sm text-olive-dark">{language === 'en' ? 'kg CO₂ saved' : 'kg CO₂ बचाया'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forest">{environmental_impact.water_saved_liters.toFixed(0)}</p>
                <p className="text-sm text-olive-dark">{language === 'en' ? 'Liters water saved' : 'लीटर पानी बचाया'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forest">{environmental_impact.landfill_saved_kg.toFixed(1)}</p>
                <p className="text-sm text-olive-dark">{language === 'en' ? 'kg from landfill' : 'kg लैंडफिल से बचाया'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Credits */}
        {estimated_credits > 0 && (
          <div className="card bg-forest text-white mb-6">
            <h3 className="text-xl font-bold mb-2">
              🪙 {language === 'en' ? 'Estimated Tokens' : 'अनुमानित टोकन'}
            </h3>
            <p className="text-3xl font-bold">{estimated_credits} tokens</p>
            <p className="text-sm opacity-90 mt-2">
              {language === 'en' 
                ? 'Take to recycler to earn tokens!' 
                : 'टोकन कमाने के लिए रीसाइकलर के पास ले जाएं!'}
            </p>
          </div>
        )}

        {/* RAG Knowledge Sources */}
        {(globalDocs?.length > 0 || personalDocs?.length > 0) && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-forest mb-3">
              📚 {language === 'en' ? 'Knowledge Sources' : 'ज्ञान स्रोत'}
            </h3>
            
            {globalDocs?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-olive-dark mb-2">
                  {language === 'en' ? 'Global Knowledge' : 'वैश्विक ज्ञान'}
                </h4>
                <ul className="space-y-1 text-sm">
                  {globalDocs.map((doc, i) => (
                    <li key={i} className="text-forest">• {doc.content?.substring(0, 100)}...</li>
                  ))}
                </ul>
              </div>
            )}
            
            {personalDocs?.length > 0 && (
              <div>
                <h4 className="font-semibold text-olive-dark mb-2">
                  {language === 'en' ? 'Personal Insights' : 'व्यक्तिगत अंतर्दृष्टि'}
                </h4>
                <ul className="space-y-1 text-sm">
                  {personalDocs.map((doc, i) => (
                    <li key={i} className="text-forest">• {doc.content?.substring(0, 100)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Nearby Recyclers */}
        {recycler_ranking?.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-forest mb-3">
              📍 {language === 'en' ? 'Nearby Recyclers' : 'निकटतम रीसाइकलर'}
            </h3>
            <div className="space-y-3">
              {recycler_ranking.slice(0, 3).map((recycler, i) => (
                <div key={i} className="p-4 bg-beige rounded-lg border-2 border-olive-light">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-forest text-lg">{recycler.name}</p>
                      <p className="text-sm text-olive-dark mt-1">{recycler.address}</p>
                    </div>
                    {i === 0 && (
                      <span className="bg-forest text-white px-3 py-1 rounded-full text-xs font-bold">
                        {language === 'en' ? 'NEAREST' : 'निकटतम'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-sm mt-3">
                    <div>
                      <span className="text-olive-dark">📏 Distance:</span>
                      <span className="font-bold ml-1">{recycler.distance_km?.toFixed(1)} km</span>
                    </div>
                    <div>
                      <span className="text-olive-dark">⏱️ Time:</span>
                      <span className="font-bold ml-1">~{recycler.estimated_travel_time_min?.toFixed(0)} min</span>
                    </div>
                    {recycler.rating && (
                      <div>
                        <span className="text-olive-dark">⭐ Rating:</span>
                        <span className="font-bold ml-1">{recycler.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  {recycler.phone && (
                    <p className="text-sm mt-2">
                      <span className="text-olive-dark">📞 Phone:</span>
                      <span className="ml-1">{recycler.phone}</span>
                    </p>
                  )}
                  
                  {recycler.operating_hours && (
                    <p className="text-sm mt-1">
                      <span className="text-olive-dark">🕒 Hours:</span>
                      <span className="ml-1">{recycler.operating_hours}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Show on Map Button */}
            <button
              onClick={() => navigate('/map', { 
                state: { 
                  recyclers: recycler_ranking,
                  material: material,
                  userLocation: { lat: currentScan?.location?.lat, lon: currentScan?.location?.lon }
                }
              })}
              className="btn-secondary w-full mt-4"
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
            className="btn-primary w-full text-lg py-4"
          >
            🗺️ {language === 'en' ? 'Explore Map & Find Recyclers' : 'मानचित्र देखें और रीसाइकलर खोजें'}
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/scan')} className="btn-secondary">
              📸 {language === 'en' ? 'Scan Again' : 'फिर से स्कैन करें'}
            </button>
            <button onClick={() => navigate('/voice')} className="btn-secondary">
              🎤 {language === 'en' ? 'Voice' : 'आवाज़'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
