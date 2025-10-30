import {
  Backdrop,
  Modal as BaseModal,
  Box,
  Fade,
  ModalProps,
  SxProps,
} from '@mui/material';
import { FC } from 'react';
import theme from '../theme/theme';
import { Heading } from '../typography';
import { Iconbutton } from '../iconButton';

export interface BaseModalProps extends ModalProps {
  title?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  size?: 'xs' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const getModalStyle = (size?: 'xs' | 'md' | 'lg' | 'xl'): SxProps => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '95%', // Mobile phones
    sm: '90%', // Small tablets
    md: size === 'xs'
      ? '90%'
      : size === 'md'
      ? '550px'
      : size === 'lg'
      ? '800px'
      : size === 'xl'
      ? '1200px'
      : '400px',
  },
  maxWidth: {
    xs: '100%',
    sm: '100%',
    md: size === 'md' ? '550px' : size === 'lg' ? '800px' : size === 'xl' ? '1200px' : '400px',
  },
  bgcolor: theme.palette.common.white,
  borderRadius: '8px',
  boxShadow: 24,
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: {
    xs: '95vh', // Mobile - leave some space at top/bottom
    sm: '90vh', // Tablet
    md: '90%',  // Desktop
  },
});

const modalHeaderStyle: SxProps = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  p: '20px',
  borderBottom: '1px solid #e6e6e6',
};

const modalContentStyle: SxProps = {
  overflowY: 'auto',
  flexGrow: 1,
  padding: '20px',
};

const Modal: FC<BaseModalProps> = ({
  open,
  onClose,
  ariaLabel,
  ariaDescription,
  children,
  title,
  size = 'xs',
  showCloseButton = true,
  ...props
}) => {
  const handleIconClose = () => {
    if (onClose) {
      onClose({}, 'escapeKeyDown');
    }
  };
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby={ariaLabel}
      aria-describedby={ariaDescription}
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      {...props}
    >
      <Fade in={open}>
        <Box sx={getModalStyle(size)}>
          {title && showCloseButton && (
            <Box sx={modalHeaderStyle}>
              {title && (
                <Heading variant="h4" weight="semibold">
                  {title}
                </Heading>
              )}
              {showCloseButton && (
                <Iconbutton
                  aria-label="close"
                  onClick={handleIconClose}
                  name="close"
                />
              )}
            </Box>
          )}
          <Box sx={modalContentStyle}>{children}</Box>
        </Box>
      </Fade>
    </BaseModal>
  );
};

Modal.displayName = 'Modal';
export default Modal;
