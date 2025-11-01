import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { pageRoutes } from './routes';
import { routeTypes } from '../types';
import Layout from '../layout/Layout';
import Loading from '../Components_old/Loading';
import { withConditionalRoute } from '@ethos-frontend/hoc';
import { ROUTES } from '../helpers/constants';

function RoutesWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {pageRoutes.map((route: routeTypes) => {
          const Guarded = withConditionalRoute({
            component: () =>
              route.isPrivate ? (
                <Layout>
                  <route.Component {...route.pageProp} />
                </Layout>
              ) : (
                <route.Component {...route.pageProp} />
              ),
            redirectIfAuthenticated: !route.isPrivate,
            redirectTo: route.isPrivate ? ROUTES.LOGIN : ROUTES.DASHBOARD,
          });

          return <Route key={route.id} path={route.path} element={<Guarded />} />;
        })}
        <Route path="*" element={<div>Error Screen here</div>} />
      </Routes>
    </Suspense>
  );
}

export default RoutesWrapper;
