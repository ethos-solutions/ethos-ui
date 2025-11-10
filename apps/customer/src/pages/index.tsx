import { HomePage, PageTemplate } from '../components';
import type { NextPage } from 'next';
import { getStorage } from '@ethos-frontend/utils';
import { useState, useEffect } from 'react';

const Home: NextPage = () => {
  const [restaurantName, setRestaurantName] = useState('Ethos');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { restaurantName: name } = JSON.parse(getStorage('restaurantData') || '{}');
      if (name) setRestaurantName(name);
    }
  }, []);

  return (
    <PageTemplate
      title="customer.pageTitles.home"
      description="customer.pageDescriptions.home"
      restaurantName={restaurantName}
    >
      <HomePage />
    </PageTemplate>
  );
};
export default Home;
