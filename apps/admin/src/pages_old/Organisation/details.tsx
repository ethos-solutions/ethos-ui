import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { Heading, Iconbutton, Paragraph } from '@ethos-frontend/ui';
import { useRestQuery } from '@ethos-frontend/hook';
import { API_URL } from '@ethos-frontend/constants';
import Loading from '../../components/Loading';
import { GridContainer } from '@ethos-frontend/components';
import { getNumberOfCols, useResponsive } from '@ethos-frontend/utils';
import { ArrowBack } from '@mui/icons-material';
import styles from './styles.module.scss';

export default function Details() {
  const navigate = useNavigate();
  const { isDesktop, isMobile } = useResponsive();
  const { id } = useParams();
  const { data, isLoading } = useRestQuery<any>(
    ['org-detail', id],
    `${API_URL.deleteOrGetOrg}/detail/${id}`,
  );

  if (isLoading) {
    return <Loading />;
  }

  const detailsData = data?.data || {};

  return (
    <>
      <div className={styles.header}>
        <Iconbutton
          MuiIcon={ArrowBack}
          size="medium"
          text="Organisation Details"
          className="pb-5"
          onClick={() => navigate(-1)}
        />
      </div>
      <GridContainer
        columns={getNumberOfCols({
          isDesktop,
          isMobile,
          mobileCol: 4,
          desktopCol: 4,
        })}
      >
        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Organisation Name
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.orgName || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Organisation Number
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.orgNumber || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Business Type
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.businessType || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Owner Name
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.ownerFName && detailsData?.ownerLName
              ? `${detailsData.ownerFName} ${detailsData.ownerLName}`
              : '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Email
          </Heading>
          <Paragraph variant="subtitle1">{detailsData?.email || '-'}</Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Phone
          </Heading>
          <Paragraph variant="subtitle1">{detailsData?.phone || '-'}</Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Home Number
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.homeNumber || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Address
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.address || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Zipcode
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.zipcode || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            State
          </Heading>
          <Paragraph variant="subtitle1">{detailsData?.state || '-'}</Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            City
          </Heading>
          <Paragraph variant="subtitle1">{detailsData?.city || '-'}</Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Country
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.country || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Code
          </Heading>
          <Paragraph variant="subtitle1">{detailsData?.code || '-'}</Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Commission Type
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.commissionType || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Commission Value
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.commissionValue || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Commission Flat Value
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.commissionFlatValue || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Commission Percent Value
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.commissionPercentValue || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Stripe Connect AcctId
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.stripeConnectAcctId || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Stripe Connect Status
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.stripeConnectStatus || '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Stripe Payout Status
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.stripePayoutStatus ? 'True' : '-'}
          </Paragraph>
        </Box>

        <Box>
          <Heading variant="subtitle2" color="secondary" weight="medium">
            Created At
          </Heading>
          <Paragraph variant="subtitle1">
            {detailsData?.createdAt
              ? dayjs(detailsData.createdAt).format('MMM DD YYYY')
              : '-'}
          </Paragraph>
        </Box>
      </GridContainer>
    </>
  );
}
