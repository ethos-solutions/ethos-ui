import { Heading, PrimaryButton } from '@ethos-frontend/ui';
import { GridContainer, LoginForm } from '@ethos-frontend/components';
import { EthosLogo } from '@ethos-frontend/assets';
import { useRestMutation } from '@ethos-frontend/hook';
import { API_METHODS, ORDER_SCREEN_API_URL } from '@ethos-frontend/constants';
import { useNavigate } from 'react-router-dom';
import {
  getNumberOfCols,
  handleError,
  handleSuccess,
  useResponsive,
} from '@ethos-frontend/utils';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ForgetPasswordModal } from './forgetPasswordModal';

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDesktop, isMobile } = useResponsive();
  const [forgetPasswordModal, setForgetPasswordModal] = useState(false);

  const { mutate } = useRestMutation(
    ORDER_SCREEN_API_URL.login,
    { method: API_METHODS.POST },
    {
      onSuccess: (res) => {
        handleSuccess(res, t('success.login'), navigate);
        localStorage.setItem('logo', res.data.imageUrl);
        localStorage.setItem('orgName', res.data.orgName);
        localStorage.setItem('name', res.data.restaurantName);
      },
      onError: (err) => {
        handleError(err);
      },
    },
  );

  const onSubmit = (data: Record<string, unknown>) => {
    mutate(data);
  };

  return (
    <>
      <GridContainer
        columns={getNumberOfCols({
          isDesktop,
          isMobile,
          mobileCol: 4,
          desktopCol: 8,
        })}
        className="h-screen"
      >
        <div className="xl:col-start-4 xl:col-end-6 col-start-1 col-end-9 sm:py-10 p-5 grid items-center">
          <div className="flex flex-col gap-5 w-full md:w-80 mx-auto">
            <EthosLogo className="h-12 mx-auto" />
            <Heading variant="h3" weight="bold">
              Customer Order Status  
            </Heading>
            <Heading variant="h4" weight="bold">
              {t('auth.signIn')}
            </Heading>
            <LoginForm onSubmit={onSubmit} orderStatus={true} />
            <div className="flex justify-center">
              <PrimaryButton
                variant="text"
                onClick={() => setForgetPasswordModal(true)}
              >
                {t('auth.forgotPassword')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </GridContainer>
      <ForgetPasswordModal
        forgetPasswordModal={forgetPasswordModal}
        setForgetPasswordModal={setForgetPasswordModal}
      />
    </>
  );
};
