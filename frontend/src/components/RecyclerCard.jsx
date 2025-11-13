import React from 'react';
import { Card, Button, Badge } from './ReactBits';
import { useTranslation } from '../../node_modules/react-i18next';

const RecyclerCard = ({ recycler, onViewRoute, onSchedule }) => {
  const { t } = useTranslation();

  return (
    <Card className="flex items-center gap-4">
      <div className="text-4xl">♻️</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-forest mb-1">{recycler.name}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">{t('distance')}:</span>{' '}
            <span className="font-semibold">{recycler.distance} km</span>
          </div>
          <div>
            <span className="text-gray-600">{t('eta')}:</span>{' '}
            <span className="font-semibold">{recycler.eta} mins</span>
          </div>
          <div>
            <span className="text-gray-600">{t('price')}:</span>{' '}
            <span className="font-semibold">₹{recycler.price}/kg</span>
          </div>
          {recycler.rating && (
            <div>
              <span className="text-gray-600">Rating:</span>{' '}
              <span className="font-semibold">⭐ {recycler.rating}</span>
            </div>
          )}
        </div>
        {recycler.materials && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recycler.materials.map((material, i) => (
              <Badge key={i} variant="success" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {onViewRoute && (
          <Button variant="outline" onClick={() => onViewRoute(recycler)} className="text-sm px-4 py-2">
            {t('view_route')}
          </Button>
        )}
        {onSchedule && (
          <Button variant="primary" onClick={() => onSchedule(recycler)} className="text-sm px-4 py-2">
            {t('schedule')}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default RecyclerCard;
