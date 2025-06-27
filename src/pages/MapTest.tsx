import Header from '@/components/Header';
import GoogleMapsTest from '@/components/GoogleMapsTest';

const MapTest = () => {
  return (
    <div>
      <Header title="Google Maps API Test" showBackButton />
      
      <div className="fuzo-page">
        <div className="fuzo-container">
          <GoogleMapsTest />
        </div>
      </div>
    </div>
  );
};

export default MapTest; 