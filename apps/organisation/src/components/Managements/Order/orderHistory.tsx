import { IOrderDetails } from './payCounter';
import { Card } from '@ethos-frontend/components';
import { Stepper } from '@ethos-frontend/ui';
import { CircularProgress } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import { useSocket } from '../../../context/socket';
import { formatDateTime } from '@ethos-frontend/utils';
import { ORDER_STATUS } from '@ethos-frontend/constants';
import { t } from 'i18next';
interface IOrderHistory {
  orderDetailsData: IOrderDetails;
  refetch: () => void;
}

interface Step {
  label: JSX.Element;
  description: JSX.Element | null;
}

const statusMap: { [key in ORDER_STATUS]: number } = {
  [ORDER_STATUS.RECEIVED]: 0,
  [ORDER_STATUS.PROGRESS]: 1,
  [ORDER_STATUS.READY]: 2,
  [ORDER_STATUS.COMPLETED]: 3,
  [ORDER_STATUS.CANCELLED]: 4,
  [ORDER_STATUS.REFUNDED]: 5,
};

const initialSteps: Step[] = [
  {
    label: <div>{t('order.orderReceived')}</div>,
    description: null,
  },
  {
    label: <div>{t('order.orderProgress')}</div>,
    description: null,
  },
  {
    label: <div>{t('order.ready')}</div>,
    description: null,
  },
  {
    label: <div>{t('order.completed')}</div>,
    description: null,
  },
];

export const OrderHistory = ({ orderDetailsData, refetch }: IOrderHistory) => {
  const { socket } = useSocket();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepsWithDates, setStepsWithDates] = useState<Step[]>(initialSteps);

  const normalSteps = initialSteps.slice(0, 4);

  // the single "Cancel" step
  const cancelStep: Step = {
    label: <div>{t('order.cancel')}</div>,
    description: null,
  };

  // the single "Refunded" step
  const refundedStep: Step = {
    label: <div>{t('order.refunded')}</div>,
    description: null,
  };

  const updateStepsWithSocketData = (status: string, createdAt: string) => {
    console.log('status');
    if (status === ORDER_STATUS.CANCELLED) {
      // only show the Cancel step
      setStepsWithDates([
        {
          ...cancelStep,
          description: <div>{formatDateTime(createdAt)}</div>,
        },
      ]);
      setActiveStep(0);
      return;
    }
    if (status === ORDER_STATUS.REFUNDED) {
      // only show the Refunded step
      setStepsWithDates([
        {
          ...refundedStep,
          description: <div>{formatDateTime(createdAt)}</div>,
        },
      ]);
      setActiveStep(0);
      return;
    }
    const stepIndex = statusMap[status as ORDER_STATUS];
    const updatedSteps = stepsWithDates.map((step, index) => {
      if (index === stepIndex) {
        return {
          ...step,
          description: <div>{formatDateTime(createdAt)}</div>,
        };
      }
      return step;
    });

    setStepsWithDates(updatedSteps);
    setActiveStep(
      status === ORDER_STATUS.COMPLETED ? stepIndex + 1 : stepIndex,
    );
  };

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: string) => {
        const newOrder = JSON.parse(message);

        // Update stepper based on received data
        updateStepsWithSocketData(newOrder.status, newOrder.createdAt);
        refetch();
      });

      return () => {
        socket.off('message');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (!Array.isArray(orderDetailsData.statusHistory)) return;
  
    // find a Refunded entry (takes priority over Cancel)
    const refundedEntry = orderDetailsData.statusHistory
      .find(e => e.status === ORDER_STATUS.REFUNDED);
  
    if (refundedEntry) {
      // only render Refunded
      setStepsWithDates([{
        ...refundedStep,
        description: <div>{formatDateTime(refundedEntry.date)}</div>
      }]);
      setActiveStep(0);
      return;
    }

    // find a Cancel entry
    const cancelEntry = orderDetailsData.statusHistory
      .find(e => e.status === ORDER_STATUS.CANCELLED);
  
    if (cancelEntry) {
      // only render Cancel
      setStepsWithDates([{
        ...cancelStep,
        description: <div>{formatDateTime(cancelEntry.date)}</div>
      }]);
      setActiveStep(0);
      return;
    }
  
    // no cancellation → build the 4‐step flow
    const sorted = [...orderDetailsData.statusHistory]
      .sort((a, b) => parseInt(a.date) - parseInt(b.date));
  
    const updated = normalSteps.map((step, idx) => {
      const entry = sorted.find(e => statusMap[e.status as ORDER_STATUS] === idx);
      return entry
        ? { ...step, description: <div>{formatDateTime(entry.date)}</div> }
        : step;
    });
  
    setStepsWithDates(updated);
  
    // compute final active step index
    const last = sorted[sorted.length - 1].status as ORDER_STATUS;
    const lastIdx = statusMap[last];
    setActiveStep(
      last === ORDER_STATUS.COMPLETED ? lastIdx + 1 : lastIdx
    );
  }, [orderDetailsData]);

  if (!orderDetailsData) {
    return <CircularProgress />;
  }

  return (
    <Card title={t('order.history')}>
      <Stepper
        orientation="vertical"
        steps={stepsWithDates}
        activeStep={activeStep}
      />
    </Card>
  );
};
