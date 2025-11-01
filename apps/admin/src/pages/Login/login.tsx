import { GridContainer, LoginForm } from "@ethos-frontend/components";
import { Heading } from "@ethos-frontend/ui";
import { EthosLogo } from "@ethos-frontend/assets";
import { useRestMutation } from "@ethos-frontend/hook";
import { API_URL, API_METHODS } from "@ethos-frontend/constants";
import {
  getNumberOfCols,
  handleError,
  handleSuccess,
  useResponsive,
} from "@ethos-frontend/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../helpers/constants";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDesktop, isMobile } = useResponsive();

  const { mutate, isPending } = useRestMutation(
    API_URL.login,
    { method: API_METHODS.POST },
    {
      onSuccess: (res) => {
        handleSuccess(res, t("success.login"), navigate, ROUTES.DASHBOARD);
        localStorage.setItem("userData", JSON.stringify(res.data));
      },
      onError: (err) => {
        handleError(err);
      },
    }
  );

  const onSubmit = (data: Record<string, unknown>) => {
    mutate(data);
  };

  return (
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
          <EthosLogo width={200} className="h-12 mx-auto" />
          <Heading variant="h3" weight="bold">
            {t("auth.signInTitle")}
          </Heading>
          <LoginForm onSubmit={onSubmit} loading={isPending} />
        </div>
      </div>
    </GridContainer>
  );
}
