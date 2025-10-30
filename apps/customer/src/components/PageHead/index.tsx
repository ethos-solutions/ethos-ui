import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

type PageHeadProps = {
  title: string;
  description?: string;
  keywords?: string;
  restaurantName?: string;
};

export function PageHead({ ...props }: PageHeadProps) {
  const { t } = useTranslation();
  const pageTitle = props.restaurantName
    ? `${props.restaurantName} - ${t(props.title)}`
    : t(props.title);
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={props.description || ''} />
      <meta name="keywords" content={props.keywords} />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
  );
}
