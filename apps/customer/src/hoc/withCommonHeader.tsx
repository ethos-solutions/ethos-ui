import React, { useEffect, useState } from 'react';
import { PageTemplate } from '../components';
import { Header, SecondaryHeader } from '../components/Header';
import { getStorage } from '@ethos-frontend/utils';
import { footerClass } from '../constant';

interface PageTemplateProps {
  title: string;
  description: string;
}

interface WithCommonHeaderOptions {
  headerType?: 'default' | 'secondary';
}

const withCommonHeader = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithCommonHeaderOptions,
) => {
  const WithCommonHeader: React.FC<P & PageTemplateProps> = ({
    title,
    description,
    ...props
  }) => {
    const [logo, setLogo] = useState('');
    const [footerAvailable, setFooterAvailable] = useState(false);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const { logo } = JSON.parse(getStorage('restaurantData') || '{}');
        setLogo(logo);
      }
    }, []);

    useEffect(() => {
      if (typeof document !== 'undefined') {
        if (document.querySelector(`.${footerClass}`)) {
          setFooterAvailable(true);
        } else {
          setFooterAvailable(false);
        }
      }
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      
      const setDynamicHeight = () => {
        const elements = document.querySelectorAll('.sticky-footer');
        elements.forEach((element) => {
          if (element instanceof HTMLElement) {
            element.style.height = `${window.innerHeight - 140}px`;
          }
        });
      };
      setDynamicHeight();
      window.addEventListener('resize', setDynamicHeight);
      return () => {
        window.removeEventListener('resize', setDynamicHeight);
      };
    }, []);

    const headerType = options?.headerType || 'default';

    const HeaderComponent = headerType === 'default' ? Header : SecondaryHeader;

    return (
      <PageTemplate title={title} description={description}>
        <div className="container m-auto">
          <HeaderComponent logo={logo} />
          <div className="page-bg">
            <div className={`grow w-full ${footerAvailable ? 'footer' : ''}`}>
              <WrappedComponent {...(props as P)} />
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  };

  return WithCommonHeader;
};

export default withCommonHeader;
